---
title: "Discitur Project"
tagline: Prerequisites
header: Prerequisites
description: Discitur Project, Prerequisites, Technology, Methodology, Agile
group: Discitur_en
tags: [Technology,Methodology,Agile]
---

Hard to say, I think you understand along the way. surely no 
advanced prerequisite on technologies: the majority of those I will use 
will be new for me and I had no previous work experience; so in many ways I think the use of it 
I will be slightly more than amateur (often less).
 

###Speaking of _technologies_ :
 

1.    <a href="http://en.wikipedia.org/wiki/Version_control_systems" target="_blank">VCS</a>: **Git**. Never used before. Almost always (like everyone else) I worked with versioning tools 
so I have a generalist culture. Git fascinates me for its spread and for the concept that everyone has a local copy of the repository that is in fact a branch, which is what actually happens 
in the daily life of those who develop software.

2.    Front-End
Client: **Angular.js**. It's love, I'm studying with passion, and I 
very erratic trends, days to love him (professional!) days to hate 
(child)...I do not know yet what will be the ultimate feeling about that, but up to now 
is a growing :). reading this 
blog: <a href="http://www.bennadel.com/blog/2439-My-Experience-With-AngularJS-The-Super-heroic-JavaScript-MVW-Framework.htm" target="_blank">http://www.bennadel.com/blog/2439-My-Experience-With-AngularJS-The-Super-heroic-JavaScript-MVW-Framework.htm</a> I would say that it's a common feeling...so ok.

3.    Back-End: REST-Full webservice + ORM. Not yet decided what, but probably I will start with .Net **WebAPI 2.0** and **Entity Framework 6** (that
are technologies that intrigued me in the last <a href="http://www.communitydays.it/events/communitydays2013-roma/" target="_blank">.NET CommunityDays</a> ).

4.    Database:
relational. **SQLServer** (maybe tomorrow Postgre SQL or MySQL , but now it is not
one of my priorities). Initially I was very intrigued by NoSQL DB, MongoDB
over all, but I had many doubts about their real applicability, because
documents are not easily connected to each other and thi is something that I think is
strongly limiting for applications that have a growth plan and
Evolution is not always defined. I mean, I'll be working on the project
(Discitur) is a web app that has a defined scope of functionality, but which is
open to the inclusion of some kind of other features in the future (and this is
true for 99.9 % of the applications out there). Needing to make
join, to extract and connect data is a daily necessity and
work with JSON documents, disconnected from one another and with limited normalization forms
is very limiting in terms of functionality. I am sure that it is performing and very suitable for blogs or similar, but for
application...I studied a bit MongoDB, but read this article <a href="http://www.sarahmei.com/blog/2013/11/11/why-you-should-never-use-mongodb/" target="_blank">http://www.sarahmei.com/blog/2013/11/11/why-you-should-never-use-mongodb/</a> 
confirmed those that were sensations. When I have satisfied my curiosity about the SPA and Angular and 
when I have a little more courage, I will try MongoDB. If there is someone who can 
share some concrete experience of using NoSQL DB in a context of 
a complex application, I'd be really happy to ear (a little voice tells me that 
it would be nice to try it).

 

###_Metodology_ :

1.    **Agile**. It's by several 
years that I have been interested in lean and agile methodologies (but always 
self-taught). Another book that I loved as an approach (from 
trenches ...) is this: <a href="http://www.infoq.com/minibooks/scrum-xp-from-the-trenches" target="_blank">Scrum XP from the trenches</a>
(I recommend it to anyone with a past or a present as IT Project Manager). 
I would call my approach "little agile" :), because I realize the project alone, without a team (for now), but the approach is the same that I have for the 
technologies, that's to take advantage of this project as a gym, for 
try, train and feel first hand what's good and what's not in applied 
Agile methodology

2.    first I would like to combine an architectural aspect from <a href="http://en.wikipedia.org/wiki/Single_Page_Application" target="_blank">SPA</a> and from agile metodology:

        -       One one priciple from the Agile manifesto is:   
                <blockquote> <i>Our highest priority is to satisfy the customer through early and continuous delivery of valuable software</i>
                 <h6> <a href="http://agilemanifesto.org/principles.html" target="_blank">http://agilemanifesto.org/principles.html</a></h6></blockquote>
                 One of the most efficacy interpretations that I found to this principle is 
         to design and implement interfaces to the front-end immediately without 
         bother to "fix" things behind the scenes (aka back-end) and receive 
         as soon as feedback from the user on what will be the result 
         final. This approach is successful because it gives you in the shortest time 
         possible and with the highest possible definition what is a preview 
         of the finished system. This fits well with one of the 
         SPA architectures.

        -       back-end is not so important (<a href="http://aspectized.com/2012/10/backend-is-important-its-just-the-last-of-components/" target="_blank">http://aspectized.com/2012/10/backend-is-important-its-just-the-last-of-components/</a>)
in a SPA architecture, tha data access is through webService <a href="http://en.wikipedia.org/wiki/Restful" target="_blank">RESTful</a>, 
and the noteworthy aspect of this concept is that the
back-end can be easily and quickly mocked. Of course , the phrase
"Not so important" is true only under the premise that reaches from the previous point. back-end IS IMPORTANT actually, because it is only through a
solid back-end , which locates the correct entity that encapsulates the business logic with as low dependence as possible from what we have above, that
allows the efficient management and "integrates" the transaction, which
an application can have a future regardless of the channel that offers it.
The aspect that should be emphasized, however, is that the back end is NOT interested for the final user (9 times out of 10).
This is the reality. And so even if you are someone (like me) who has spent a lot
time and resources to achieve "cool" back-end (with transaction management, record versioning,
implicit/explicit transaction, with or without ORM, both online and batch
etc.), you have to agree with the fact that technologies change and
become attached to something is wrong. Let's become attached to
well done architectural drawings instead, those remain regardless,
while the technologies, db, the ORM frameworks are only "tools". If your goal is to spend a day at Disneyland with your family, who interested in the car you drive?
 

3.    **Test Driven**: is so, so, so, so much time I would try. At work I had not chances to try <a href="http://en.wikipedia.org/wiki/Test_Driven_Development" target="_blank">TDD</a>; only in exceptional occasions it
happened to me to meet customer/manager with "vision" that pointed to 
similar concepts. A "white fly" which I quote with pleasure had been Cesare
Pistelli (now a boss in Zurich IT): at the time he wanted
create a system for test automation to reduce no regressiont test costs (which were a blunder and, speaking clearly, did not give much
value added); but NEVER was able to reach that goal. Perhaps the time (and the
places) were not mature , but the most that he could do was to put
up a series of scripts for automatic navigation application
web, which, however, were not used for no regression testing, as, instead,
as a smoke test to verify that all sub-systems were working every morning. I do not know what you're doing now Cesare,
but if you have any programmer to be routed in the right direction, throw a
eye to <a href="http://karma-runner.github.io/0.10/index.html" target="_blank">Karma</ a>
(one of the reasons why I want to deepen Angular.js) and <a href="http://gruntjs.com/"  target="_blank">Grunt</ a>.


Last note (but not least): I have some experience as a project manager 
on development projects and over the years I studied and applied 
Water-fall-style and <a href="http://en.wikipedia.org/wiki/IBM_Rational_Unified_Process" target="_blank">RUP</a>-Style methodologies.
They work. But Agile has a plus, from my point of view (which is little more than teaching). 
There may be many obstacles to a real 
application of Agile metodology: clients, contracts, habits, etc.., but if you can 
create the right environment, the value that it generates is undisputed. The value **is** 
the magic word that came into my thoughts when I began to study and apply 
some agile techniques. And only with this "simple" thought in my head, my work has improved because more attentive 
to the needs and to the point of view of the customer. 


It's with this feeling that I continue to study, apply and test the agile. This project 
is a gym. I do so with humility and I invite anyone who has a real 
experience to correct me. I'd really appreciate them. For now, the agile taught me 
to always ask myself this question:

_What is the **Value** of what I'm doing?_