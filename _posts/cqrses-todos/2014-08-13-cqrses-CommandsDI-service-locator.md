---
title: "A first try, the Service Locator"
excerpt: "CQRS+ES Todo List"
header:
    overlay_image: "/assets/images/markus-spiske-207946.jpg"
    caption: "Photo by Markus Spiske on [**Unsplash**](https://unsplash.com/photos/Skf7HxARcoc)"
toc: false
toc_label: "Contents"
author_profile: false
sidebar:
  nav: cqrses
description: Dependency Injection, Inversion of Control, IoC, Castle Windsor, Service Locator
group: CQRS_ES_Todos
tags: [Technology,Inversion of Control,Castle Windsor]
---

There are several tutorials on the web and the <a href="http://docs.castleproject.org/Windsor.Windsor-tutorial-ASP-NET-MVC-3-application-To-be-Seen.ashx" target="_blank">same project’s site presents well-made material</a>, showing how integrate Castle Windsor in .NET MVC architectures. I intentionally wanted to recreate my own learning process "step-by-step", which was the more disconnected from the used framework as possible, because it is my intention to apply it in different contexts and projects (WebAPI, MVC, WebForms), and then I needed to understand the Castle Windsor (CW) library as isolated as possible. This is the path I followed. 

The use of CW goes through three steps always present:

1.	**Configuring the container with the components to be resolved**. Conceptually, the whole thing can be summed up with the creation of a map of the resolution rules of the classes to be created that the container will use. This map can be created in different ways (by component, via configuration files, with mechanisms for self-registration or by rules and naming conventions)
2.	**Resolution of the components by the container**. Once you have configured the container, can be used to create classes by Injection
3.	**Container disposing**

What I wanted to achieve was a Message Dispatcher, which aims to get a Command from outside (any user action that arrives at the Controller) and invoke the respective CommandHandler, kept decoupled and retrieved thanks to the power of the DI Container. Here is the first version done:

1. At first an example of Command and a couple of his CommandHandler. The aspect that I kept in mind is the use of interfaces and abstract classes from which to derive, so you can easily identify the contract (i.e., the rule) to indicate to CW how to resolve my map of dependencies. This obviously makes the code clearer to read and maintain.
```csharp
namespace FirstTry.Commands
{
    public interface ICommand
    {
        Guid AggregateId { get; set; }
        int Version { get; set; }
    }
    [Serializable]
    public abstract class Command : ICommand
    {
        public Guid AggregateId { get; set; }
        public int Version { get; set; }
    }
    public class RegisterCommand : Command
    {
        public string SampleData { get; set; }
    }
}
namespace FirstTry.CommandsHandlers
{
    public interface ICommandHandler<T> where T : ICommand
    {
        void Handle(T command);
    }
    public class RegisterCommandHandler : ICommandHandler<RegisterCommand>
    {
        public void Handle(RegisterCommand command)
        {
            System.Diagnostics.Debug.WriteLine("RegisterCommandHanlder --> data: " + command.SampleData);
        }
    }
    public class SecondRegisterCommandHandler : ICommandHandler<RegisterCommand>
    {
        public void Handle(RegisterCommand command)
        {
            System.Diagnostics.Debug.WriteLine("SecondRegisterCommandHandler --> data: " + command.SampleData);
        }
    }
}
```

2. Then I have instantiated the DI container and configured to map these resolutions. I placed the code for the creation and installation of the container in a Controller (I know that is not the most suitable place to insert this in MVC, but I wanted to get out a bit from the schema of the tutorial, to fully understand the Castle.Windsor API)
```csharp
public class HomeController : Controller
{
	private readonly IWindsorContainer _container;
	public HomeController()
		: base()
	{
		//DI Configuration for Castle.Windsor
		// Create the DI container
		_container = new WindsorContainer();
		// Install the packaged configurations
		_container.Install(new MessagesWindsorInstaller());
	}
	protected override void Dispose(bool disposing)
	{
		if (disposing)
		{
			_container.Dispose();
		}
		base.Dispose(disposing);
	}
}
public class MessagesWindsorInstaller : IWindsorInstaller
{
	public void Install(IWindsorContainer container, IConfigurationStore store)
	{            
		container.Register(
			Classes                             
			.FromThisAssembly()
			.BasedOn(typeof(ICommandHandler<>)) // That implement ICommandHandler Interface
			.WithService.Base()                 // and its implemented with base class
			.LifestyleSingleton()
			);
	}
}
```

3. At this point lacks the dispatcher that uses the containers to solve handlers at run-time depending on the command that arrives from the UI. To do this we need a component that takes advantage of the DI container to resolve the map just made. Here is the code written
```csharp
namespace FirstTry.CommandsHandlers
{
    interface ICommandDispatcher
    {
        void Dispatch<T>(T command) where T : ICommand;
    }
    public class CommandDispatcher : ICommandDispatcher
    {
        private IWindsorContainer _container;
        public CommandDispatcher(IWindsorContainer container)
        {
            _container = container;
        }
        public void Dispatch<T>(T command) where T : ICommand
        {
            ICommandHandler<T>[] handlers = _container.ResolveAll<ICommandHandler<T>>();
            foreach (var handler in handlers)
            {
                handler.Handle(command);
            }
        }
    }
}
```

4. The dispatcher seems clear, but at this point we need to include it in the “Consumer part” of the handlers, ie in the controller and say to the CW container how to resolve the map during the initialization of the controller itself
```csharp
public class HomeController : Controller
{
	private readonly ICommandDispatcher _commandDispatcher;
	private readonly IWindsorContainer _container;
	public HomeController()
		: base()
	{
		//DI Configuration for Castle.Windsor
		// Create the DI container
		_container = new WindsorContainer();
		// Install the packaged configurations
		_container.Install(new MessagesWindsorInstaller());
		// Resolve the commandDispatcher
		_commandDispatcher = _container.Resolve<ICommandDispatcher>(new Arguments(new { container = _container }));
	}
	protected override void Dispose(bool disposing)
	{
		if (disposing)
		{
			_container.Dispose();
		}
		base.Dispose(disposing);
	}
}
public class MessagesWindsorInstaller : IWindsorInstaller
{
	public void Install(IWindsorContainer container, IConfigurationStore store)
	{
		container.Register(
			Classes
			.FromThisAssembly()
			.BasedOn(typeof(ICommandDispatcher)) // That implement ICommandDispatcher Interface
			.WithService.DefaultInterfaces()    // and its name contain "CommandDispatcher"
			.LifestyleSingleton()
			.AllowMultipleMatches()
			);		
		container.Register(
			Classes                             
			.FromThisAssembly()
			.BasedOn(typeof(ICommandHandler<>)) // That implement ICommandHandler Interface
			.WithService.Base()    // and its name contain "CommandHandler"
			.LifestyleSingleton()
			);           
	}
}       
```
Doing the last step, I came across something that was supposed to make me turn on some warning light: that the passage of the container to my dispatcher, in particular in the documentation castle.windsor you can (and should) read: <img src="{{ BASE_PATH }}/images/cqrses/DI-passing-args.png" class="img-rounded" />
I feel like I was a little...watched. But I ignore it and go on in the experiment. 

5. Last step is to simulate a user action and create my own Command in the Controller to pass to my dispatcher:
```csharp
public ActionResult Index()
{
	_commandDispatcher.Dispatch<RegisterCommand>(new RegisterCommand() { SampleData = "ciao from RegisterCommand!!!!" });
	return View();
}
```
The result? Everything works great and in the log I see the strings generated from my classes. Very well: I have dispatcher decoupled from Command and from their provider (the Controller) and is left to the dispatcher to work as Service Locator and dispatching my commands properly, thanks to the DI container.

Is well done? 

NO. 

Why is that? 

Here is a number of reasons related to <a href="http://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/" target="_blank">Service Locator anti-pattern</a> (to be read several times). It is not to add more. 
CW has also an excellent tool for debugging the container, capable of showing the classes that have been mapped and able to provide indications on the state of the container. 
In particular debugging the container shows yet another "yellow light" that indicates the possible presence of a Service Locator (just the CommandDispatcher...what a surprise...).

<img src="{{ BASE_PATH }}/images/cqrses/DI-service-locator.png" class="img-rounded" />

There is also to say that in the CW documentation there is the solution to this issue: the use of Typed Factory. Just in this documentation can be read: 

<blockquote>An example of a component like that would be a message dispatcher which waits for a message to arrive, then when that happens it pulls appropriate message handler and delegates the handling of the message to it. Using a typed factory the dispatcher can easily pull message handlers from the container, without having to explicitly use it. This gives you full power of the container and keeps your code expressive and free from service location.</blockquote>

Just what I was trying to do!! (the feeling of being watched there's even more...).