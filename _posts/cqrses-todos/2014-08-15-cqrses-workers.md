---
title: "Workers"
excerpt: "CQRS+ES Todo List"
header:
    overlay_image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1350&q=80"
    caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
toc: false
toc_label: "Contents"
author_profile: false
sidebar:
  nav: cqrses
description: Tech, Workers, Single Responsibility Principle
group: CQRS_ES_Todos
tags: [Technology,Single Responsibility Principle]
---

One of the (so much) hints caught on CQRS+ES session presented by Andrea Saltarello is something that does not matters so much with CQRS, but more with Single Responsibility Principle. I’m talking about WorkerServices (Workers), whose purpose is to keep a loose coupling between implementation logic and domain logic.
It’s a tipical topic for software designers, rather than domain experts…and I like it!

The idea is very simple: divide the presentation layer from the service layer (where service is to be read in DDD sauce). An image speaks better than a thousand words:

<img src="{{ BASE_PATH }}/images/cqrses/workers.png" class="img-rounded" />

Why is so important? Because the Worker gives me two main advantages:

1.	The capability to focus on domain (business) actions, both command or queries, when dealing with development or troubleshooting. Obviously it’s possible to specialize the Worker in order to have a CommandWorker and a QueryWorker
2.	The capability to change my “presentation” framework with the minimum effort. With this pattern I could change MVC into WebApi (i.e.) without a re-factoring that involves Command/Query models.

Going deeper into the implementation, a Worker has to deal with the two “channels” of CQRS approach: the Command channel (to send commands) and the Query channel (to retrieve data). Because of that, it’s natural to implement a Worker injecting the two “buses”: 

-	Command Bus: channel to send commands to the bus on the Command Model
-	Database: channel to send queries to an eventual consistent storage

The following is a sample

```csharp
public class ToDoWorker
{
    private readonly IBus bus;
    private readonly IDatabase database;
    public ToDoWorker(IBus commandBus, IRepository repo, IDatabase db)
    {
        Contract.Requires<ArgumentNullException>(commandBus != null, "commandBus");
        Contract.Requires<ArgumentNullException>(db != null, "db");

        bus = commandBus;
        database = db;
    }
    #region Command Responsibility
    public void CreateToDoList(CreateTodoListCommandModel model)
    {
        bus.Send<CreateToDoListCommand>(new CreateToDoListCommand(model.Id, model.Title, model.Description));
    }
    #endregion
    #region Query Responsibility
    public async Task<List<ToDoList>> GetLists()
    {
        return await database.ToDoLists.ToListAsync();
    }
    #endregion
}
```