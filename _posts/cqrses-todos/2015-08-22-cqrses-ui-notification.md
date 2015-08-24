---
layout: wvpost
title: "CQRS+ES Todo List"
tagline: UI Notification with SignalR
header: UI Notification with SignalR
description: Tech, CQRS+ES, SignalR, OWIN, WebApi, Angular.js
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES,SignalR,OWIN,WebApi,Angular.js]
---
{% include JB/setup %}

At the moment the project is a sort of "Lab <a href="https://it.wikipedia.org/wiki/Proof_of_concept" target="_blank">PoC</a>" for a CQRS+ES application and it’s have a lot of short-cuts (for the sake of simplicity) that in a real project should be reviewed. One of this is the "implicit synchronism" of the UI. Let’s see one of the front-end calls to the server.

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
changeDescription: function (_item) {
    var _input = {
        id: _item.Id,
        description: _item.Description
    }

    $http.post(w$settings.apiUrl + 'TodoItems/ChangeDescription', _input)
        .success(function (result, status) {
            $scope.local.todoItemsError.message = '';
            $scope.local.todoItemsError.show = false;
            _item._Description = _item.Description
        })
        .error(function (data, status, headers, config) {
            $scope.local.todoItemsError.message = w$utils.getFluentValidationMessage(data.Message);
            $scope.local.todoItemsError.show = true;
            _item.Description = _item._Description
        });
}
]]></script> 

And the server API related:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
[Route("api/TodoItems/ChangeDescription")]
[HttpPost]
public IHttpActionResult ChangeDescription(ChangeToDoItemDescriptionModel model)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    try
    {
        Worker.ChangeDescription(model);
        return Ok();
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}
]]></script> 

This code is perfectly consistent, because the actions (send command, manage it, store events, dispatch events, update read model) are all in-process. This is true even if I don’t use anything from the result data in the success callback, but, again, it’s correct for the same reason: because in the CQRS we have separated Commands from Queries, so this command will not have any result (but the httpResult) and because, being all actions in-process, if we have an “Ok” as result, it means that the read model has been correctly updated with the data passed in front-end call.
	
Let’s go a step forward.

Let’s imagine now that there is a **real asynchronism** between, let’s say, the storage of the events and the dispatching and the processing of the events. This is quite common in a real CQRS+ES application; very often also the commands are stored in queues and their processing is delegated to a subsequent async process.


How can we notify the user about the changes introduced by his command in a common web application? It depends on the scenario obviously, some options are:

-	Trick the user that the command was successfully sent and elaborated. This is a good option in a lot of real cases; generally speaking, it’s good everytime there is little chance that an error will happen (e.g. in a e-commerce where the aggregates are changed rarely by more than a user concurrently)
-	Notify the UI when the read model is correctly updated, saying something like “data is updating…” in the meanwhile


There are <a href="https://www.google.it/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=CQRS+eventual+consistency+ui" target="_blank">some other valuable options and variants</a> depending on the requirements.
I want to explore the second option, using <a href="http://signalr.net/" target="_blank">SignalR</a> to notify the clients of the server-side changes to the read-model. Very useful for me was read and deepen the code of <a href="https://github.com/andyhoyle/Crucial-CQRS" target="_blank">Crucial.CQRS project</a>.

First Question: in which project is it preferable to put the SignalR hub? This hub will born to notify the users that the read-model has changed in someway, so, it seems to be a part of the query-stack. But the query-stack project is a class-library, with no awareness about the “environmental context”. But SignalR introduce references to Owin and web and this is a bad smell…other options could be to create a different project for SignalR hub, or, even better, keep the owin/signalR references in the API project and activate the hub with some notification mechanism…maybe I’ll return on this after.

Keeping it simple at first, I call an event notifier (dependant on Hub) at the end of the denormalizer methods in the QueryStack project. But first I’ve to set-up SignlR Hub

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
public class NotifierHub : Hub
{
}
]]></script> 

As you see, very simple, because, in this scenario, SignalR has just to notify the clients of server-side events and there are no actions callable from UI. Now that we have the channel between server and clients, we need to define the notification logic:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
public class EventNotifier : IEventNotifier
{
    private readonly IHubConnectionContext<dynamic> clients;
    private readonly IMappingEngine mapper;

    public EventNotifier(IHubConnectionContext<dynamic> clients, IMappingEngine mapper)
    {
        Contract.Requires<ArgumentNullException>(clients != null, "clients");
        Contract.Requires<ArgumentNullException>(mapper != null, "mapper");
        this.clients = clients;
        this.mapper = mapper;
    }

    public async Task ChangedToDoListDescriptionEventNotify(ToDoList list)
    {
        await clients.All.changedToDoListDescription(mapper.Map<NotifiedToDoList>(list));
    }

    ...
}
]]></script> 

As you can see, I use:

- <a href="http://martinfowler.com/eaaCatalog/dataTransferObject.html" target="_blank">DTO pattern</a> to encapsulate and keep the serialization for SignalR channel out of the rest of the code.
- <a href="http://automapper.org/" target="_blank">AutoMapper</a> to simplify object-to-object mapping and, in this case, <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Todo.QueryStack/Mappers/NotifierMapperProfile.cs" target="_blank">it's very easy</a>

At the end, I call the notifier's methods at the end of the read-model updates:

<script type="syntaxhighlighter" class="brush: csharp;highlight: [28]">
<![CDATA[
public class ToDoEventHandlers : 
	IEventHandler<ChangedToDoListDescriptionEvent>,
	...
{
	private readonly IIdentityMapper _identityMapper;
	private readonly IEventNotifier notifier;

	public ToDoEventHandlers(IIdentityMapper identityMapper, IEventNotifier notifier)
	{
		Contract.Requires<ArgumentNullException>(identityMapper != null, "identityMapper");
		Contract.Requires<ArgumentNullException>(notifier != null, "notifier");
		_identityMapper = identityMapper;
		this.notifier = notifier;
	}

	public void Handle(ChangedToDoListDescriptionEvent @event)
	{
		using (var db = new ToDoContext())
		{
			int modelId = _identityMapper.GetModelId<ToDoList>(@event.ToDoListId);
			ToDoList list = db.Lists.First(t => t.Id.Equals(modelId));
			if (list != null)
			{
				list.Description = @event.Description;
				db.Entry(list).State = EntityState.Modified;
				db.SaveChanges();

				Task.Run(() => notifier.ChangedToDoListDescriptionEventNotify(list)).ConfigureAwait(false);
			}
		}
	}

	...
}
]]></script> 

In the front-end side we need the code to establish the connection with the hub 

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
var notifierHubProxy = $.connection.notifierHub;
]]></script> 

and to listen for server-side notifications. I did that using Angular.js global events that can be handled in every controller

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
// setup of global notification events 
notifierHubProxy.client.changedToDoListDescription = broadcastEvent('changedToDoListDescription');
notifierHubProxy.client.createdToDoListEvent = broadcastEvent('createdToDoListEvent');
notifierHubProxy.client.addedNewToDoItemEvent = broadcastEvent('addedNewToDoItemEvent');
notifierHubProxy.client.markedToDoItemAsCompletedEvent = broadcastEvent('markedToDoItemAsCompletedEvent');
notifierHubProxy.client.reOpenedToDoItemEvent = broadcastEvent('reOpenedToDoItemEvent');
notifierHubProxy.client.changedToDoItemImportanceEvent = broadcastEvent('changedToDoItemImportanceEvent');
notifierHubProxy.client.changedToDoItemDescriptionEvent = broadcastEvent('changedToDoItemDescriptionEvent');
notifierHubProxy.client.changedToDoItemDueDateEvent = broadcastEvent('changedToDoItemDueDateEvent');

var broadcastEvent = function (eventName) {
    return function () {
        console.log("event:" + eventName);
        console.log(arguments);
        $rootScope.$broadcast(eventName, arguments.length==1 ? arguments[0] : arguments);
    }
}
]]></script> 

How and if manage these events could be an opportunity matter. Sometimes it's ok to give an explicit notification to the user that something is changed, sometimes it's ok to "trick" the user with the input data without waiting the notification.
It's all about the domain requirements.