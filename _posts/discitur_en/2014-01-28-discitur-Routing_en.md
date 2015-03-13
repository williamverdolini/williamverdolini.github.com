---
layout: wvpost
title: "Discitur Project"
tagline: Angular.js Routing (UI-Router)
header: Angular.js Routing (UI-Router)
description: Discitur Project,Tech,Angular.js,Routing,UI-Router,Pagination
group: Discitur_en
tags: [Angular.js,Routing]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Angular.js Routing (UI-Router)",
  "author" : {
    "@type" : "Person",
    "name" : "williamverdolini"
  },
  "datePublished" : "2014-01-28",
  "articleSection" : [ "Angular.js", "Routing" ],
  "url" : "http://williamverdolini.github.io/2014/01/28/discitur-Routing_en/"
}
</script>

As promised in the first sprint, I would have dealt with this topic as soon as I could. 
The second sprint now seems to be overestimated for what I need to implement and the first sprint was closed faster than expected; 
therefore it is the right opportunity to develop certain design aspects. And then, after the TDD, 
I wanted to take some time to try and insert UI-Router. The thing was very quick and easy. 
Reverse engineer the app and tests for removing angular -route and put in UI-Router is a step without much difficulty. 
One of those steps that will help to increase your appreciation about Angular and its extensibility. 
As expected, UI-Router has everything I needed:

- possibility to nest views dynamically 
- ability to dynamically resolve views in parallel
- ability to manage the routing in a more logical way
- <a href="https://github.com/angular-ui/ui-router/wiki" target="_blank">good documentation</a>
 

One of the interesting things (and which I will give later a refactoring) is the abstract views. 
These are views that can not be instantiated by themselves, but they expect some descendant views that implement them. 
They seem to make a very good concept of the masterpage, or container of one or more pages that have the sole role of wire-frame 
and define the layout of views. This is an important aspect for me; in fact, this concept allows the single view not to worry too much about 
the routing rules or what's around it. If structured properly (I mean the interfaces defined in terms of events for communication with other VC) 
the single isolated pair VC can safely be developed independently by a programmer or a development team.

By now I structured my app as follows:

<img src="{{ BASE_PATH }}/images/discitur/masterpages.png" />


thus separating the html pages that are the application masterpages from angular modules (which therefore have individual features). 
The scaffold routing rules (or rather, the state machine) is made at two levels. 

 

**Level 1: MasterPages (abstract states)** 

This level is defined in the configuration of the web application and define what kind of layout is provided in the site navigation. 
These configurations do not define the actual routing rules, because all states are defined as abstract and therefore can not be solved 
by the UI-Router StateManager without some other implementation. Here's the interesting part of the code:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            //MasterPages (Abstract States)
            .state('master', {
                url: '',
                abstract: true,
                templateUrl: 'masterpages/master.html'
            })
            // One Column Layout (Abstract States)
            .state('master.1cl', {
                url: '/project',
                abstract: true,
                parent: 'master',
                templateUrl: 'masterpages/1cl.html'
            })
            // Two Columns Layout (Abstract States)
            .state('master.2cl', {
                url: '',
                abstract: true,
                parent: 'master',
                templateUrl: 'masterpages/2cl.html'
            })
    })
]]></script> 


**Level 2: Content-Pages (“phisical” states)**

This level is the one that defines the set of states of the application, and then define routing rules. 
Each module has its own routing rules and its own states, which must implement one of the states defined in the abstract master pages. 

 

For example. for the "static" site, I defined the main module as follows:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
    .config(function ($stateProvider, $urlRouterProvider) {
        // For any unmatched url, redirect to HomePage
        $urlRouterProvider.otherwise('/project/home');

        $stateProvider
            // Web Site (Content States)
            .state('master.1cl.home', {
                url: '/home',
                parent: 'master.1cl',
                templateUrl: 'modules/main/site/HomePage.html'
            })
            .state('master.1cl.mission', {
                url: '/mission',
                parent: 'master.1cl',
                templateUrl: 'modules/main/site/Project.html'
            })

    })
]]></script> 

As you can see the parent used (by choice) is always 'master.1cl' to indicate that the static application pages are always mono-column. 

As for the Lesson module, some states are as follows:

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('lessonSearch', {
                url: '/lesson?keyword',
                parent: 'master.2cl',
                onEnter: function () {
                    console.log("Entering Lesson Search");
                },
                views: {
                    'sidebar': {
                        templateUrl: 'modules/lesson/sidebar.html'
                    },
                    'main': {
                        templateUrl: 'modules/lesson/LessonNews.html',
                        controller: 'LessonNewsCtrl',
                        resolve: {
                            lessonNewsData: function (LessonService, $stateParams) {
                                return LessonService.search($stateParams);
                            }

                        }
                    }
                }
            })
            .state('404lesson', {
                url: '/404lesson',
                parent: 'master.2cl',
                views: {
                    'sidebar': {
                        templateUrl: 'modules/lesson/sidebar.html'
                    },
                    'main':{
                        controller: 'Lesson404Ctrl',
                        templateUrl: 'modules/lesson/Lesson404.html',
                        onEnter: function () {
                            console.log("master.2cl.404lesson");
                        }
                    }
                }
            });
]]></script> 

With a 2-column layout (parent: 'master.2cl'). The single internal feature 
(eg. The 'LessonNewsCtrl', which will probably take a different name for the next refactoring) was developed without keeping in mind 
any aspect related to the application wireframe. 

I find it very modular and easy.