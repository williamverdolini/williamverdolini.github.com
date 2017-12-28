---
title: "Have I really understood and well implemented my domain?"
excerpt: "CQRS+ES Todo List"
header:
    overlay_image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1350&q=80"
    caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: cqrses
description: Tech, CQRS+ES, Validation, Software Design
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES, Validation, Software Design]
---
That’s THE problem of every analyst and programmer in the world. That’s Domain, for sure.

But why this question at this point? Because validation is strictly related to domain rules and the validation logic can determine which is the best Domain model. So it’s always better to spend some time to deepen the validation rules in the different contexts.

An example of validation rule (and some consideration about it): _“the importance property of a Todo-Item must be a unique value in its own Todo-List”_

## Solution #1: Separate AggregateRoots (AR)

Having two distinct AR (ToDoList and ToDoItem) implies:

-	**Do an eventual consistent set validation**: that’s because, in the ES, we can access only to ARs in a consistent state. SO when the command comes, the validator has to retrieve the list and it’s components from a read model and validate the importance property among these eventual consistent data
-	**The UI could send just the ToDoItemId** to perform the command: that’s because the TodoItem IS an AggregateRoot, then it’s sufficient to send the ToDoItemId to perfom some action
-	**ToDoItem is accessible from outside the bounded context**: that’s the same concept of previous point, but in DDD terms.If ToDoItem is an AR, it is possibile to access to its methods directly and manage its own events and compensation logic. But what this means? In other words, the client (a user, a web application, etc) could send commands to TodoItem without references to its List. This is quite straightforward when I want to change description or due date, but it’s not the same with Importance properties. If the web app should be a very intensive collaborative tool, it could happen that more users should add or change ToDoItem’s importance in the same time and that could cause collisions on the uniqueness validation rule and, consequentely, should require some compensation logic to notify or correct the domain error

The following is the code for (eventual consistent) validation rule:

```csharp
public class ChangeToDoItemImportanceCommandValidator : AbstractValidator<ChangeToDoItemImportanceCommand>
{
	private readonly IDatabase database;

	public ChangeToDoItemImportanceCommandValidator(IDatabase db)
	{
		Contract.Requires<ArgumentNullException>(db != null, "db");
		database = db;

		RuleFor(command => command.Importance).NotEmpty().GreaterThanOrEqualTo(0);
		// Importance must be >=0 and unique among other item's importance
		RuleFor(command => command.Importance).Must(BeUniqueAmongItemsImportance).WithMessage("{PropertyName} must be unique in the List");
	}

	private bool BeUniqueAmongItemsImportance(ChangeToDoItemImportanceCommand command, int importance)
	{
		return  (from todo in database.ToDoItems
							   join list in database.ToDoLists on todo.ToDoListId equals list.Id
							   where todo.Importance == importance
							   select todo).Count() == 0;		
	}
}
```

This version of code is present in public repository, in branch <a href="https://github.com/williamverdolini/CQRS-ES-Todos/tree/master" target="_blank">master</a>.


## Solution #2: One AggregateRoot (AR) with composition

Having just an AR (ToDoList) with a list of TodoItem implies:

-	**Doing a consistent set validation**: it’s possible to access to the entire list of ToDoItem from ToDoList Aggregate and, then, it’s possible to do a consistent set validation for importance uniqueness
-	**The UI has to send ToDoItemId and ToDoListId** to perform a command: that’s because the TodoItem IS NOT accessible from outside the context and then we have to send the right coordinates to find the specific ToDoItem in the repository (obviously it’s should be possibile to read the ToDoListId from read-model having the ToDoItemId, but I don’t like this solution for performance reasons)
-	**ToDoItem is NOT accessible from outside the bounded context**: in this context, no one could create conflicts about the Importance validation rule because, every command is checked against the Domain Model (real consistent) and, then, there’s no more need to implement some compensation logic.
-	**Performances**: I’ve not made yet some complete performance test, but having an AR with lists of items should create more performance issues, I think. That’ because every time we retrieve the list from repo, the ES reconstruct the entire list retracing the sequence of the committed events, and it could become a long process. In this context some snapshooing policies could be a need.

The following is the code for (consistent) validation rule:

```csharp
public class ChangeToDoItemImportanceCommandValidator : AbstractValidator<ChangeToDoItemImportanceCommand>
{
	private readonly IRepository repository;

	public ChangeToDoItemImportanceCommandValidator(IRepository repo)
	{
		Contract.Requires<ArgumentNullException>(repo != null, "repo");
		repository = repo;

		RuleFor(command => command.Importance).NotEmpty().GreaterThanOrEqualTo(0);
		// Importance must be >=0 and unique among other item's importance
		RuleFor(command => command.Importance).Must(BeUniqueAmongItemsImportance).WithMessage("{PropertyName} must be unique in the List");

	}

	private bool BeUniqueAmongItemsImportance(ChangeToDoItemImportanceCommand command, int importance)
	{
		ToDoList list = repository.GetById<ToDoList>(command.ToDoListId);
		return !list.Items.Any<ToDoItem>(todo => todo.Importance.Equals(importance));
	}
}
```

So, a validation based on repository (consistent write model) rather than database (eventual consistent read-model). But not always a consistent validation is consistent indeed: think if I've used MSMQ for my bus; in that case it could be possible that some previous command, put in the bus but not yet processed, could change the repository state. So? We come back to the need of having some compensation logic...anyhow...


This version of code has required some re-factoring of model and command handlers and is present in public repository, in branch <a href="https://github.com/williamverdolini/CQRS-ES-Todos/tree/OneAggregateRoot" target="_blank">OneAggregateRoot</a>.