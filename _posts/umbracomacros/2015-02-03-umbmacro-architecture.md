---
title: "Umbraco architecture"
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

## The Umbraco's Idea
Umbraco is a <a href="http://en.wikipedia.org/wiki/Content_management_system" target="_blank">CMS</a> Product. Its mission is to allow users to easily write and publish their own web contents. I don't want to explain all the Umbraco functionalities 
(see <a href="https://our.umbraco.org/documentation" target="_blank">official docs</a>), but just highlight the basic idea around which Umbraco is based. Each page in Umbraco has two main properties, that are the Umbraco's pillars:

1. **Document Type**: defines the types of the pages that the back-office users can create in the content tree. Each document type contains different properties or fields. 
Each field has a specific data type (e.g. text, number). In a MVC context, Document types are the Models passed to the Views
2. **Template**: is where you define the HTML markup of your pages. In a MVC context, templates are the Views

<img src="{{ BASE_PATH }}/images/umbracomacros/Umbraco-content-main-properties.png"  class="img-rounded" style="width: 100%; height:100%" /><br/><br/>


Each Content Page should be of a specific Document Type and can be associate to more templates (to render same data in different layout) and Umbraco, in the MVC 
context, use this back-office configurations in his <a href="https://github.com/umbraco/Umbraco-CMS/blob/6.2.5/src/Umbraco.Web/Mvc/RenderMvcController.cs" target="_blank">specific Controller</a> 
to manage the connections between actions, Models (Document types) and Views (Templates).

### Macros in Rich Text Editor
As .NET developer, one of the most interesting Umbraco feature is the ability to let the web-site administrator to add not only static content, 
but also dynamic components, or, as Umbraco has named, *Macros*.

This is possible thanks to the capability to add Macros into Rich-Text Editor elements in the Content Page.

<img src="{{ BASE_PATH }}/images/umbracomacros/Umbraco-macro-rte.png"  class="img-rounded" style="width: 100%; height:100%" /><br/><br/>

Ok, but why this is so interesting for a .NET developer? 
Because a macro is a .NET (_familiar_) component. In fact, a Macro could be a WebForm User Control,
or MVC Partial view! 
The same we daily work with!

<img src="{{ BASE_PATH }}/images/umbracomacros/Umbraco-macros.png"  class="img-rounded" style="width: 100%; height:100%" /><br/><br/>

Besides that, Umbraco allows to define macro's properties that can be set by the web-site administrator, 
adding some configuration lever to the macros depending on property's values.

## The Custom Macro's Idea
So, Macros are good candidates to play the role of business modules that could be composed in pages in different ways, depending on customer’s needs. 

The real challenge, now, is to create macros that are _**agnostic**_ about what there’s around them. What does it mean?
It means that a macro should communicate with other macros without knowing what other macros are in the same page. 
Think about a product grid and a product detail; these should be two macros that can communicate to each other (when user click on a product in the grid, 
the product detail should update its data), but without knowing how the other macro is made, because it is depending on costumer's configuration. 


Indeed, customer A could want to display product detail in the same page, while customer B in a modal dialog, while customer C in a different page..and so on, but we 
want to have just one macro for product grid, and just one macro for product detail.

To do that I've created a basic architecture in which every single macro can emit and handle commands. Commands are the language used by macros to communicate to each other.

<img src="{{ BASE_PATH }}/images/umbracomacros/Umbraco-macros-architecture.png"  class="img-rounded" style="width: 100%; height:100%" /><br/><br/>

In the above picture you can see the communication flow among components:


1. Umbraco composes the page using the back-office configurations. Macros in RTE are inserted as MVC child partial views (in the MVC framework).
2. each user action is a **Command** that the architecture can translate in MVC language (actions) in order to send them to the server components. 
There are two main parts of this basic architecture: 
3. a client one (<a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Framework/Scripts/Command.Engine.js" target="_blank">**Command.Engine.js**</a>) responsible to translate client commands into actions 
4. a server-side one (Controllers derived from <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Controllers/MacroController.cs" target="_blank">**MacroController**</a>) responsible to implement business logic into the command handlers
5. as final step, Command.Engine replaces the macro area with the HTML result from server

In the next articles I'll explain some other details about the flow, but before that, it's important to see something about Dependency Injection.