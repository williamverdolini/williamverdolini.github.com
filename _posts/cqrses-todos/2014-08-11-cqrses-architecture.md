---
layout: wvpost
title: "CQRS+ES Todo List"
tagline: Architecture
header: Architecture
description: CQRS, ES, Command Query Responsibility Segregation, Event Sourcing, Design
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES]
---
{% include JB/setup %}

I’m one of those who cannot really understand a thing if he doesn’t represent it in a graphical way. For CQRS+ES it’s the same and probably it’s even more important. Why? Because CQRS+ES architecture is all but simple; it could be made of a lot of complex components…and I want/need to remember the details and what happened in this training journey between 6 or 12 months (_verba volant, scripta manent_).

An important premise: the following it’s NOT a tentative to depict CQRS+ES Architecture’s components and their relations, but it’s only the graphical representation of what _**I**_’ve understood after some months of studies. That’s not good for every CQRS+ES scenario, but I think that most of the components drawn are present in most of the cases. I’m continuously deepening these concepts, and I will have made some error for sure, so please, feel free to correct me (and let me grow). 

Thanks.


<br/>

###the scheme###

I tried to draw a super-set of components that could be used in a generic CQRS+ES architecture. Some of these components could be used or not to introduce different functionalities and behaviours, like queues for async flows.
<img src="{{ BASE_PATH }}/images/cqrses/CQRS-ES-architecture.png" class="img-rounded" />
 

Some explanation: there’s a COMMAND part and a QUERY part, as CQRS has stated and, it’s pretty evident, the Command part is the most complex. That’s cause we’re dealing with commands and events, their buses, their validations, their handlers, their repositories, in sync and async manner. For that, I will mainly focus onto the “write-model side”.

I wanted to stress the importance of <a href="http://en.wikipedia.org/wiki/Inversion_of_control" target="_blank">Inversion of Control</a> and <a href="http://en.wikipedia.org/wiki/Dependency_injection" target="_blank">Dependency Injection</a> (DI) showing in the scheme where DI was involved: it’s easy to see that is…everywhere. I’ve used <a href="http://docs.castleproject.org/Windsor.MainPage.ashx" target="_blank">Castle Windsor</a> container and since I’ve never used it before, I wrote an article that describes my first steps and the technical and design errors I’ve faced.

Anyway, describing what depicted in the write-model, here are the main steps:

1.    The Client send a command (an intent to do something) to the server. 
2.    The server validates the command both from the formal and the business point of view, reading from Domain Store or Read-Model database
3.    If the command is valid, it is sent to a command bus (for async flows)
4.    The command bus dispatch the command to all command handlers subscribed for that particular command
5.    The command handler, generally speaking, does always the same thing: gets some Aggregate from Domain repository, performs some action on it and saves eventual state changes. In this state change some events (notification about some changes happened) are emitted
6.    Events are stored in Event Store
7.    Events store manager can work as event dispatcher and, so, it dispatches the events to an event bus (for async flows) 
8.    The event bus dispatch the event to all event handlers subscribed for that particular event
9.    One kind of event handler is the Denormalizer that handles event to update a Read-Model database (and here I’m already on Query side)

That’s (almost) all!

###Event-Sourcing in Discitur project

Keep simple at first. My goal is to implement a very simple application that realizes the main components of a CQRS+ES architecture, in order to making practice, better understanding and exploiting its power in Discitur project. In fact, in that project’s product backlog there are some important stories that are involved with “event-driven behaviours” and so I wanted to explore if CQRS+ES architecture could fit with my needs.

But <a href="/Discitur.html">Discitur</a>’s infrastructure scenario is very simple (it’s a web application hosted in a cheap web hosting provider) and I want to keep it simple (for now); furthermore, my actual budget for project maintenance and evolution is very limited and that’s why I want to simplify the overall design and eliminate some components.So I made the following decisions:

-  Eliminate buses with Queues management technologies (MSMQ)
-  Eliminate task scheduling, keeping the “batch-flow” synchronous (i.e. mail notification after some events).
-  Avoid the usage of some sort of server-to-client RPC (eg SignalR) to signal the client that some background process are complete
-  Mix previous architecture (n-tier) with the new one (CQRS+ES). How? Keeping the old features in the n-tier architecture and the new ones in CQRS+ES. How could they live together? My idea is to use the actual database as the read-model database in the event-driven features, exploiting the event’s management that comes with ES
-  Learn CQRS: maybe for my purposes it’s not the best choice (for its technical complexity), but Discitur is born to allow me to make practice in new technologies, designs and methodologies (not to make money!)

Now it’s time to prototype. It’s time for another To-do list application!


