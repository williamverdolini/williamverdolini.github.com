---
layout: wvpost
title: "Discitur Project"
tagline: App Initialization, Global Variables
header: App Initialization
description: Discitur Project, Tech
group: Discitur_en
tags: [Angular.js,Constants,Services,Software Design]
---
{% include JB/setup %}

<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "App Initialization, Global Variables",
  "author" : {
    "@type" : "Person",
    "name" : "william verdolini"
  },
  "datePublished" : "2014-01-20",
  "articleSection" : [ "Passare ad Angular significava passare dal server al client e questo approccio (molto utile) doveva essere rivisto. Rivisto, consapevole del fatto che NON poteva essere riottenuto lo stesso identico risultato, per il fatto che nelle applicazioni web tradizionali le variabili in Application Memory erano inserite una sola volta ed erano accessibili a tutte le sessioni http che l'applicazione riceveva; mentre in SPA con framework di templating js come Angular l'applicazione risiede tutta sul client ed il backend è in genere state-less e quindi quelle che saranno oggetti di applicazione, sono oggetti ricreati su ogni client.", "Angular.js", "Constants", "Services", "Software Design" ],
  "url" : "http://williamverdolini.github.io/2014/01/20/discitur-appinit_en/"
}
</script>

Before moving to Angular.js, I used to work on tipical web app projects, in which the application had its own core server-side, 
with the generation of html/js code server-side. A component I put in almost all my applications was for initializing the entire application. 
Things that usually are parts of Global_asax, to be clear (for who is coming from .Net). 

A typical thing in app initializaion was the inclusion in memory of objects containing the value of all the labels that appear. 
For those who has to do with a product for the web is quite a common thing and allows different customers to be able to insert own text for each specific label displayed; 
by the same mechanism could also handle the label internationalization.


###From Server to Client

Moving to Angular meant moving from server to client and the feature just described (very useful) should be rethinked, 
aware that probably it could not be reached completely the same result; because in a traditional web application
variables in application memory were inserted just once and were accessible in every http sessions; while in a SPA with js templating framework (as Angular.js is)
the whole application resides on client side and backend is generally stateless, so application objects are object created in every client.   


###Angular Constants
In Angular a good candidate to handle these application constants is a service, 
in particular in the form of **value** that simplifies the implementation of literal objects instantiated only once throughout the application. My service will be as follows:
  

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module('Common')
.value('dictionary',
    {
        specifics : "Caratteristiche",
        discipline: "Disciplina",
        school: "Scuola",
        classroom: "Classe",
        rating: "Valutazione",
        author: "Pubblicato da",
        ...
    }
)
]]></script> 


This service should be used by each controller to populate the label displayed. 
So, taking advantage of the Angular Dependency Injection, a controller could have this structure:
 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module('Lesson')
    .controller('LessonCtrl', [
        '$scope',
        'dictionary',
        function (
            $scope,
            dictionary,
            ) {
            //-------- public properties-------
            $scope.labels = {
                specifics: dictionary.specifics,
                discipline: dictionary.discipline,
                school: dictionary.school,
                classroom: dictionary.classroom,
                author: dictionary.author
            };
]]></script> 

I admit that I do not completely like this solution because it requires to insert an "external" deploy step (reading labels from DB and creating js dictionary files to include) 
and this may not always be comfortable in emergency situations (not ever having to patch a release very quickly? no really?...). 


However, as it is, this solution has the limitation of not being able to manage an overriden label for a specific controller. 
That is, if I define the school label is equivalent to "School", throughout the application its value will always be the same. 
But if in a specific controller I wanted to see "My School", what should I do? duplicate label for each controller does not seem a good idea. 
Better to prepare a file of constants with just the custom labels for the specific controller:

 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module('Common')
.value('overrides',
    {
        'LessonCtrl': {
            school: "La  mia Scuola"
        }
    }
)
]]></script> 

Again, this file may be automatically generated from data stored in the DB. 

This choice forces to rework the controller, which, at this point, can no longer directly access the dictionary, but must pass through a service 
that, given the label, verifies the existence of a possible overriden value for the controller.

 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module('Common')
        .factory('LabelService', function (dictionary,  overrides) {
            return {
                get: function (controller, label) {
            // if exists the overriden label within the Controller is returned 
            // otherwise the dictionary's label is returned

                 return 
          (overrides[controller] && overrides[controller][label]) ?
          overrides[controller][label] :
          dictionary[label] || 'Label (' + label + ') not set!';
                }
            };
        });
]]></script> 

The controller becomes:

 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module('Lesson')
    .controller('LessonCtrl', [
        '$scope',
        'LabelService'
        function (
            $scope,
            LabelService,
            ) {
            //-------- public properties-------
            $scope.labels = {
                specifics: LabelService.get('LessonCtrl','specifics'),
                discipline: LabelService.get('LessonCtrl','discipline'),
                school: LabelService.get('LessonCtrl','school'),
                ...
            };
]]></script> 

Ok.

It is stronger than me to note that there is so much repetition in the code. I expect to have dozens of labels for the controller and then rewrite 
the same line of code for dozens of times. In addition, in each line of code there are literals, which I tend to avoid, because 9 times out of 10 are managed with 
copy / paste and make bug-fixing can be a nerve-racking thing. 

The first solution is simple:
 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module('Lesson')
    .controller('LessonCtrl', [
        '$scope',
        'LabelService'
        function (
            $scope,
            LabelService,
            ) {
            var getLabel = function (label) {
                return LabelService.get('LessonCtrl', label);
            }

            //-------- public properties-------
            $scope.labels = {
                specifics: getLabel('specifics'),
                discipline: getLabel('discipline'),
                school: getLabel('school'),
                ...
            };
]]></script> 

 
**Better!**


###_Controller Inheritance?_

Reflect on this aspect because, on the basis of the code just written, all controllers of my application will have these components and I find a practice to avoid 
rewriting all the controllers because _error-prone_ (as each copy / paste) and because it is more difficult to maintain (if I had to change the private function getLabel, I have 
to rework all the controllers). 

This would be athe right opportunity to use the base classes from which each controller should inherit.

At the end the solution I find cleaner is: <a href="http://blog.omkarpatil.com/2013/02/controller-inheritance-in-angularjs.html" target="_blank">http://blog.omkarpatil.com/2013/02/controller-inheritance-in-angularjs.html</a>
which is based on a class that implement a base controller:
 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module("Discitur")
    .factory('DisciturBaseCtrl', function () {
        function DisciturBaseCtrl($scope, LabelService) {
            //-------- public methods-------
            $scope.getLabel = function (label) {
                return LabelService.get($scope.ctrl, label);
            };
        }
        return (DisciturBaseCtrl);
    });
]]></script> 
 
 
considerations:

1. Using a service with the purpose of giving a
     kind of "namespace" to the Controller, without polluting with global variables
2. The key point is the "return" expression, which returns the base class constructor and allow to create class instances.
     That's why I'm NOT using a "real" controller, but a service.

At this point my controller could be reengineered as following:

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
  
  
angular.module('Lesson')
    .controller('LessonCtrl', [
        '$scope',
        'DisciturBaseCtrl',
        '$injector',
        function ($scope, DisciturBaseCtrl, $injector) {
            $scope.ctrl = 'LessonCtrl';
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });
            //-------- public properties-------
            $scope.labels = {
                specifics: $scope.getLabel('specifics'),
                discipline: $scope.getLabel('discipline'),
                school: $scope.getLabel('school'),
                classroom: $scope.getLabel('classroom')
            };
    
  
    
]]></script> 


From the point of view of the code written in this particular case, 
there is not much benefit (basically the same number of lines of code), but the more the common functionalities increase, the more you would see sensibly the benefit. 
In my opinion, the real improvement is in the software design that allows you to isolate the common features, so the maintenance/evolution it is simplified. 

At the moment I will NOT apply this design, because I'm not sure it is the "Angular way" because the management of the parent controller through services seems a "stretch" to me. 
I know it works, but for now I will use the injection of the services that it seems to me the most "standard" to address the issue. 

Some opinion about that?