---
layout: wvpost
title: "CQRS+ES Todo List"
tagline: Event Upconversion
header: Event Upconversion
description: Tech, CQRS+ES, NEventStore, Event Upconversion
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES,NEventStore,Event Upconversion]
---
{% include JB/setup %}

First of all I want to thank **<a href="http://warappa.wordpress.com/" target="_blank">David Rettenbacher</a>** and **<a href="http://stackoverflow.com/users/355785/nathan-gonzalez" target="_blank">Nathan Gonzalez</a>** for their help in setting up the first tries of Event Upconverting, without them I would probably still be wasting my time tempting to do it...

Event Conversion is a necessity, because the requisites changes, always. NEventStore team knows it. For that reason has given us some feature to manage it.<br>
Why is so important? An event is something happened in the past and the past is...past! True, but at this point I know that every time I get an aggregate from the repository, NEventStore replay all the committed events to re-build the last state of the aggregate.
These committed events could be some months old, and during this period new product version (with upgraded events class/handlers) could be released. So, How to handle the original events after event evolutions or fixes?

Here it is where Event Upconverter comes to help!


###Event Versioning Strategies###
Every time we need to modify an event class, we should always consider to create a new version of the event, keeping the old one still live, in order to re-hydrate the aggregate from the repository stream. So, it' important to define a versioning strategy for the events.

There are different solutions explained by Damian Hickey in <a href="https://groups.google.com/forum/#!msg/neventstore/tscuQA1bZxQ/TE-u0_PpnyoJ" target="_blank">this post</a>. In the same post **David Rettenbacher** proposed a variant that I like, because it leaves the same event's full name in the last version of the event itself and so, the code seems to be more readable and maintainable: **_using Attributes_**.


####Attribute Versioning setup####
The strategy needs:
<ol>
<li>a <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.Infrastructure/Events/Versioning/VersionedEventAttribute.cs" target="_blank">VersionedEvent attribute</a> to link the concrete event classes with an alias for the event name (usually the event class name itself) and to associate that concrete event implementation with a version number.</li>
<li>a <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.Infrastructure/Events/Versioning/NewtonsoftJsonSerializer.cs" target="_blank">custom Serializer</a> that serialize/deserialize the event instances using a custom <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.Infrastructure/Events/Versioning/VersionedEventSerializationBinder.cs" target="_blank">serialization binder</a>, implemented according to the attribute versioning strategy</li>
<li>a <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Web.UI/Injection/Installers/EventStoreInstaller.cs#L82" target="_blank">NEventStore instrumentation in order to use this serialization strategy</a></li>
<li>a <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Web.UI/Injection/Installers/EventStoreInstaller.cs#L90-L91" target="_blank">NEventStore instrumentation in order to enable Event-Upconversion</a></li>
</ol>


####Attribute Versioning usage####
At this point to use this versioning strategy we need to:
<ol>
<li><a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.Domain/Messages/Events/ToDoEvents.cs#L37-L38" target="_blank">Rename the old version of Event Class</a> (i.e. className_V0) and mark the class with the VersionedEvent attribute's info</li>
<li><a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.Domain/Messages/Events/ToDoEvents.cs#L58-L59" target="_blank">Create the new version of the Event Class</a> (with the same original name) and mark the class with the VersionedEvent attribute using a major version number</li>
<li>Create the <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.Domain/Messages/Events/ToDoEventsConverters.cs" target="_blank">Event Upconverter</a> that implements the event conversion logic</li>
</ol>

that's all.

###Some Consideration###

####Replaying Events####
Replay all the events from the beginning could be useful in different scenarios: create a new projection, rebuild an existent one (for example during a product upgrade) and before do it, it's very important having the event upconversion strategy set up.
The following one it's a simple event rebuilder that re-publish all the events previously committed.

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
public class EventsRebuilder : IEventsRebuilder
{
	private readonly IStoreEvents _store;
	private readonly IBus _bus;

	public EventsRebuilder(IStoreEvents store, IBus bus)
	{
		Contract.Requires<ArgumentNullException>(store != null, "store");
		Contract.Requires<ArgumentNullException>(bus != null, "bus");
		_store = store;
		_bus = bus;
	}

	public void Rebuild()
	{
		var commits = _store.Advanced.GetFrom(null).ToArray();

		foreach (var commit in commits)
		{
			var evts = commit.Events
				.Where(x => x.Body is Event)
				.Select(evt => (dynamic)evt.Body)
				.FirstOrDefault();

			_bus.Publish(evts);
		}
	}
}
]]></script> 


####Well begun is half done####
Thinking about Event Upconversion should be one of the first strategies to define when you adopt Event Sourcing. That's just because the events are the data saved and serialized from the beginning, during all the live of your application. So, define at the very first moment how to serialize and deserialize the event data allow you to write more maintanable code, without having to adjust the target after. 
But in this sample application I wanted to put me in the worst condition: that's, to add a event upconversion strategy after the application go-live.
Using the VersionedEvent attribute as explained before allow me to add some more <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.Infrastructure/Events/Versioning/VersionedEventSerializationBinder.cs#L18-L42" target="_blank">serialization/deserialization logic</a> in order to face this situation. 
