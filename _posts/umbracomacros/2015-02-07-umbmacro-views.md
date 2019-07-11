---
title: "“Chinese boxes” Partial Views"
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
description: Umbraco, Architecture, Macros, Tech
group: Umbraco_CustomMacros
tags: [Technology,Umbraco,Architecture]
---

In a <a href="/2015/02/03/umbmacro-architecture/" target="_blank">previous article</a> I've explained that an Umbraco macro inserted in a RTE is rendered as a (child) Partial View.
Now it's important to spend few words about the views involved in the process because it can better explain how this architecture can communicate with Umbraco.
There are always three partial views involved, one inside the other as chinese boxes:

<img src="{{ BASE_PATH }}/images/umbracomacros/Umbraco-chinese-box.png"  class="img-rounded"  /><br/><br/>

- the **Umbraco-Link Partial View**: this is the Partial view configured in the Umbraco Macro. This is the view rendered by umbraco when the page that containing the macro is requested. This view calls the Init View.
- the **Init Partial View**: this view is called _once_ during the page request process, so it can be used to do initial configuration (in an ajax perspective). This view calls the Handle View.
- the **Handle Partial View**: the view contains the (business) HTML markup for Custom Macro.

## Umbraco-Link Partial View
As said, this view is used in Umbraco Macro's configuration.

<img src="{{ BASE_PATH }}/images/umbracomacros/Umbraco-macros.png"  class="img-rounded" style="width: 100%; height:100%" /><br/><br/>

The most of the time is like the following:

```csharp
@inherits Umbraco.Web.Macros.PartialViewMacroPage
@using CustomMacros.Areas.Sample.Controllers;
@using Umbraco.Web;

@Html.Action("Init", "ToDoList", new { area = "Sample", macroParameters = Model.MacroParameters })
```

This view is the connection point between Umbraco's model and Custom Macro's model, Indeed here is where the Umbraco Macro's parameters (from PartialViewMacroPage model) are passed to the Custom Macro.

## Init Partial View
Init stands for Initial Configuration. Here is the place for code that could be executed once per page for each Custom Macro. below an example:

```csharp
@model IList<CustomMacros.Areas.Sample.Models.ToDoListViewModel>

@using ClientDependency.Core.Mvc;
@using CustomMacros.Areas.Infrastructure.Helpers;

@{
    Html
     .RequiresJs("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.6.0/bootstrap-table.min.js")
     .RequiresJs("~/Areas/Sample/Scripts/ToDoList.js")
     .RequiresCss("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.6.0/bootstrap-table.min.css")
     .RequiresCss("~/Areas/Sample/Scripts/ToDoList.css");
}

@Html.JsCommandsConfiguration()
@Html.Partial("Handle")
```

So, here you can put all the code that should not be sent every time during the ajax calls, like js and css dependencies, or client-side initial configurations, and so on...

Besides that, the code in this view and in the previous one, is almost the same for all Custom Macros, so the skeleton for this code could be realized by some scaffolding utility (time-to-market!).

## Handle Partial View
The real business View, where the HTML mark-up is written. In respect of <a href="https://en.wikipedia.org/wiki/Don%27t_repeat_yourself" target="_blank">DRY principle</a>, this view is rendered not only during the page request, but during all the ajax requests for the Custom Macro, 
so despite different commands to manage, you have just one view for rendering the Custom Macro ViewModel.

