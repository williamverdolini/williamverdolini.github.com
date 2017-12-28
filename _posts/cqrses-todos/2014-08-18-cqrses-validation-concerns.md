---
title: "Some concerns..."
excerpt: "CQRS+ES Todo List"
header:
    overlay_image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1350&q=80"
    caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
toc: false
toc_label: "Contents"
author_profile: false
sidebar:
  nav: cqrses
description: Tech, CQRS+ES, Validation, Software Design
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES, Validation, Software Design]
---

**NOTE**: <a href="/2014/08/10/cqrses-intro/" target="_blank">remember</a>? I’m not interested now about DDD and I know that some DDD practioners could say that <a href="/2014/08/17/cqrses-validation-understood/" target="_blank">here</a> there is some invariant rule and should be modelled somehow differently. I know, but in this training journey I want to focus in technical components and their relations rather than in modeling the perfect to-do list application.
But I can see from myself that there is a close link between the complete understanding of the domain and its implementation, closer than in tradional layered architecture. In my opinion that’s because the n-tier application allows us (software guys) to have a general understanding of the domain: if the user updates a form and the UI calls the “update-entity” service, this service is not aware of the real user’s intention, why update that data? We don’t care about it, the user knows. But with CQRS+ES the architecture splits this command in different commands with different semantic (if the business asks for it) and how the service handles this command depends on the AR model. This design is so complex also for this reason.

I’ve read <a href="http://cre8ivethought.com/blog/2009/11/12/cqrs--la-greg-young" target="_blank">this article</a> a lot of time, every time with a better understanding. But I always have some (philosophical and technical) questions:

-	Why could not the Domain Storage allow to search for aggregate set, forcing to do an eventual consistent validation?
-	If the system continuously re-tapes the events to retrieve aggregate, after a while, do not performance and storage space become issues?
-	Considering the previous question and the fact that an event seems very similar to a document (in NoSQL language) could be a good practice to implement the Domain Storage with some NoSQL database?
-   Is the validation logic too far from Aggregates? I mean that, with my implementation, I did a commands-validation and not an aggregates-validation and, at the end, my domain seems to be a typical anemic domain; but I've read the <a href="http://www.udidahan.com/2009/12/09/clarified-cqrs/" target="_blank">Udi Dahan's point of view</a> various times and it seems to me that my implementation respects those indications: it's my model that is quite simple and does not require other domain logic than internal events

What’s _your_ point of view?