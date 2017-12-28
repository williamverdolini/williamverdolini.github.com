---
title: "OWIN + SignalR + Castle.Windsor"
excerpt: "CQRS+ES Todo List"
header:
    overlay_image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1350&q=80"
    caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
toc: false
toc_label: "Contents"
author_profile: false
sidebar:
  nav: cqrses
description: Tech, CQRS+ES, SignalR, OWIN, Castle Windsor
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES,SignalR,OWIN,Castle Windsor]
---

So far so good.

The implementation described in the <a href="{{ BASE_PATH }}/2015/08/22/cqrses-ui-notification/" target="_blank">previous article</a> has some “hidden initialization matters”. Let me explain: I use Global.asax to initialize much of my modules. To provide more details:

1. I initialize <a href="https://github.com/castleproject/Windsor" target="_blank">Castle.Windsor</a> in Global.asax to leverage the HttpApplication events, i.e. I create the WindosrContainer instance in the Application_Start and in the Dispose phase I can dispose the container as explained in <a href="http://blog.ploeh.dk/2012/10/03/DependencyInjectioninASP.NETWebAPIwithCastleWindsor/" target="_blank">this article</a>
2. In the same Application_Start phase I can configure all the other components, passing the DI container everywhere it’s necessary, i.e. in the NeventStore installer or in the WebApi CompositionRoot, as described in the same article above
3. In addition to this I set-up SignalR that is written as an <a href="http://owin.org/" target="_blank">Owin</a> compatible module, so we need to create our Owin middleware/module. To know more detail about that, you can read <a href="http://weblogs.asp.net/pglavich/owin-katana-and-getting-started " target="_blank">this good introduction</a>

So, where is the problem?

How if we need the Dependency Injection in SignalR?

As explained in <a href="http://www.asp.net/signalr/overview/advanced/dependency-injection" target="_blank">this tutorial</a>, we'll use this kind of initial Hub configuration, that's configuring a dependency resolver specific of the container you are using:

```csharp
public class Startup
{
	public void Configuration(IAppBuilder app)
	{
		app.MapSignalR(new HubConfiguration
		{
			Resolver = new WindsorDependencyResolver(container)
		});
	}
}
```

With Castle.Windsor, the resolver looks like the following

```csharp
public class WindsorDependencyResolver : DefaultDependencyResolver
{
	private readonly IWindsorContainer _container;

	public WindsorDependencyResolver(IWindsorContainer container)
	{
		if (container == null)
			throw new ArgumentNullException("container");

		_container = container;
	}

	public override object GetService(Type serviceType)
	{
		return _container.Kernel.HasComponent(serviceType) ? _container.Resolve(serviceType) : base.GetService(serviceType);
	}

	public override IEnumerable<object> GetServices(Type serviceType)
	{
		return _container.Kernel.HasComponent(serviceType) ? _container.ResolveAll(serviceType).Cast<object>() : base.GetServices(serviceType);
	}
}
```

But where does the **container** come from in the Hub configuration?

That is the point. As explained above, the DI container needs to be disposed and to do that I’ve created and disposed the container in Global.asax (honestly I haven’t figured out how to dispose the DI container in Owin configurations); so I can see two main options:

1. Create a public static reference to the container in Global.asax, as explained in <a href="http://blog.tuannguyena.com/pass-data-from-hosting-environment-to-owin-startup-class/" target="_blank">this article</a>. I don't like too much this solution, because it forces to expose your DI container as public throughout all the application, and probably it's not what you want to do.
2. Move all the initialization logic from Global.asax.Application_Start to Owin middleware configuration, forgetting about disposing (manually) the container

Are there better ways?