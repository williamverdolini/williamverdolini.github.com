---
layout: wvpost
title: "Discitur Project"
tagline: Angular.js Digest Cycle
header: Angular.js Digest Cycle
description: Progetto Discitur,Tech,Angular.js,Digest Cycle,watchers
group: Discitur_en
tags: [Angular.js,Digest Cycle,watchers]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Angular.js Digest Cycle",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-02-10",
  "articleSection" : [ "Digest Cycle", "Angular.js", "watchers", "$$watchers", "$watch" ],
  "url" : "http://williamverdolini.github.io/2014/02/10/discitur-Digest/"
}
</script>

Another aspect always related to authentication: how to intercept the user login and how to react to this event.

I would add a few more aspect: the login, in Discitur application, is designed to fit in a modal window, which can be called from several parts of the application. 
Eg., already in this sprint (which is the first to use the authentication) the login is called from at least three different points:

1. from the main navigation bar via the link "Login"
2. from Comment form inserted at the end of each lesson (lessons are visible to all, but commenting is a feature that requires authentication)
3. from the "Ratings" to enter its ownassessment
 

Over the next sprint there will certainly be other chances that will involve an authenticated access. 
So what I want to avoid is to "pollute" the various controls (which need authentication) with code for opening the modal window, 
which would make the controller highly-coupled with each other.

 

To do this, I lean to the Angular event management, in particular by <a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/lesson/LessonCommentDrv.js#L60" target="_blank">launching a broadcast of the login event from $rootScope</a>. 
A quick thought: use the <a href="http://docs.angularjs.org/api/ng/service/$rootScope" target="_blank">$rootScope</a> to be sure that the event reaches the main controller 
from which the login modal window is generated. If I use a simple $scope of the starting controller, and the controller was not the parent scope of what I want to achieve, 
I would risk launching the event into nothing.


So, if in a generic controller I need the user login, I implement a method that throw my event:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
scope.actions = {
   // call Sign Modal Dialog to login
   openSignIn: function () {
      $rootScope.$broadcast('disc.login', scope.actions)
   },
   ...
}
]]></script> 


At this point, somewhere, the event will be run and the login window open. In this article, rather than on aspects of UI or interaction with back-end, 
I wanted to focus on the management of authentication data and how it is propagated to the various controllers that manage it. These are the steps followed:

1. the login is invoked and proceeds to perform the server-side authentication 
2. if the <a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L69" target="_blank">login</a> is successful, the property “<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L66" target="_blank">user</a>” (of the authentication service) is set containing all user information
3. this object, being within a service (which by its nature is a singleton), is unique and its updates are visible everywhere you face injection of Service
4. inside the controller which need to know the state of user authentication, perform a <a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/lesson/LessonCommentDrv.js#L134" target="_blank">watcher</a> of the properties of user interests, in particular user.isLogged
 

I personally find this approach useful, but not quite elegant, in particular I would rather not write a watcher of the same type in each controller; 
conversely I wanted to inject my authentication service and check the properties of the user, to see if the authentication has taken place or not.

 

Making a comparison between what I did and what I would like to do:


<h4>What I Did</h4>


<b><i>Controller</i></b>:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
scope.local = {
  isLogged: AuthService.user.isLogged,
  sameUser: (scope.comment.author.username == AuthService.user.username)
}
...

scope.$watch(function () {
  return AuthService.user.isLogged;
},
function () {
  scope.local.isLogged = AuthService.user.isLogged;
  scope.local.sameUser = (scope.comment.author.username == AuthService.user.username);
                        }
                    );

]]></script> 

<b><i>Template</i></b>:

<script type="syntaxhighlighter" class="brush: xml">
<![CDATA[
<div class="col-xs-12" ng-show="!local.isLogged || !local.sameUser">
<h5><small>
<a ng-click="actions.openUserComment()">{{labels.commentAnswer}}</a>
</small>
</h5>
</div>

]]></script> 





  
  
   
   
   
<h4>What I wanted to do</h4>


<b><i>Template</i></b>:

<script type="syntaxhighlighter" class="brush: xml">
<![CDATA[
<div class="col-xs-12" 
     ng-show="! AuthService.user.isLogged || ! AuthService.user.username==comment.author.username ">
  <h5>
    <small><a ng-click="actions.openUserComment()">{{labels.commentAnswer}}</a></small>
  </h5>
</div>
]]></script> 



What I have done is a result of a digest cycle and the logic that uses Angular to control any changes. 
Angular is running a "dirty checking" with each digest cycle (attached to the event loop of the browser). 
The cycle of checking brushes all scopes looking for value changes, the problem is that the services are not brushed independently 
from angular and therefore are required watcher who are nothing but the functions that the cycle of periodic digest of angular calls for update the various scopes. 
The cycle is clear to me and the end is ok, but I would have liked if the cycle Digest had brushed services are also injected by the different scope.

 

**_Review_**

Doing further research and, most importantly, having deepened <a href="http://stackoverflow.com/a/16465890/3316654" target="_blank">this post</a> I understood better how the Angular digest cycle works. 
Angular checks only primitive types, and, in the case of non-primitive objects <a href="http://docs.angularjs.org/api/ng.$rootScope.Scope#methods_$watch" target="_blank">watcher</a> turned on, 
Angular does dirty checking of all primitive properties of the object, as reported by the method of comparison used: <a href="http://docs.angularjs.org/api/angular.equals" target="_blank">angular.equal</a>.

<b><i>Controller</i></b>:

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
scope.local = {
  user: AuthService.user
}
]]></script> 


<b><i>Template</i></b>:

<script type="syntaxhighlighter" class="brush: xml">
<![CDATA[
<div class="col-xs-12" 
     ng-show="!scope.local.user.isLogged || ! AuthService.user.username==comment.author.username ">
  <h5>
    <small><a ng-click="actions.openUserComment()">{{labels.commentAnswer}}</a></small>
  </h5>
</div>
]]></script> 


 

With the above code, Angular defines a $watch on the "scope.local.user.isLogged" and, to make it, it identifies the scope's 
property "scope.local.user", which is set with reference to the object of the service user. So with the following code:

<b><i>Controller</i></b>:

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
scope.local = {
  user: AuthService.user
}
]]></script> 


<b><i>Template</i></b>:

<script type="syntaxhighlighter" class="brush: xml">
<![CDATA[
ng-show="!scope.local.user.isLogged">
]]></script> 



Angular, set a watcher of the following type:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
scope.$watch(
    function () { return scope.local.user.isLogged }, // where scope.local.user === AuthService.user
    function () {
        // do binding…
    }
);
]]></script> 

In this way you are able to put in the binding properties of a service, 
without having to resort to an explicit watcher in the controller.

 

_first reflection_:

The code that I wanted to write was initially mistaken for the simple fact that the watcher will not stick directly to services (maybe one day they will), but look within their scope.

 

_second reflection_:

a reading which confirmed all my insights was this: <a href="http://stsc3000.github.io/blog/2013/10/26/a-tale-of-frankenstein-and-binding-to-service-values-in-angular-dot-js/" target="_blank">http://stsc3000.github.io/blog/2013/10/26/a-tale-of-frankenstein-and-binding-to-service-values-in-angular-dot-js/</a>

If only I had found it earlier...

In any case, it is certain that from now on I will write code more aware!

 

_Third reflection_:

of this watcher opens a topic, that of performance, quite important. 
In complex applications it is easy to get to thousands and thousands of these watcher running at each cycle of the digest...

I do not now, but a smart thing to do is to disconnect the watcher when it is needed most. Readings fast (but interesting) I've done about it:


<a href="http://angular-tips.com/blog/2013/08/removing-the-unneeded-watches/" target="_blank">http://angular-tips.com/blog/2013/08/removing-the-unneeded-watches/</a>

<a href="http://www.bennadel.com/blog/2480-Unbinding-watch-Listeners-In-AngularJS.htm" target="_blank">http://www.bennadel.com/blog/2480-Unbinding-watch-Listeners-In-AngularJS.htm</a>.

 

 


  