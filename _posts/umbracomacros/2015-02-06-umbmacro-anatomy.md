---
title: "Umbraco Custom Macros"
tagline: the Custom Macro's Anatomy
header: the Custom Macro's Anatomy
description: Umbraco, Architecture, Macros, Tech
group: Umbraco_CustomMacros
tags: [Technology,Umbraco,Architecture]
---

As said in the <a href="/2015/02/03/umbmacro-architecture/" target="_blank">introduction article</a>, one and the most important component of this basic architecture 
is **MacroController** which is used as base class for all the Custom Macros. Before explore this component let's see how a final Custom Macro looks like.

From administrator's point of view, the anatomy of a Custom Macros has defined by:

1. **which commands the macro can provide**. This information could be used to configure commands to be forwarded to specific page, for example
2. **which command the macro can handle**. This information could be used to configure specific command's consuming rules depending on the specific context
3. **which properties the macro offers**. These are the Umbraco Macro's properties that can be configured by administrator during the page design phase

These same information are very important also from the developer’s point of view. In fact, if the developer can easily translate these concepts into code, 
he/she has definitely more chances to easily maintain and improve the code.
Let's see how the sample macro's controller appears:

<img src="{{ BASE_PATH }}/images/umbracomacros/Anatomy1.png"  class="img-rounded"  /><br/><br/>

as you can see, in the class declaration is possible to recognize all the three parts of the Custom Macro's anatomy.

1. **ICommandProvider**: with this generic interface we can declare which commands the Macro can provide. Under the carpet (aka in the base class: <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Controllers/MacroController.cs" target="_blank">MacroController</a>) 
there is code to assure that the macro can provide just commands declared with this interface
2. **ICommandHandler**: with this generic interface we can declare which commands the Macro can handle.
3. **MacroProperties**: here the public properties exposed by the macro 

Let's dive into the Command Handling part, where the business logic resides.
<br/> 
 
###Command Handling###
The <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Commands/ICommandHandler.cs" target="_blank">ICommandHandler</a> Interface 
requires the implementation of _"pseduo-action"_ depending on the concrete command class.

<img src="{{ BASE_PATH }}/images/umbracomacros/Anatomy2.png"  class="img-rounded"  /><br/><br/>

These are _NOT_ real MVC actions, but methods invoked by <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Controllers/MacroController.cs#L69-L81" target="_blank">the real MVC Action from the base controller</a>. What I'm trying to do is to have a **parameter based routing**,
so that I can have specific actions for specific commands, keeping the same action name. In this way the <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Framework/Scripts/Command.Engine.js" target="_blank">Command.Engine.js</a> can dispatch a command to different controllers keeping quite the same invocation, 
without that any Custom macros should know about any other macros in the page.

The "magic" happens into MacroController, where <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Controllers/MacroController.cs#L87-L98" target="_blank">the user command is retrieved from the request and dispatched to the correct command handler</a> (in the derived class).

Besides that, I can guide developers through the Controller's development process in a more natural and domain-driven way (that is very important for quality and time-to-market!).

Note: **NoCommand** is a _particular_ command used to managed not handled commands. It's important because every Custom Macro is a partial view, called by Umbraco page. When a user calls a page in GET or POST, 
all the partial views in the page will be invoked and rendered; in this case the Custom Macro will be called with passing NoCommand.

At this point I've to spend few words about Custom Macro's structure of the views.

