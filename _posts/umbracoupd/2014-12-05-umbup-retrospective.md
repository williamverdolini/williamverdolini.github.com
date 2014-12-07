---
layout: wvpost
title: "Umbraco Upgrade"
tagline: First prototype retrospective
header: First prototype retrospective
description: Umbraco, Prototyping, Tech
group: Umbraco_Update
tags: [Technology,Umbraco,Prototyping]
---
{% include JB/setup %}

So...after several attempts and insights I have decided to abandon the prototype of Umbraco upgrade to version 7, although I had achieved the following results:

- The run-time application worked flawlessly
- The back-office was able to view the templates, document types and their hierarchies and macros
- The back-office was able to view the content of the CMS pages

The decision to abandon the prototype was dictated by the following evidence/awareness:

- Umbraco 7, compared to 6, had completely changed the back-office, introducing several changes to the database and technology (Angular.js)
- Our application has several customized back-office features, which would be rewritten or strongly re-engineered 
- Umbraco version 6 is a "live" version, parallel to Umbraco 7
- I've spent almost two of the three weeks, whose my time-box is made of

And the most important awareness: **prototypes can fail**. <br/>
It's their nature.

But it's much easier to learn from failures than from successes, especially if you have followed a lean and effective prototyping technique. 

Let me just say that I've started the <a href="/2014/12/02/umbup-process/" target="_blank">Upgrade process</a> again with Umbraco version 6.2.4 and I've reached the same results achieved with Umbraco 7 in less than **6 hours**, while the cost of the previous prototype was **5.5 wordays**!<br/>
How?

Thanks to:

- acquired skills
- well documented steps
- code versioning
- clear goals and conditions

It was time to get things done!