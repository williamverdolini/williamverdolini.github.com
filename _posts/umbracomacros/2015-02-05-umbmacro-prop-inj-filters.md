---
title: "Properties Injection in MVC Filters"
excerpt: "Umbraco Custom Macros"
header:
    overlay_image: "/assets/images/hans-peter-gauster-252751.jpg"
    overlay_filter: 0.4
    caption: "Photo by Hans-Peter Gauster on [**Unsplash**](https://unsplash.com/photos/3y1zF4hIPCg)"
toc: false
toc_label: "Contents"
author_profile: false
sidebar:
  nav: umbraco
description: Umbraco, Castle Windsor, Inversion of Control, MVC, Tech
group: Umbraco_CustomMacros
tags: [Umbraco,Castle Windsor,Inversion of Control,MVC,Technology]
---

In the <a href="/2015/02/04/umbmacro-controllerfact/" target="_blank">previous article</a> we have seen how to set up DI in Controller. But what if we need dependencies injection in MVC filters with Castle Windsor?
This is not so straightforward as before, but with some "forced injections", we can hit the goal.

First of all it's important to say that, with filters, we have to talk about **Properties Injection** and NOT Dependencies Injection, because in MVC 4 we can't interfere with filters creation, but just with already created instances.
Obviously injecting dependencies is a cleaner way to apply the <a href="http://en.wikipedia.org/wiki/Inversion_of_control" target="_blank">IoC principles</a>, but when not possible, injecting properties is a good "plan B".   

To do that we have to override the default implementation of <a href="https://msdn.microsoft.com/en-us/library/system.web.mvc.iactioninvoker(v=vs.118).aspx" target="_blank">IActionInvoker</a>, which is used to invoke an MVC action in response to an HTTP request. In the Umbraco context, we have to 
override <a href="https://github.com/umbraco/Umbraco-CMS/blob/6.2.5/src/Umbraco.Web/Mvc/RenderActionInvoker.cs" target="_blank">Umbraco.Web.Mvc.RenderActionInvoker</a>. Here it is:

```csharp
public class WindsorActionInvoker : RenderActionInvoker 
{
	readonly IKernel kernel;
	public WindsorActionInvoker(IKernel kernel)
	{
		this.kernel = kernel;
	}

	protected override IAsyncResult BeginInvokeActionMethodWithFilters(ControllerContext controllerContext, IList<IActionFilter> filters, ActionDescriptor actionDescriptor, IDictionary<string, object> parameters, AsyncCallback callback, object state)
	{
		foreach (IActionFilter actionFilter in filters)
		{
			//Inject Properties in all the filters but global filters (already injected by Windsor's Controller Factory)
			if (!typeof(Infrastructure.Controllers.MacroController).IsAssignableFrom(actionFilter.GetType()))
				kernel.InjectProperties(actionFilter);
		}
		return base.BeginInvokeActionMethodWithFilters(controllerContext, filters, actionDescriptor, parameters, callback, state);
	}
}
```

two notes:

1. we want to inject Properties in Filters, so we need to override the **InvokeActionMethodWithFilters**
2. here we see for the first time one of the two main components of this basic architecture: <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Controllers/MacroController.cs" target="_blank">**MacroController**</a>, the base Controller from which all the custom Macros derive from. 
We want to exclude MacroController's global filter, because all public properties in MacroController are already injected by controller factory

You should also have noticed the **InjectProperties** extension method. Here is the code.

```
public static class WindsorExtension
{
	public static void InjectProperties(this IKernel kernel, object target)
	{
		var type = target.GetType();
		foreach (var property in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
		{
			if (property.CanWrite && kernel.HasComponent(property.PropertyType))
			{
				var value = kernel.Resolve(property.PropertyType);
				try
				{
					property.SetValue(target, value, null);
				}
				catch (Exception ex)
				{
					var message = string.Format("Error setting property {0} on type {1}, See inner exception for more information.", property.Name, type.FullName);
					throw new ComponentActivatorException(message, ex, null);
				}
			}
		}
	}
}
```

the final step is to declare the <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Injection/Installers/ControllersInstaller.cs#L20" target="_blank">dependency map</a>. No other configuration is required, because (custom) ActionInvoker is already invoked within the Controller lifecyle, 
known and managed by Castle Windsor.