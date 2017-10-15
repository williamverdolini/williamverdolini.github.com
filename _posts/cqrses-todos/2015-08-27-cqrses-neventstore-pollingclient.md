---
layout: wvpost
title: "CQRS+ES Todo List"
tagline: NEventStore PollingClient
header: NEventStore PollingClient
description: Tech, CQRS+ES, NEventStore, PollingClient, Castle Windsor
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES,NEventStore,PollingClient,Castle Windsor]
---
{% include JB/setup %}

Let’s look at the solution build log: there’s a warning:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
6>------ Rebuild All started: Project: Web.UI, Configuration: Debug Any CPU ------
6>D:\Sviluppo\CQRS-ES-Todos\Web.UI\Injection\Installers\EventStoreInstaller.cs(86,21,86,57): warning CS0618: 'NEventStore.DispatcherWireupExtensions.UsingSynchronousDispatchScheduler(NEventStore.Wireup)' is obsolete: 'This will be removed in v6 https://github.com/NEventStore/NEventStore/issues/360'
6>  Web.UI -> D:\Sviluppo\CQRS-ES-Todos\Web.UI\bin\Web.UI.dll
========== Rebuild All: 6 succeeded, 0 failed, 0 skipped ==========
]]></script> 


If you follow <a href="https://github.com/NEventStore/NEventStore/issues/360" target="_blank">the link in the warning</a> you can read a very detailed description of the issues of using sync and async NeventStore event dispatcher. In summary, there could be a problem in the order in which events (in very rapid sequence) are dispatched.


To overcome this issue, <a href="https://github.com/damianh" target="_blank">Damian Hickey</a> suggests:

> The only way to guarantee the order is to read from the store separately

To do that, in the next version 6 of NEventStore, we will be able to use an improved EventStoreClient; in the meanwhile another solution could be used: <a href="https://github.com/NEventStore/NEventStore/issues/390" target="_blank">PollingClient</a>.

With this solution there is a real separation between command stack and query stack(s), because the read model is setup as a client for consuming events for its own purposes; this means that the read model stores the checkpoint of the last event consumed and periodically check the Event store for new events. When this occurs the PollingClient starts a process to consume the new events and store the checkpoint number of the new last event consumed.
each projections should be set-up as a polling client that reads and consumes the events.

Ok, how to do that?

That has been explained by Damian Hickey in the comments of the same issue. Here it is:


<img src="{{ BASE_PATH }}/images/cqrses/dispatcher-issue-comments.png" class="img-rounded" />

In the same answers <a href="https://github.com/larsw" target="_blank">Lars Wilhelmsen</a> shows a pretty complete and absolutely understandable example about the concept expressed by Damian, so to sum up:

1. the event dispatchers are obsolete and will be removed in future versions
2. The alternative is to use the polling clients (usually to implement as services on the stack of the projections they populate). NEventStore comes with its own <a href="https://github.com/NEventStore/NEventStore/blob/master/src/NEventStore/Client/PollingClient.cs" target="_blank">PollingClient</a> that already brings within it all the logic of forced and regular activation typical of a poller
3. The PollingClient returns a stream of commits to process and passes it to an _IObserveCommits_ (<a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.QueryStack/Logic/EventObserverSubscriptionFactory.cs#L31-L43" target="_blank">code</a>) which can subscribe any specific Observer, which will process the commit stream with its own logic (<a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.QueryStack/Logic/ReadModelCommitObserver.cs" target="_blank">code</a>). From this point of view, NEventStore proves flexibility. It allows both to have one PollingClient and several Observers that can populate different projections, or, in more complex scenarios, more PollingClient that do the same thing, but each with their own frequencies, and with its own specific set of Observers.
4. In some scenario or for some projection it is important to have, when possible, a real-time (or "near-real time") update when an event occurs in the life of the application. That could be achieved by defining a <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.Infrastructure/Events/Polling/LowLatencyPollingPipelineHook.cs" target="_blank">specific PipelineHook</a> that is listening to the flow of commits on NEventStore and activates a polling cycle every time the commit it has been correctly processed by NEventStore. The devil is in the details: note that if you use a DI container, you can encounter some annoying **CircularDependencyException**. If you refer to the <a href="https://github.com/williamverdolini/CQRS-ES-Todos" target="_blank">published code</a>, the exception I came across had this very clear message:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
Castle.MicroKernel.CircularDependencyException was unhandled by user code
  HelpLink=groups.google.com/group/castle-project-users
  HResult=-2146233088
  Message=Dependency cycle has been detected when trying to resolve component 'Late bound NEventStore.IStoreEvents'.
The resolution tree that resulted in the cycle is the following:
Component 'Late bound NEventStore.IStoreEvents' resolved as dependency of
	component 'Todo.QueryStack.Logic.EventObserverSubscriptionFactory' resolved as dependency of
	component 'Late bound NEventStore.Client.IObserveCommits' resolved as dependency of
	component 'Todo.Infrastructure.Events.Polling.LowLatencyPollingPipelineHook' resolved as dependency of
	component 'Web.UI.Injection.Installers.NEventStoreFactory' resolved as dependency of
	component 'Late bound NEventStore.IStoreEvents' which is the root component being resolved.
]]></script> 

The problem is that StoreEvents has to know the PipelineHooks, which starts a cycle of polling of the PollingClient, which in turn depends on the StoreEvents, creating the most classic circular dependency. From my point of view, however, the design is correct, but we must to tell Castle.Windsor not immediately resolve the dependencies of the IObserveCommits when resolve the IStoreEvents, but to wait for the time of the actual use. To do this, I followed these steps (but <a href="http://kozmic.net/2009/11/15/castle-windsor-lazy-loading/" target="_blank">it's not the only way</a>):

<ol>
<li>Enable Castle.Windsor to resolve the dependencies in a lazy way

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
container.Register(Component.For<ILazyComponentLoader>().ImplementedBy<LazyOfTComponentLoader>());
]]></script> 
</li>
<li>
Define the dependencies of the PipelineHook as Lazy

<script type="syntaxhighlighter" class="brush: csharp;highlight: [3,5]">
<![CDATA[
public class LowLatencyPollingPipelineHook : PipelineHookBase
{
	private readonly Lazy<IObserveCommits> commitsObserver;

	public LowLatencyPollingPipelineHook(Lazy<IObserveCommits> commitsObserver)
	{
		Contract.Requires<ArgumentNullException>(commitsObserver != null, "commitsObserver");
		this.commitsObserver = commitsObserver;
	}

	public override void PostCommit(ICommit committed)
	{
		base.PostCommit(committed);
		commitsObserver.Value.PollNow();
	}
}
]]></script> 

</li>
</ol>

### In my opinion

The NEventStore guys did an amazing work, but, as they have already anticipated, there's something to do about the PollingClient. What I dislike is the way which has been thought to work with checkpoint number. In my implementation I haven't figured how to do better: so the checkpoint number <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.QueryStack/Logic/EventObserverSubscriptionFactory.cs#L34" target="_blank">is loaded and used by the PollingClient</a>, but it's <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.QueryStack/Logic/ReadModelCommitObserver.cs#L36" target="_blank">updated outside of it</a> and, with the possibility to subscribe multiple _IObserver_ it's important to define which of the observer will update the last checkpoint number (at the end of all the PollingClients cycle). I'd like to have some checkpoint-number orchestration wrapping the PollingClient or something like that. 

Anyway, Damian has already announced some news about this topic, so...I'm waiting for NEventStore version 6