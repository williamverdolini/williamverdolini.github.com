---
layout: wvpost
title: "Umbraco Custom Macros"
tagline: Properties Configurability
header: Properties Configurability
description: Umbraco, Architecture, Macros, Tech
group: Umbraco_CustomMacros
tags: [Technology,Umbraco,Architecture]
---
{% include JB/setup %}

When you configure a macro in the Umbraco developer section, you can add some parameters to the macro, which the administrator can use to enable some specific behaviour (e.g. disply or not some data, or whatever you want).

<img src="{{ BASE_PATH }}/images/umbracomacros/Umbraco-macros-parameters.png"  class="img-rounded"  style="width: 100%; height:100%" /><br/><br/>

These parameters can be handled in the Custom Macro's logic because <a href="/2015/02/07/umbmacro-views/#umbraco-link-partial-view" target="_blank">they are passed into the Custom Macro's controller from Umbraco Page model</a>. So, these parameters become a natural way to add some configuration to our macros. 

From developer's point of view, these parameters are declared with specific interfaces, that derive all from <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Controllers/IMacroProperties.cs" target="_blank">IMacroProperties</a>, like the following:

<script type="syntaxhighlighter" class="brush: csharp;">
<![CDATA[
public interface IToDoListMacroProperties : IMacroProperties
{
		string IsIdVisible { get; set; } 
}
]]></script>

and this interfaces are implemented by Custom Macro's Controller:

<script type="syntaxhighlighter" class="brush: csharp;highlight: [11,13]">
<![CDATA[
[PluginController("Sample")]
public class ToDoListController : MacroController,
	// Command Provider
	ICommandProvider<SelectToDoListCommand>,
	ICommandProvider<ArchiveToDoListCommand>,
	ICommandProvider<OrderToDoListsCommand>,
	// Command Handler
	ICommandHandler<ArchiveToDoListCommand>,
	ICommandHandler<OrderToDoListsCommand>,
	// Macro Properties
	IToDoListMacroProperties
{
	public string IsIdVisible { get; set; }

	...
}
]]></script>

Now, in the "command handle logic", the developer can use these **Macro's Properties** to get the values set during the configuration phase, without cares about **how** to retrieve these values.

<script type="syntaxhighlighter" class="brush: csharp;highlight: [7]">
<![CDATA[
[PluginController("Sample")]
public ActionResult Handle(OrderToDoListsCommand command)
{
	bool isAscending = Utilities.CastBool(command.IsAscending);
	ViewBag.SortedFieldname = command.FieldName;
	ViewBag.IsAscending = !isAscending;
	ViewBag.IsIdVisible = Utilities.CastBool(IsIdVisible);
	return PartialView(
		isAscending ?
		worker.GetLists().OrderBy(orderChoise[command.FieldName]).ToList() :
		worker.GetLists().OrderByDescending(orderChoise[command.FieldName]).ToList()
		);
}
]]></script>

Nothing More.

How is it possible?

###Macro's Properties Filters###
For reasons of simplicity we assume to have all Macro parameters as strings (type: text). All the magic happens into the Controller Base class. Let's see the code:


<script type="syntaxhighlighter" class="brush: csharp;highlight: [3,11]">
<![CDATA[
[SessionExpiredException(Order = 20)]
[LogException(RedirectTo = "/Errore", Order = 10)]
[RetrieveMacroProperties(Order = 20)]
[SubscribeCommandsToProvide(Order = 40)]
[SubscribeCommandsToHandle(Order = 50)]
public abstract class MacroController : SurfaceController, IMacroProperties
{
	...

	[MapToView]
	[PopulateMacroProperties(Order = 10)]
	public ActionResult Init(IDictionary<string, object> MacroParameters)
	{
			return HandleCommand(GetBusinessCommand());
	}

	[HttpPost]
	[MapToView(ViewName = "Handle")]
	public ActionResult Execute()
	{
			return HandleCommand(GetBusinessCommand());
	}

	...
}
]]></script>

So, focusing on Macro's properties:

- for the **init** action two particular filters are called in sequence: <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Filters/MacroPropertiesAttribute.cs#L52" target="_blank">PopulateMacroProperties</a> and <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Filters/MacroPropertiesAttribute.cs#L12" target="_blank">RetrieveMacroProperties</a>
- for all the other actions only <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Filters/MacroPropertiesAttribute.cs#L12" target="_blank">RetrieveMacroProperties</a> filter is called

**PopulateMacroProperties**: retrieves the macro parameter from ActionParameters and populates a local dictionary in session.

**RetrieveMacroProperties**: retrieves the macro parameter from the local dictionary in session and, by reflection, sets the Controller's properties with the same characteristics

all <a href="https://github.com/williamverdolini/Umbraco-CustomMacros/blob/master/CustomMacros/Areas/Infrastructure/Filters/MacroPropertiesAttribute.cs" target="_blank">filters code</a> is here.