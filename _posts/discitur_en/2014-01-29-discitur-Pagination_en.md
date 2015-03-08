---
layout: wvpost
title: "Discitur Project"
tagline: Routing, Pagination
header: Routing, Pagination
description: Discitur Project,Tech,Angular.js,Pagination,UI-Router
group: Discitur_en
tags: [Angular.js,Routing]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Routing, Pagination",
  "author" : {
    "@type" : "Person",
    "name" : "williamverdolini"
  },
  "datePublished" : "2014-01-29",
  "articleSection" : [ "Angular.js", "Routing", "Pagination" ],
  "url" : "http://williamverdolini.github.io/2014/01/29/discitur-Pagination_en/"
}
</script>

Another aspect related to the states and routing management that I had to face is paginated research. 
The scenario is quite simple and common:

- search form that launches a server-side search
- there is a list of paginated results
- you scroll through a few pages (with server-side search)
- you enter into the detail of one of the results
- you go back...(boom!)
 

As a user, the behavior I expect is to return to the page from where I started. 
Doing this was not immediate for the fact that I had not fully understood the link between the "Ui-Router " and the URL. 
It is basically a 1:1 tie. Every state implies a different URL. Only by defining a sequence of states, 
you can take advantage of the browser's back in order to do what is described .

So trying to reconstruct the logical steps I followed:

- 1) it begins from the service: what do you expect in input? In my case, assuming to have a search for keywords in the query string, 
  a typical input object can be something like this:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
{ 
 keyword: "example",
 startRow: 0,
 pageSize: 3,
 orderBy: "PublishDate",
 orderDir: "DESC"
}
]]></script> 

- 2) Each different search must reload a list of results that should remain in the history list 
- 3) then each variable must be intercepted by the URL-state. To do this, I'm back on configuring state-route entering all the variables involved in the URL of the state

<script type="syntaxhighlighter" class="brush: javascript;highlight: [2]">
<![CDATA[
.state('lessonSearch', {
    url: '/lesson?keyword?startRow?pageSize?orderBy?orderDir',
    parent: 'master.2cl',
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
]]></script> 

- 4) At this point, wherever it can be launched a search (ie, the form of research and paging), we proceed to the state transition, 
which must be passed the parameters required for search. To ensure that the state change is recorded is preferable to include the reload option 
(otherwise it may happen that the navigation forward/backward navigation buttons recreate the same variables and so the same has already been navigated, 
preventing to draw any real change state)



<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
// Invoke search service for paging through state transition to preserve paging history
// the state transition is forced cause the same params could be used in previous navigations
$scope.getPage = function (pager) {
    $state.go('lessonSearch', LessonService.getPage(pager), { reload: true })               
}
]]></script> 

This is the "core" of state management. Obviously there's more closely tied to the search service, 
such as preserving into the singleton service the latest research data/visited page. For this refer to the repository on <a href="https://github.com/williamverdolini/discitur-web" target="_blank">github</a>. 

One aspect that I do not like is to see all those search parameters in the query string. 
It's quite ugly in my opinion, but I do not have depth if I can keep this state management, leaving URL displayed as something more elegant. Someone has some hints about it? 