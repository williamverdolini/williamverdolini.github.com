---
title: "MVC Controller Factory"
excerpt: "Umbraco Custom Macros"
header:
    overlay_image: "/assets/images/hans-peter-gauster-252751.jpg"
    overlay_filter: 0.4
    caption: "Photo by Hans-Peter Gauster on [**Unsplash**](https://unsplash.com/photos/3y1zF4hIPCg)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: umbraco
description: Umbraco, Castle Windsor, Inversion of Control, MVC, Tech
group: Umbraco_CustomMacros
tags: [Umbraco,Castle Windsor,Inversion of Control,MVC,Technology]
---

## MVC (4) solutions for DI
Dependency Injection is a must for a <a href="http://en.wikipedia.org/wiki/SOLID_%28object-oriented_design%29" target="_blank">S.O.L.I.D. code</a> and, for that, 
you should use a DI container. Using Umbraco is not a problem about that and it's possible to exploit some feature to initialize the DI Container.
About the DI Container, there's a lot out there and I choose <a href="http://docs.castleproject.org/Default.aspx" target="_blank">Castle Windsor</a>.

IMHO Asp.NET MVC 4 has a partial support for dependency injection; indeed it offers two ways:

- define a <a href="https://msdn.microsoft.com/en-us/library/system.web.mvc.defaultcontrollerfactory%28v=vs.118%29.aspx" target="_blank">Controller Factory</a>
- define different services locators, throughout the implementation of <a href="https://msdn.microsoft.com/en-us/library/system.web.mvc.idependencyresolver(v=vs.118).aspx" target="_blank">IDependencyResolver</a>

but none of them are complete. In fact the first one is good for using DI in Controllers, but not allow to inject dependencies out of the controller's boundaries.
The second one gives a wider spectrum of usage, but works as a service locator, not allowing to manage the releases of injected dependencies, that could cause annoying memory leak problems...

With Castle Windsor is preferable to adopt the first solution, 'cause Windsor seems to have some problems with objects not properly released.
Let's see how to do that in an Umbraco application.

### MVC Controller Factory
The code for the factory is very simple and it could be taken from <a href="http://docs.castleproject.org/Windsor.Windsor-tutorial-part-two-plugging-Windsor-in.ashx" target="_blank">Castle Windsor documentation</a>

```csharp
public class WindsorControllerFactory : DefaultControllerFactory
{
	private readonly IKernel kernel;

	public WindsorControllerFactory(IKernel kernel)
	{
		this.kernel = kernel;
	}

	public override void ReleaseController(IController controller)
	{
		kernel.ReleaseComponent(controller);
	}

	protected override IController GetControllerInstance(RequestContext requestContext, Type controllerType)
	{
		if (controllerType == null)
		{
			throw new HttpException(404, string.Format("The controller for path '{0}' could not be found.", requestContext.HttpContext.Request.Path));
		}
		return (IController)kernel.Resolve(controllerType);
	}
}
```

As you can see, there's not only code for controller creation, but also for its release.

### Umbraco's instrumentation
Now that we have a WindsorControllerFactory, we have to use it as new MVC Controller factory. That could be done using Umbraco's Application event, as show below:

```csharp
public class BootstrapUmbracoAppEvent : ApplicationEventHandler
{
	private static IWindsorContainer container;

	protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
	{
		// see: http://our.umbraco.org/documentation/reference/Templating/Mvc/using-ioc
		container = BootstrapDIContainer();
		
		// DI Container's Dispose at the end of the Umbraco Application
		umbracoApplication.Disposed += new EventHandler((object sender, EventArgs e) => { container.Dispose(); });
	}

	private IWindsorContainer BootstrapDIContainer()
	{
		IWindsorContainer container = new WindsorContainer()
			.Install(FromAssembly.InDirectory(new AssemblyFilter(AssemblyDirectory)));

		var controllerFactory = new WindsorControllerFactory(container.Kernel);
		ControllerBuilder.Current.SetControllerFactory(controllerFactory);

		return container;
	}
}
```

As you can see, the DI container is created, used to create a WindsorControllerFactory and then disposed.
Complete code <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/App_Start/BootstrapUmbracoAppEvent.cs" target="_blank">here</a>.

