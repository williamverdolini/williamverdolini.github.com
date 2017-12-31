---
title: "NEventStore"
excerpt: "CQRS+ES Todo List"
header:
    overlay_image: "/assets/images/markus-spiske-207946.jpg"
    caption: "Photo by Markus Spiske on [**Unsplash**](https://unsplash.com/photos/Skf7HxARcoc)"
toc: false
toc_label: "Contents"
author_profile: false
sidebar:
  nav: cqrses
description: Tech, CQRS+ES, NEventStore, Software Design
group: CQRS_ES_Todos
tags: [Technology,CQRS+ES, NEventStore, Software Design]
---

<a href="http://neventstore.org/" target="_blank">NEventStore</a> is a very powerful library that works very well in ES context. That’s its definition: 
<blockquote>NEventStore is a persistence library used to abstract different storage implementations when using event sourcing as storage mechanism. This library is developed with a specific focus on DDD/CQRS applications</blockquote>
There are some interesting point using an event store like NEventStore:

-	It’s an **append-only event store**: that means that 
<blockquote><i>you will never add, alter or remove an event. So if you suddenly end up with a bug in your system which is generating wrong events, then the only way for you to correct this is to generate a new compensating event correcting the results of the bug. Of course you want to fix the bug as well. This way you have also tracked when the bug was fixed and when the effects of the bug where corrected</i><h6>Mark Nijhof</h6></blockquote>.

-	**Logs everything happened**: 
<blockquote><i>By having this architecture we now basically solved the problem of loosing original intent, because we keep all events that have ever happened and these evens are intent revealing. An other very interesting thing is that now you have an audit log for free, because nothing will ever change state without an event and the events are stored and used in building up the Aggregate Roots they are guaranteed in sync with each other</i><h6>Mark.Nijhof</h6></blockquote>

-	Give us a **Write-only Domain Store**: 
<blockquote><i>the repository only has to be able to Get an Aggregate Root by its Id and it must be able to save the generated events. You also completely get rid of any impedance mismatch between the domain and the persistence layer</i><h6>Mark.Nijhof</h6></blockquote>

-	**Snapshooting**: 
<blockquote><i>So what happens when you have 100.000 events that need to be replayed every-time you load the Aggregate Root, that will slow down your system immensely. So to counter this effect you would use the Memento pattern to take a snapshot from the internal state of the Aggregate root every x number of events. Then the repository will first request the snapshot, load that in the Aggregate Root and then request all the events that have occurred after the snapshot, bringing it back to the original state. This is only an optimization technique you would not delete events that happened before the snapshot, that would pretty much defeat the purpose of this architecture</i><h6>Mark.Nijhof</h6></blockquote> 
and 
<blockquote><i>Snapshots should generally be taken "out of band"--that is out of the mainline of processing. In other words, when a series of events are being committed, you don't want to take a snapshot at that point. Instead, you'll want to have another thread or process take a snapshot asynchronously</i><h6>Jonathan Oliver</h6></blockquote>
