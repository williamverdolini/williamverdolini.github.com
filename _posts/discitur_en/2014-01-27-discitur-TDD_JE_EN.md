---
layout: wvpost
title: "Discitur Project"
tagline: Angular.js TDD, JE (Just Enough)
header: Angular.js TDD, JE (Just Enough)
description: Progetto Discitur, Tech, Angular.js, TDD
group: Discitur_en
tags: [Angular.js,TDD]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Angular.js TDD, JE (Just Enough)",
  "author" : {
    "@type" : "Person",
    "name" : "william verdolini"
  },
  "datePublished" : "2014-01-27",
  "articleSection" : [ "Angular.js", "TDD" ],
  "url" : "http://williamverdolini.github.io/2014/01/27/discitur-TDD_JE_en/"
}
</script>
[_italian_]({{BASE_PATH }}/2014/01/27/discitur-TDD_JE)

 

I've got slept on most nights and worked on it a little. I came across 
some significant cases. I start from the code that is easier.

**1° TDD Cycle (I cleaned all injection code)**

_the test: _


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
it("Should the ControllerX controller exists", function () {
    var _ctrl = _$controller('ControllerX', { $scope: _scope }); // <-- _scope = {}
    expect(_ctrl).toBeDefined();
});
]]></script> 


_the code: _

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module('App')
    .controller('ControllerX', [
        '$scope',
        function (
            $scope
            ) {
        }
    ]);
]]></script> 


Simple.

**2° TDD Cycle**

_the test: _


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
it("Should ControllerX have propertyY in its $scope", function () {
    var _ctrl = _$controller('ControllerX', { $scope: _scope }); // <-- _scope = {}
    expect(_scope.propertyY).toBeDefined();
});
]]></script> 



_the code: _


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module('App')
    .controller('ControllerX', [
        '$scope',
        function (
            $scope
            ) {
            $scope.propertyY = {};
        }
    ]);
]]></script> 



fine.

**3° TDD Cycle**

_the test: _


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
it("Should ControllerX.propertyY be populated with propertyYData in input", function () {
    _ctrl = _$controller('LessonNewsCtrl', { $scope: _scope, propertyYData: {} });

    expect(_scope.propertyY).toEqual({})

});
]]></script> 



_the code: _


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module('App')
    .controller('ControllerX', [
        '$scope',
        'propertyYData',
        function (
            $scope,
            propertyYData
            ) {
            $scope = propertyYData;
        }
    ]);
]]></script> 



With this step I created a service to pass initial data into the controller and it works, 
but this step in app code requires me to update previous test code, cause propertyYData is not injected...
that means that the 3° TDD iteration breaks the previous test cases!!! 
Without a functional reason..

The above example did a little shake my confidence in the TDD in Angular.js , 
although in the TDD method is a common practice re-engineer the code of the test...
even though I would have expected a different behavior (especially in js) .

Then I kept on again, in Angular services TDD. I would like to focus on a detail of this experience . 
I was making the search service (one of the main service of the application) and I kept applying TDD. 
In writing the test, shortly after, I came to realize the need to develop the input interface that , 
in my DDD head(  _Development- Driven Development_   ) sounds like that:



<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
.factory('LessonService', [
        …,
        function ($resource, $http, $q) {
            …
            search: function (inputParams) {…}
        }]);
]]></script> 



where




<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
inputParams = {
    discipline: '...',
    school: '...',
    ...
}
]]></script> 


After several insights (not all immediate as I would expect), 
I came to the writing of the following test set (the "Dev-Red-Green" usual practice ). 
I think they are significant:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
      describe('LessonService [signature-parameters]', function () {
          it('Should LessonService.search() accept no strings, throw exception otherwise', function () {
              var invalidParamEx;
              //make the call.
              try {
                  var returnedPromise = _LessonService.search('stringa');
              }
              catch (ex) {
                  invalidParamEx = ex;
              }

              expect(invalidParamEx).toBeDefined();
              expect(invalidParamEx.code).toBeDefined();
              expect(invalidParamEx.code).toEqual(20001);
          })

          it('Should LessonService.search() accept no Array, throw exception otherwise', function () {
              var invalidParamEx;

              //make the call.
              try {
                  var returnedPromise = _LessonService.search([]);
              }
              catch (ex) {
                  invalidParamEx = ex;
              }
              expect(invalidParamEx).toBeDefined();
              expect(invalidParamEx.code).toBeDefined();
              expect(invalidParamEx.code).toEqual(20001);
          })

          it('Should LessonService.search() accept no Function, throw exception otherwise', function () {
              var invalidParamEx;

              //make the call.
              try {
                  var returnedPromise = _LessonService.search(function () { });
              }
              catch (ex) {
                  invalidParamEx = ex;
              }
              expect(invalidParamEx).toBeDefined();
              expect(invalidParamEx.code).toBeDefined();
              expect(invalidParamEx.code).toEqual(20001);
          })

          it('Should LessonService.search() accept Object instance', function () {
              var invalidParamEx;

              //make the call.
              try {
                  var returnedPromise = _LessonService.search({ });
              }
              catch (ex) {
                  invalidParamEx = ex;
              }
              expect(invalidParamEx).not.toBeDefined();
          })

          it('Should LessonService.search() not accept Object with uncorrect parameters, and throws exception', function () {
              var invalidParamEx;
              var inputParams = {
                  color : 'blue'
              }

              var invalidParamEx;

              //make the call.
              try {
                  var returnedPromise = _LessonService.search(inputParams);
              }
              catch (ex) {
                  invalidParamEx = ex;
              }
              expect(invalidParamEx).toBeDefined();
              expect(invalidParamEx.code).toBeDefined();
              expect(invalidParamEx.code).toEqual(20002);
          })


      })
]]></script> 

Remember that my intention was to define the input of my service as an object whose properties could be used as a parameter of REST service. 
The code that came out was the following


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
.factory('LessonService', [
        …,
        function ($resource, $http, $q) {
            …
            search: function (inputParams) {    
                var validInput = { discipline: 1, school: 2 }

                // accept or no params or Object (for searching parameters)
                if (!angular.isUndefined(inputParams) && !(inputParams.constructor === Object))
                    throw { code: 20001, message: 'invalid Input Type for LessonService.search :' + inputParams }
                if (angular.isDefined(inputParams)) {
                    for (key in inputParams) {
                        if (!validInput.hasOwnProperty(key))
                            throw { code: 20002, message: 'invalid Input Parameter for LessonService.search :' + inputParams }
                    }
                }
                …

        }]);
]]></script> 


refactored in


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
.factory('LessonService', [
        DiscUtil,
        …,
        function ($resource, $http, $q, DiscUtil) {
            …
            search: function (inputParams) {                  
                  DiscUtil.checkInputObj(
                      'LessonService.search',       // function name for logging purposes
                      { discipline: 1, school: 2 }, // hashmap to check inputParameters
                      inputParams                   // actual input params
                      );
                  …

        }]);
]]></script> 


With the creation of a service Utility to reuse in the rest of the services.
  
  
The question is: **was the right choice follow this process?**
  
  
My answer is quite convinced: **NO**
  
  


Why? Because actually what I wanted to achieve was trivial, It was in my head from the beginning: 
and TDD is more effective in other contexts ( for me) , or when the algorithms are not so obvious 
and it is good to point to the logic before write something. Furthermore, 
to obtain the initial result I have written dozens and dozens of lines of code 
( of course, you could probably write better , but my goal was to write tests with some fluency 
also to be able to compare to a more traditional development ) . I confess that, without TDD, 
I would have written no code that validates the input, but in the context in which we are, probably NOT needed to write that code. 
I brought value doing it? Probably yes, but just as likely that the time it takes does not justify that value. 
I would have brought more value if I had developed directly and I were focused on TDD in other contexts.

An important confirmation . Some days ago I had a pleasant conversation with Lorenzo Massacci , 
co-founder of <a href="http://www.e-xtrategy.net/" target="_blank">E-xtrategy</a>, a local reality, very active in the field of Agile Methodology. 
Lorenzo told me some experience and his perspective on the TDD and told me: "We are not the "Agile-Talibans", 
we use it in the way that best suits our needs. We leave the pure TDD for complex things , 
for the rest we create unit tests to be automated and let the framework 
(Angular, consolidated by the experience and the work of others), to take care of many aspects ". 
I fully agree with Lorenzo ! From my studies and from my readings, 
I had in mind this conclusion, but hearing that from him, who live the Agile everyday, makes it become something more concrete .

So, to sum up: always think of the final value. TDD JE (Just Enough).
