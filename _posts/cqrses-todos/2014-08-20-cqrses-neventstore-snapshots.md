---
title: "Aggregate Snapshots"
excerpt: "CQRS+ES Todo List"
header:
    overlay_image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1350&q=80"
    caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
toc: false
toc_label: "Contents"
author_profile: false
id: /2014/08/20/cqrses-neventstore-snapshots
sidebar:
  nav: cqrses
description: Tech, CQRS+ES, NEventStore, Snapshots
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES, NEventStore]
---

What is a Snapshot and when is it useful?

<blockquote>Snapshots are performance optimization and can often be ignored altogether except in the systems where latency is mission critical. Snapshots are a materialization of the stream at a certain revision. The snapshot can then be consumed by an aggregate to bring it back to a known state before applying all events which have occurred since the snapshot. Snapshots, if required, should be handled either by an outside process or, on a minimum, a different thread to avoid blocking main message processing<h6><a href="https://github.com/NEventStore/NEventStore/wiki/Architectural-Overview" target="_blank">NEventStore wiki</a></h6></blockquote>

This is a training project, so I want to see the very basics for implementing some snapshooting policies. That’s what I’ve done in 5 moves:

1. Implement IMemento interface for my aggregates
```csharp
public class ToDoListMemento : IMemento
{
	public Guid Id { get; set; }
	public int Version { get; set; }
	public string Title { get; private set; }
	public string Description { get; private set; }
	public ToDoListMemento(Guid id, int version, string title, string description)
	{
		Id = id;
		Version = version;
		Title = title;
		Description = description;
	}
}
```

2. Create a factory method of these memento objects in my aggregates
```csharp
public IMemento CreateMemento()
{
	return new ToDoListMemento(Id, Version, Title, Description);
}
```

3. Create a service that has the snapshooting policies. The snapshots are added to the NEventStore through its method. The following are very naïve code, but it’s ok for this exercise
```csharp
public abstract class SnapshotCreator<T> where T : AggregateBase
{
	private readonly IRepository _repo;
	private readonly IStoreEvents _store;
	public SnapshotCreator(IRepository repo, IStoreEvents store)
	{
		Contract.Requires<ArgumentNullException>(repo != null, "repo");
		Contract.Requires<ArgumentNullException>(store != null, "repo");
		_repo = repo;
		_store = store;
	}
	/// <summary>
	/// Save new Aggregate Snapshot depending on specific Snapshoting policies.
	/// NOTE: In real context, it should be an external thread save snapshots, without interfere with online process
	/// </summary>
	/// <param name="command"></param>
	public void SaveSnapShot(Command command)
	{
		T list = _repo.GetById<T>(command.Id);
		// Create a Snapshot every 1000 version of the Aggregate
		// NOTE: very nasty logic/implementation, but just for training purposes
		if (list.Version % 1000 == 0)
			_store.Advanced.AddSnapshot(new Snapshot(list.Id.ToString(), list.Version, ((IMementoCreator)list).CreateMemento()));
	}
}
```

4. Add the snapshooting policy to the process (after events commit is done). That’s no code for production, but it helps to understand how a real snapshooting policy could be realized
```csharp
#if DEBUG
foreach (var handler in handlers)
{
	// If commandHandler is a SnapshotCreator it handles the snapshot persistence.
	// NOTE: Very unrealistic Snapshooting policy/implementation, but it's just for training purposes
	if (handler.GetType().IsSubclassOf(typeof(SnapshotCreator<>)))
	{
		MethodInfo method = handler.GetType().GetMethod("SaveSnapShot");
		method.Invoke(handler, new object[] { message });
	}
}
#endif
```

5. Finally, modify the AggregateFactory to create a new Aggregate instance from last snapshot retrieved by NEventStore
```csharp
public class AggregateFactory : IConstructAggregates
{
	public IAggregate Build(Type type, Guid id, IMemento snapshot)
	{
		Type typeParam = snapshot != null ? snapshot.GetType() : typeof(Guid);
		object[] paramArray;
		if (snapshot != null)
			paramArray = new object[] { snapshot };
		else
			paramArray = new object[] { id };
		ConstructorInfo constructor = type.GetConstructor(
			BindingFlags.NonPublic | BindingFlags.Instance, null, new Type[] { typeParam }, null);
		if (constructor == null)
		{
			throw new InvalidOperationException(
				string.Format("Aggregate {0} cannot be created: constructor with proper parameter not provided",
							  type.Name));
		}
		return constructor.Invoke(paramArray) as IAggregate;
	}
}
```


All the code is published on <a href="https://github.com/williamverdolini/CQRS-ES-Todos/commit/d4e0435e0808e925ee7c0b543b992b980e512b8a" target="_blank">this commit</a>.

