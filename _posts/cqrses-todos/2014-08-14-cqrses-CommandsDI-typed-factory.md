---
title: "Typed Factory"
excerpt: "CQRS+ES Todo List"
header:
    overlay_image: "/assets/images/markus-spiske-207946.jpg"
    caption: "Photo by Markus Spiske on [**Unsplash**](https://unsplash.com/photos/Skf7HxARcoc)"
toc: false
toc_label: "Contents"
author_profile: false
sidebar:
  nav: cqrses
description: Tech, Dependency Injection, Inversion of Control, IoC, Castle Windsor, Typed Factory
group: CQRS_ES_Todos
tags: [Technology,Inversion of Control,Castle Windsor]
---

What is a Typed Factory?
<blockquote>Typed Factory Facility provides automatically generated <a href="http://en.wikipedia.org/wiki/Abstract_factory_pattern" target="_blank">Abstract Factories</a> that you can use to create components in your code, while still remaining agnostic to the presence of the container</blockquote>

Castle.Windsor allows two types of Typed Factory: 

-  **Interface-based**: as the name suggests is based on the presence of an Factory interface (whose methods should NOT submit out parameters), that the DI container can implement without the need to create an implementation for this Factory. After all, in most cases, the factory is concerned only to instantiate the handler's appropriate based on the parameters (Command) received; nothing more
-  **Delegate-based**: used when the need is limited to the creation of a single component and supports the use of delegates (but I'm  not interested in this scenario, which is a bit more complex and does not fit my need) 

So here are the steps used to solve the configuration: 


1. Creating an interface for the Factory of CommandHandler. Please note: only the interface! CW is in charge of the class that implements the interface (it is possible to override these logics of implementation, but in this case it was not necessary)
```csharp
public ActionResult Index()
public interface ICommandHandlerFactory
{
	ICommandHandler<T>[] GetHandlersForCommand<T>(T command) where T : ICommand;
}
```

2. Configure the mapping rule of the CW container. At this point you can delete the mapping rules that related to my (bad&ugly) Service Locator:
```csharp
public class MessagesWindsorInstaller : IWindsorInstaller
{
	public void Install(IWindsorContainer container, IConfigurationStore store)
	{            
		container.Register(
			Classes                             
			.FromThisAssembly()
			.BasedOn(typeof(ICommandHandler<>)) // That implement ICommandHandler Interface
			.WithService.Base()    // and its name contain "CommandHandler"
			.LifestyleSingleton()
			);

		container.AddFacility<TypedFactoryFacility>()
			.Register(Component.For<ICommandHandlerFactory>().AsFactory());
	}
}
```

3. Creating a class (of convenience) for the Dispatching command that applies the pattern of Constructor Injection to get the factory just outside of the handler. Note: For simplicity (and laziness) I did not create the respective interface, but only because I have instantiated the container CW within a specific controller. If I had walked the path correct ControllerFactory Customizing the MVC would create even more clean interface CommandsDispatcher, create its mapping rule and exploit the CW pattern Constructor Injection on the Controller to allow CW to create the instance (singleton) in autonomy.
```csharp
public class CommandsDispatcher
{
	private readonly ICommandHandlerFactory _factory;
	public CommandsDispatcher(ICommandHandlerFactory factory)
	{
		_factory = factory;
	}
	public void Dispatch<T>(T command) where T : ICommand
	{
		ICommandHandler<T>[] handlers = _factory.GetHandlersForCommand<T>(command);
		foreach (var handler in handlers)
		{
			handler.Handle(command);
		}
	}
}
```

4. Last step is to create the factory in my controller and pass it to the dispatcher who will use it whenever you need it (i.e., each time the user submits a new Command to the web server).
```csharp
public class HomeController : Controller
{
	private readonly IWindsorContainer _container;
	private readonly CommandsDispatcher _dispatcher;
	public HomeController()
		: base()
	{
		//DI Configuration for Castle.Windsor
		// Create the DI container
		_container = new WindsorContainer();
		// Install the packaged configurations
		_container.Install(new MessagesWindsorInstaller());
		_dispatcher = new CommandsDispatcher(_container.Resolve<ICommandHandlerFactory>());
	}
	public ActionResult Index()
	{
		_dispatcher.Dispatch<RegisterCommand>(new RegisterCommand() { SampleData = "Ciao from RegisterCommand!!!!" });
		return View();
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
```

Beautiful read the console log:
```
'iisexpress.exe' (CLR v4.0.30319: /LM/W3SVC/36/ROOT-1-130493890222725734): Loaded 'DynamicProxyGenAssembly2'. 
'iisexpress.exe' (CLR v4.0.30319: /LM/W3SVC/36/ROOT-1-130493890222725734): Loaded 'DynamicProxyGenAssembly2'. 
RegisterCommandHandler --> data: Ciao from RegisterCommand!!!!
SecondRegisterCommandHandler --> data: Ciao from RegisterCommand!!!!
'iisexpress.exe' (CLR v4.0.30319: /LM/W3SVC/36/ROOT-1-130493890222725734): Loaded 'C:\windows\Microsoft.Net\assembly\GAC_MSIL\System.Web.Mobile\v4.0_4.0.0.0__b03f5f7f11d50a3a\System.Web.Mobile.dll'. Skipped loading symbols. Module is optimized and the debugger option 'Just My Code' is enabled.
'iisexpress.exe' (CLR v4.0.30319: /LM/W3SVC/36/ROOT-1-130493890222725734): Loaded 'C:\Windows\Microsoft.NET\Framework\v4.0.30319\Temporary ASP.NET Files\root\4d18b93a\cd3594a2\App_Web_d3rchlam.dll'. 
```

In public repository I have reviewed the entire flow by inserting a proper initialization of the DI container using the override WebAPI ControllerFactory. 
There are different (and well made) tutorial on the subject, so I will not repeat things already present in the web (http://docs.castleproject.org/Windsor.Windsor-tutorial-ASP-NET-MVC-3 application-to-be-Seen.ashx).

In my code, <a href="https://github.com/williamverdolini/CQRS-ES-Todos/tree/master/Web.UI/Injection" target="_blank">here are some key points about Dependency Injection</a>.
Obviously all starts from <a href="https://github.com/williamverdolini/CQRS-ES-Todos/blob/master/Web.UI/Global.asax.cs#L19" target="_blank">Global.asax.cs</a>