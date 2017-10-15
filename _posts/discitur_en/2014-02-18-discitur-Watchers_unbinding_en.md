---
layout: wvpost
title: "Discitur Project"
tagline: Watchers Unbinding (Performance)
header: Watchers Unbinding
description: Discitur Project,Tech,Angular.js,Digest Cycle,watchers,Performance
group: Discitur_en
tags: [Angular.js,Digest Cycle,watchers,Performance]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Angular.js Watchers Unbinding (Performance)",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-02-10",
  "articleSection" : [ "Digest Cycle", "Angular.js", "watchers", "$$watchers", "$watch", "Performance" ],
  "url" : "http://williamverdolini.github.io/2014/02/18/discitur-Watchers_unbinding_en/"
}
</script>

One of the things that I "restless" more than Angular.js is the process of dirty checking. 
At each digest cycle Angular monitors all registered watchers to see if the information has changed compared to the previous cycle 
and, if intercepts any change, launches the listener associated. The check is done on the primitive data, then if it is put under binding an array 
or an object are controlled all the object's properties to verify any changes. 

In addition, for all binded expressions in view, Angular creates a watcher that is "brushed" with each cycle to see if there are changes 
to be transposed. 

A good article that examines the issue is as follows: <a href="http://blog.bguiz.com/post/57373805814/accessors-vs-dirty-checking-in-javascript-frameworks" target="_blank">http://blog.bguiz.com/post/57373805814/accessors-vs-dirty-checking-in-javascript-frameworks</a>


On large applications (or destined to become) this check could cause performance problems. 
To improve performance you can eliminate the watchers that do not contain dynamic content. 
In my architecture, a good number of these watchers is created for the management of labels. 
All my controllers contain, in scope, object labels that contains all the labels that appear on the page. 

For these labels, once initialized the controller and made ​​binding on the first view, it would not longer do additional checks 
and may be detached from the dirty-checking, deleting the associated watcher. 

 

I tried two methods to achieve this goal: 

 

### custom method 
I have experienced the most for educational/architectural purposes that apply in the app, because the result is not very elegant. 
Here is the code inserted in one of my controllers:
 


{% raw %}
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
var _watchers = false;
var _detachStaticWatchers = $scope.$watch(function () {
    // first digest cycle: do nothing to populate view
    if (!_watchers) {
        _watchers = true;
    }
    // second digest cycle: remove static watchers
    else {
        var _reLabels = /^{{labels\..*}}/
        for (var i = $scope.$$watchers.length - 1; i >= 0; i--) {
            if ($scope.$$watchers[i].exp &&
                $scope.$$watchers[i].exp.exp &&
                _reLabels.test($scope.$$watchers[i].exp.exp)) {
                $scope.$$watchers.splice(i, 1);
            }
        }
        // detach this watch
        _detachStaticWatchers();
    }
    console.log($scope.$$watchers.length);
    console.log($scope.$$watchers);
})
]]></script> 
{% endraw %}

 

theoretical aspects are used: 

- _a watcher without listeners is performed at every cycle digest. Due to this peculiarity, register a watcher that has the purpose of turning off the watcher of the static expressions_ 
- _a watcher returns a function that, when invoked without parameters, delete the watcher himself. With this principle, eventually the watcher delete itself automatically_
 

As you can see, the result is trivial (I do a digest cycle to make sure to render the labels and the next time I eliminate static watchers), 
but working (here is a printscreen of my log):



<img src="{{ BASE_PATH }}/images/discitur/watchers_unbinding.png" />

The code is ugly, but reviewed and, taking up the theme of inheritance of the Controller, 
it could be a candidate to finish in the initialization code of the controller base (from which all inherit).

At this point, developers have to worry about the controller to comply with the convention used for the insertion of labels and everything 
would be transparent. An example of what reported is the following:

- Controller application (LessonEditCtrl) is without "low-level" logic 
- Methods to remove static watchers are inserted in the base controller 
- The application Controller inherits a base controller (DisciturBaseCtrl)


Ugly, but invisible and powerful.

 

 

###<a href="https://github.com/Pasvaz/bindonce" target="_blank">Bindonce</a>
This library was created for just this purpose and realizes my goal in a decidedly more stylish and standard, 
or using directives. leans on jQlite $destroy event, and then deals with separate bindings marked appropriately.

 

Nice, but not exactly what I want, because I want to keep as much "clean" view of the purely technical aspects.

For me, in fact, the View is a soil that should remain as legible as possible and as less dense of UI logic. 
This is because, in a real context, the view is fed into one or more web-masters who add classes or other modifications to the CSS or wireframe 
to dress in an appropriate form. less application code can see and (worse yet) touch, the better. 
Even more so when it comes to architectural and functional aspects. In this particular aspect I see in the "domain" of the controller, 
rather than in that of view; the controller is, in fact, that calls the services and manages the data and is the controller that is aware of the fact that the single expression is static or dynamic.

The fact remains that <a href="http://slid.es/pasqualevazzana/angularjs-binding" target="_blank">Bindonce is very elegant and represents the "Angular way" to approach this issue</a>.

I also got to know the <a href="https://twitter.com/PasqualeVazzana" target="_blank">author of the library</a> and see the work performance of an application that used Bindonce. 
The result? I'll use it early in the project.

 

 

###Other considerations:
I also tried something like this in the controller:



<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
$scope.$on('$viewContentLoaded', function () {
    $scope.$$watchers.splice(1,1); //uno a caso per fare una prova...
});
]]></script> 

but it does not work because the event is launched before the state resolution and then before rendering the watcher...shame...