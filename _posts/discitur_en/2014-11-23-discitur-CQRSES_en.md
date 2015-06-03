---
layout: wvpost
title: "Discitur Project"
tagline: CQRS+ES Version
header: CQRS+ES Version
description: Discitur Project,CQRS+ES
group: Discitur_en
tags: [CQRS+ES,Software Design]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "CQRS+ES Version",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-11-23",
  "articleSection" : [ "CQRS+ES", "Software Design" ],
  "url" : "http://williamverdolini.github.io/2014/11/23/discitur-CQRS_en/"
}
</script>

Since the Go-Live of the the beta-release of Discitur Project it's been more than six months. In this period, among the other stuff, I've studied <a href="http://martinfowler.com/bliki/CQRS.html" target="_blank">CQRS</a>+<a href="http://martinfowler.com/eaaDev/EventSourcing.html" target="_blank">ES</a> pattern. 
I'm still studying and learning, but right now I can say that this pattern has changed me as developer, as analyst, as manager. Really!  

 
How?
Let's come back to April 2014. In that period I had already known CQRS+ES and had started to deepen these approaches. Meanwhile I was thinking about a second release of my application (Discitur). In my backlog there were some functionalities that had the purpose to measure the quality of the teachers, in particular the
"Reputation functionality". This is the same Reputation functionality that is in <a href="http://stackoverflow.com/" target="_blank">Stackoverflow</a>, transposed to the Discitur Project. I've found out that this kind of feature should fit very well in the Discitur context, because, as in Stackoverflow, the user's reputation could become a synonym of user's quality and competencies. Indeed a teacher that publishes more lessons probably is a teacher that applies more deeply than others, and the lessons that are voted and ranked higher than other are better lessons (and his author a better teacher) and the user that participates and replays the other lessons more often probably is a teacher more inclined to share their experiences and so on...
But how to implement this feature?

What is the reputation? It's a score, a user's score, gained doing something valuable in Discitur (publish some lesson, achieve up-votes, etc.)
So, the user's score is something gained after some _**events**_ in the user's life.
Something very very similar to the Event Sourcing pattern I was studying...
So...why do not refactor the whole application in CQRS+ES architecture?

_what a fool_...

###When using CQRS+ES is an error

As I've said before, studying CQRS+ES is making me a better developer, analyst and manager. The following is my key point list

- **Use it, only if you know how to use it**: I mean that this pattern requires some technical design skill, you have to think about a lot of them before you begin to develop and that's could be expensive. You have to set your infrastructure, you have to think about dll separation, events-conversion, snapshooting policies, DI container, async queues, Sagas, Projections, etc. and if you have a legacy system also about, migration strategies, ids-mappings, etc.
- **Use it, only if you know what you're doing**: I mean that these pattern does not fit for everything, read the article <a href="http://www.udidahan.com/2011/04/22/when-to-avoid-cqrs/" target="_blank" >When to avoid CQRS - Udi Dahan</a>, then read it again, and again
- **Use it, only if you know "what" you are**: I mean that these pattern require that you fully understand your business domain. No space for "User, do you need more fields in the form? No problem!", NO. You have to understand those fields, what they mean, why the user wants them in that moment or in that use case. 

Sometimes (the most part of the times) I do not have time and energies (that's what I say to myself) to deepen and master technologies, frameworks, designs, domains, and so on...well, in these cases, I should not to use CQRS+ES, unless someone else could pay for the consequences.
And for the rest of the times? Well...it depends.
I don't know if you got what I mean...but if so, what about you?

Anyway, Discitur is my gym project and I'm spending my time and energies to full understand CQRS+ES

###Why practising CQRS+ES is important

CQRS+ES has changed my point of view about how to realize software because these patterns forced me to move from the "developer's confort zone" into the (uncomfortable) "domain zone". Understand the domain, both from the business or technical point of view, allow you to do the things that really you need, and, probably, in the most convenient way.

_Before CQRS+ES I was_

- a lazy developer ("User, I will add all the fields in the form you need...just the time to _alter my table_")
- a superficial analyst ("Create-Read-Update-Delete...entities...whatever entities we are talking about!")
- a closed-mind software designer: ("n-tier, SOA, a - robust - database. You're done!")
- a confused Project Manager (more fields you have, more complex is the functionality, more workdays in the estimates...Come on guys! Let's deploy more fields tonight!!)

What a ugly person I was, but...

_After CQRS+ES I am_...

more aware of all of my defects, and now I can work on them.

I'm full of hope and joy today!

####Still Working####
I'm always studying and trying new solutions and I know that one day I'll deploy the new release of Discitur in CQRS+ES. That's my direction today.