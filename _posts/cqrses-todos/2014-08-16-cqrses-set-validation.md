---
layout: wvpost
title: "CQRS+ES Todo List"
tagline: Set Validation
header: Set Validation
description: Tech, CQRS+ES, Validation, Software Design
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES, Validation, Software Design]
---
{% include JB/setup %}

What should I validate? For me, this was the question for the most of the time (and now yet). Should I validate commands or aggregates? For who, like me, is used with n-layered architectures the answer is pretty simple: Aggregates (aka Entities). But that is something controversial in CQRS world. Or, better to say, in CQRS+ES world.
Infact with ES the main idea is to have an only-append event store that should be accessed just to retrieve Aggregates by ID or to save them. Nothing more. So how could I validate a single aggregate without the capability to read a set of aggregates? The answer is: I cannot.
I read a lot about set validation and the most valuable reading, for me, is the <a href="http://codebetter.com/gregyoung/2010/08/12/eventual-consistency-and-set-validation/" target="_blank">Greg Young’s one</a>. He says that we should to do an “eventual consistent validation”, i.e. a validation based on eventual consistent data. So, as defined in the <a href="{{ BASE_PATH }}/2014/08/11/cqrses-architecture/" target="_blank">previous diagram</a>, I realized a set of Command validators that could perform its own check. I put this code as before the command handling, because the purpose of this kind of validation is to check that the command is valid from business point of view.

Let’s see some code.
First of all, I’ve used a very flexible library to do this kind of command validation: <a href="https://fluentvalidation.codeplex.com/" target="_blank">FluentValidation</a>. It gave me the ability to check for simple and complex rules, always having a very readable and maintainable code.

This is a sample code for an eventual consistent set validation:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
public class CreateToDoListCommandValidator : AbstractValidator<CreateToDoListCommand>
{
	private readonly IDatabase database;

	public CreateToDoListCommandValidator(IDatabase db)
	{
		Contract.Requires<ArgumentNullException>(db != null, "db");
		database = db;

		RuleFor(command => command.Id).NotEmpty();
		RuleFor(command => command.Title).NotEmpty();
		RuleFor(command => command.Title).Must(BeUniqueTitle).WithMessage("List's Title is already used. Please choose another.");
	}

	private bool BeUniqueTitle(string title)
	{
		return !database.ToDoLists.Any(t => t.Title.Equals(title));
	}
}
]]></script> 


As everywhere in my code, <a href="http://docs.castleproject.org/Default.aspx" target="_blank">Castle Windsor</a> resolves the necessary dependency for me.
The same structure is good for consistent validation (aka validation based on Domain Repository).

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
public class MarkToDoItemAsCompletedCommandValidator :AbstractValidator<MarkToDoItemAsCompleteCommand>
{
	private readonly IRepository repository;

	public MarkToDoItemAsCompletedCommandValidator(IRepository repo)
	{
		Contract.Requires<ArgumentNullException>(repo != null, "repo");
		repository = repo;

		RuleFor(command => command.ClosingDate).Must(GreaterThanOrEqualToCreation)
			.WithMessage(Messages.greaterthanorequal_error, "ClosingDate", "CreationDate");
	}

	private bool GreaterThanOrEqualToCreation(MarkToDoItemAsCompleteCommand command, DateTime closingDate)
	{
		ToDoItem item = repository.GetById<ToDoItem>(command.Id);
		return closingDate >= item.CreationDate;
	}
}
]]></script> 


So far so good. Now I use these command validators in the same way I use command handlers:
<ol>
<li>Create a Validator Typed Factory</li>

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
public interface ICommandValidatorFactory
{
	IValidator<T>[] GetValidatorsForCommand<T>(T command);        
}
]]></script> 

<li>Register the typed factory in DI container</li>

<script type="syntaxhighlighter" class="brush: csharp;highlight: [24]">
<![CDATA[
public class CommandStackInstaller : IWindsorInstaller
{
	public void Install(IWindsorContainer container, IConfigurationStore store)
	{
		container.Register(
			Classes
			.FromAssemblyContaining<ToDoListCommandHandlers>()
			.BasedOn(typeof(ICommandHandler<>)) // That implement ICommandHandler Interface
			.WithService.Base()    // and its name contain "CommandHandler"
			.LifestyleSingleton()
			);

		container.Register(
			Classes
			.FromAssemblyContaining<CreateToDoListCommandValidator>()
			.BasedOn(typeof(IValidator<>)) // That implement IValidator Interface
			.WithService.Base()    // and its name contain "Validator"
			.LifestyleSingleton()
			);

		// DI Registration for Typed Factory for Command and Event Handlers
		container.AddFacility<TypedFactoryFacility>()
			.Register(Component.For<ICommandHandlerFactory>().AsFactory())
			.Register(Component.For<ICommandValidatorFactory>().AsFactory())
			.Register(Component.For<IEventHandlerFactory>().AsFactory());
	}
}
]]></script> 

<li>Call the factory and the validation as before the command handling</li>

<script type="syntaxhighlighter" class="brush: csharp;highlight: [8,9,10,11,12]">
<![CDATA[
void IBus.Send<TCommand>(TCommand message)
{
	#region Command Validations
	// Eventual consistency checks
	// ATTENTION: based on domain requisites could be possibile to add constraint to readmodel DB
	//          or to check before persisting. In this case, it's quite rare to have concurrent conflicts
	//          so, this "eventual check" is perfect in most of the domain cases and could be assumed as good default rule
	IValidator<TCommand>[] validators = _commandValidatorFactory.GetValidatorsForCommand<TCommand>(message);
	foreach (var validator in validators)
	{
		validator.ValidateAndThrow(message);
	}
	#endregion

	#region Command Handling
	ICommandHandler<TCommand>[] handlers = _commandHandlerfactory.GetHandlersForCommand<TCommand>(message);
	foreach (var handler in handlers)
	{
		handler.Handle(message);
	}
	#endregion
}
]]></script> 

</ol>