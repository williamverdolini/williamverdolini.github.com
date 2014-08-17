---
layout: wvpost
title: "CQRS+ES Todo List"
tagline: Intro
header: Intro
description: CQRS, ES, Command Query Responsibility Segregation, Event Sourcing, Tech
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES]
---
{% include JB/setup %}

I couldn’t say exactly when I heard of Command Query Responsibility Segregation (CQRS) and Event Sourcing (ES) for the first time, but I remember the milestones that enlightened me a lot about this topic:


1.    .NET Community Days 2014 Milano: <a href="http://www.communitydays.it/events/2014/vs05/" target="_blank">DDD+CQRS+ES session</a> with **Andrea Brandolini** and **Andrea Balducci**
2.    <a href="https://play.google.com/store/books/details/Stefano_Ottaviani_Gestire_la_complessit%C3%A0_del_softw?id=-DECAwAAQBAJ" target="_blank">Bachelor's degree thesis</a> of **Stefano Ottaviani**
3.    Slideshare Presentations of **<a href="http://www.slideshare.net/andreabalducci/alam-aeki-guida-illustrata-alla-modellazione-di-un-dominio-con-event-sourcing-event-storming" target="_blank">Andrea Balducci</a>** and **<a href="http://www.slideshare.net/ziobrando?utm_campaign=profiletracking&utm_medium=sssite&utm_source=ssslideview" target="_blank">Andrea Brandolini</a>**
4.    <a href="http://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf">CQRS Documents</a> by **Greg Young**
5.    Implementing a <a href="http://www.adamtibi.net/06-2013/implementing-a-cqrs-based-architecture-with-mvc-and-document-db" target="_blank">CQRS-based Architecture with MVC and Document DB</a> by **Adam Tibi**
6.    <a href="https://github.com/Iridio/CQRS-ES_MembershipProvider" target="_blank">CQRS-ES demo project</a> of **Alessandro Colla**
7.    Microsoft .NET - Architecting Applications for the Enterprise (2nd Edition): <a href="https://naa4e.codeplex.com/" target="_blank">CQRS+ES workshop</a> with **Andrea Saltarello**
8.    <a href="http://cre8ivethought.com/blog/2009/11/12/cqrs--la-greg-young" target="_blank">CQRS à la Greg Young</a> by Mark Nijhof
9.    <a href="http://www.udidahan.com/2009/12/09/clarified-cqrs/" target="_blank">Clarified CQRS</a> by Udi Dahan

A heartfelt thanks to all those who have the ability and willingness to share their knowledge. For the rest, just passion and study.

What follows is the result of my studies and insights, and not everything that is written may be the correct interpretation of the different concepts. Anyone who wants to correct me or explain it better is welcome. 
Thank you. 

###It’s NOT DDD (yet)

All the times I've heard, read and studied aspects of CQRS+ES there was a natural association to Domain-Driven Design (DDD) approach. 
This is perfectly understandable due to the fact that if you are using a DDD approach (which does NOT gives implementative directions) 
with “Event Storming” it is likely that, once you want to transpose the defined model in code, you will use the pattern like CQRS+ES, 
carrying perfectly the concepts of the domain; However, in my opinion, it is very important to emphasize the scope and the target to which 
the two concepts apply: 

- **DDD**: has the purpose of understanding and modelling the Business (domain) and it does by identifying: 
  - **Bounded Context**: Scope of a specific business (characterized with its own shared language, its own set of entities and behaviors)
  - **Aggregates**: the entities within a meaningful context (Bounded Context) 
  -	**Ubiquitous Language**: the common language understood and spoken in context (Bounded Context) 
  -	**Events**: the moments when an Aggregate changed the value of its state 
  -	**Context Map**: the set of rules of connection and mapping between Bounded Context.
  
  It is mostly stuff for functional analysts and, in theory, does not need that these concepts are applied by programmers; of course it will be important to pass the results of this practice to the programmers. From the experience of those who put it into practice, this approach has undoubted merits, on complex contexts, allowing a quicker understanding of the domain and business aspects that are not always visible with traditional analysis.

  
- **CQRS + ES**: this is a pattern for software architecture and, in (very) few words it means divide writing data (command) from getting the data (query). The ES also enables you to manage the processing of commands by generating events that trace the history of all changes to the states of the entities involved.   

Oversimplifying, therefore, the CQRS + ES is a natural way (physiological, better to say) to translate business concepts derived from the DDD approach in software. BUT, though the two marry well together, they can live separately and you can do DDD without implementing it in CQRS + ES, but using a classical n-layered design and, conversely, it is possible to implement CQRS + ES (or only one of two components) without having adopted a DDD approach for understanding the business logic. 

In the <a href="/Discitur.html">Discitur Project’s</a> context I would like to deepen the technical aspects of design and code, and then I will prototype a CQRS + ES solution, bearing in mind the starting point (the current 3 level architecture) and the end point (a design that combines well event management and Process Manager that can be activated by these events).
