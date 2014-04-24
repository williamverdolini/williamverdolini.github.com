---
layout: wvpost
title: "Discitur Project"
tagline: Routing (Deep-Linking)
header: Routing (Deep-Linking)
description: Discitur Project, Tech, Angular.js, routing
group: Discitur_en
tags: [Angular.js,routing]
---
{% include JB/setup %}

<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Routing (Deep-Linking)",
  "author" : {
    "@type" : "Person",
    "name" : "william verdolini"
  },
  "datePublished" : "2014-01-21",
  "articleSection" : [ "Angular.js", "routing" ]
}
</script>

This is a thorny issue in Angular. Honestly, about this, I expected something better from a "war machine" as Angular.js is...anyway...I explain my concerns.
The problem, that I have had to face soon after, was the parallel views rendering. In an app that has the ambition to grow into a panel or some sort of multi-site feature, 
you must be able to achieve several objectives:

1. keep the VC (ie, the pair View-Controller ) as isolated and independent as possible: what does this mean? 
     This means that when developing a controller should I worry about the UI logic and services and not think at all about the rest. 
     This would allow the parallelization of developments without much difficulty.
2. to do what the previous point asks, you should have a mechanism for:
    1. define the "master-pages" or view that are VC containers intended only to define the page layout (columns, sections , etc.). 
      The content (the various VC loaded ) should be dynamic and not wired in master-page
    2. allow communication between different VC "mounted" within the same master-pages.
 

Angular allows you to have a single ng-view in the page, whose population is governed by the routing rules defined at the module configuration level.
There are several projects that are trying to address this gap in the best way:

- <a href="https://github.com/dotJEM/angular-routing" target="_blank">https://github.com/dotJEM/angular-routing</a>
- <a href="https://github.com/angular-ui/ui-router" target="_blank">https://github.com/angular-ui/ui-router</a>
- <a href="http://www.bennadel.com/blog/2441-Nested-Views-Routing-And-Deep-Linking-With-AngularJS.htm" target="_blank">http://www.bennadel.com/blog/2441-Nested-Views-Routing-And-Deep-Linking-With-AngularJS.htm</a>


For now I put this topic in the activities of refactoring (to-do), 
but I note that among the projects seen, what seems to me to be more responsive to my needs is UI-Router, 
which sets up a state machine for multiple views. 
For now, to keep my sprint, I focus on the most "core" topic (test, test, test).