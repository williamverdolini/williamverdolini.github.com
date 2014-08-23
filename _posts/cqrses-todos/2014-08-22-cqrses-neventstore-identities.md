---
layout: wvpost
title: "CQRS+ES Todo List"
tagline: Identity Mapping
header: Identity Mapping
description: Tech, CQRS+ES, NEventStore, Identity Mapping
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES, NEventStore]
---
{% include JB/setup %}

NEventStore, great library for event sourcing indeed! 

But a question connected with the possible scenarios arises: how does it work with legacy systems, how to “inject” NEventStore in a traditional architecture like <a href="/Discitur.html">Discitur</a> is, which kind of problems comes out?

One of the first and more evident issue is the use of GUID as unique key for repository Aggregate Roots, that should be mapped with existent Entity keys (long, int or what else). Because traditional database becomes the readside of the CQRS+ES, this kind of mapping should be resolved in “Query Stack”.

My implementation is heavily based on solution presented on <a href="http://coding-insomnia.com/2012/05/28/a-trip-to-cqrs-commands/" target="_blank">Anders Ljusberg’s series of articles about CQRS+ES</a>, but, as just said, I moved the code and the main logic on the query model. That gave me the ability to keep the command part as much agnostic as possible about the read models.

All the code involved in this re-factoring is present in this <a href="https://github.com/williamverdolini/CQRS-ES-Todos/commit/5ca06da0a004a2a9a6d50aa23502c7de7bc72a59" target="_blank">commit</a>.

Here I want to share some thoughts about this code:

-	**PRO**: during this training journey I followed a different path: I’ve started with GUID Id and after a while I wanted to convert them into _int_ type. Now let’s see this as an example of re-factoring or enhancement of the solution. After the code is written and tested, thanks to NEventStore, it’s possible to recreate a new and modified read model just re-taping the sequence of the events stored. Very powerful!
-	**CON**: I said <<_this kind of mapping should be resolved in “Query Stack”_>>, but there’s some modification also in the CommandStack cause to validations and its <a href="/cqrses-todos/2014/08/18/cqrses-validation-concerns/" target="_blank">controversial aspects</a>…and this is a part that I do not like. Think about a large project adopting CQRS+ES; I think that could be natural to divide and parallelize the work in different teams (one for presentation, one for CommandStack, one for Query stack, for example). This kind of re-factoring should impact only on the "QueryStack team", but, cause validation, the re-factoring will involve also "CommandStack team".
