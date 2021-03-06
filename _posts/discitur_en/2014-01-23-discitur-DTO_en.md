---
title: "Discitur Project"
tagline: Angular DTO
header: Angular DTO
description: Discitur Project, Tech, Angular.js, DTO
group: Discitur_en
tags: [Angular.js,DTO,Software Design]
---

<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Angular DTO",
  "author" : {
    "@type" : "Person",
    "name" : "william verdolini"
  },
  "datePublished" : "2014-01-23",
  "articleSection" : [ "Angular.js", "DTO", "Software Design" ],
  "url" : "https://williamverdolini.github.io/2014/01/23/discitur-DTO_en/"
}
</script>

In the first sprint was making a simple controller that displayed the data in a lesson. The lesson is a 
entity composed of several sub-entities. The structure that I foresaw in front-end is:


- Lesson (title, school, classroom, content, rate, publishedOn,
     etc)
    - Author (name, surname, etc)
    - Good Practices List (lesson's pro)
        - Good (description)
    - Bads Practices List (lesson's cons)
        - Bads (description)
    - Tags List

For the approach defined in the [Refining Cycle]({{ BASE_PATH }}/2014/01/18/discitur-value_env) I developed the FE with the mock service, 
I checked with the PO the result and then I realized the back end. On Back-end side I found most suitable to provide a model (entity-table) 
providing for a single Entity/Table LessonFeedback to enter both the pros and cons of a lesson, differentiating through the "Nature" attribute of FeedBack

At Back-end side, my entity model is something like the following: 

- Lesson
    - Author (name, surname, email, userName, etc)
    - FeedBacks List
        - FeedBack (Nature, description)
    - Tags List

This approach and the scenario itself, in fact, is very common in a lot of enterprise scenarios, it happens that: 

- there are separate groups for analysis and development of the FE and BE 
- there is already a dictionary of services (SOA, REST, etc. ..) ready to use that return the data you need. 
     None Back-end developer will make a copy of an existing service to give you back the structure that _you_ expect on the FE. 
     And it's usually right.


I always find it useful and important, therefore, to mark a clear line of separation between FE and BE for a lot of reasons. 
That's why, even without having to deal with remote systems, I like to implement <a href="http://en.wikipedia.org/wiki/Data_transfer_object" target="_blank">DTO</a> classes for transferring data from an Object Model services 
to the needs of the specific front-end.


In Angular, I realized all through the use of Services and Promises, below are some useful articles (beyond the official documentation):

- <a href="http://blog.brunoscopelliti.com/angularjs-promise-or-dealing-with-asynchronous-requests-in-angularjs" target="_blank">http://blog.brunoscopelliti.com/angularjs-promise-or-dealing-with-asynchronous-requests-in-angularjs</a>
- <a href="http://www.bennadel.com/blog/2527-Defining-Instantiatable-Classes-In-The-AngularJS-Dependency-Injection-Framework.htm" target="_blank">http://www.bennadel.com/blog/2527-Defining-Instantiatable-Classes-In-The-AngularJS-Dependency-Injection-Framework.htm</a>
- <a href="https://egghead.io/lessons/angularjs-chained-promises" target="_blank">https://egghead.io/lessons/angularjs-chained-promises</a>

 

That's the code.


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module('Lesson')
    .factory('LessonDTO', function () {
        function LessonDTO() {
            this.lessonId = null;
            this.title = null;
            this.discipline = null;
            this.school = null;
            this.classroom = null;
            this.rate = null;
            this.author = null;
            this.publishedOn = null;
            this.goods = [];
            this.bads = [];
            this.tags = [];
            this.content = null;
            this.conclusion = null;
        }
        return (LessonDTO);
    })
    .factory('LessonService', function ($resource, $http, $q, LessonDTO) {
        return {
            // Retrieve Async data for lesson id in input 
            // and return a LessonDTO instance
            getDB: function (inputParams) {
                // create deferring result
                var deferred = $q.defer();

                // Retrieve Async data for lesson id in input             
                $http.get('../api/lesson/' + inputParams.id)
                    .success(
                        // Success Callback: Data Transfer Object Creation
                        function (result) {
                            var lesson = new LessonDTO();
                            lesson.lessondId = result.lessondId;
                            lesson.title = result.Title;
                            lesson.discipline = result.Discipline;
                            lesson.school = result.School;
                            lesson.classroom = result.Classroom;
                            lesson.author = {
                                name: result.Author.Name,
                                surname: result.Author.Surname
                            }
                            lesson.publishedOn = result.PublishDate;
                            lesson.rate = result.Rate;
                            angular.forEach(result.FeedBacks, function (feedBack, key) {
                                if (feedBack.Nature == 1) this.goods.push(feedBack.Feedback)
                                if (feedBack.Nature == 2) this.bads.push(feedBack.Feedback)
                            }, lesson);
                            angular.forEach(result.Tags, function (tag, key) {
                                this.tags.push(tag.LessonTagName)
                            }, lesson);
                            lesson.content = result.Content;
                            lesson.conclusion = result.Conclusion;

                            deferred.resolve(lesson)
                        })
                    .error(
                        // Error Callback
                        function () {
                            deferred.reject("no Lesson for id:" + inputParams.id);
                        });

                return deferred.promise;
            }
        };
    });
]]></script> 

Now the controller becomes simple

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

angular.module('Lesson')
    .controller('LessonCtrl', [
        '$scope',
        'lessonData',
        function (
            $scope,
            lessonGet) {
            // lesson data async
            $scope.lesson = lessonData;
        }
    ]);


]]></script> 

and its template works on an Object Model decoupled from Back-End. 

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

    <div id="LessonSummary" class="row">
        <div id="lessonGoods" class="col-md-6" ng-switch="lesson.goods && lesson.goods.length>0">
            <h3>{{labels.lessonGoods}}</h3>
            <ol ng-switch-when="true">
                <li ng-repeat="item in lesson.goods">{{item}}</li>
            </ol>
            <div ng-switch-when="false">{{labels.noLessonGoods}}</div>
        </div>
        <div id="lessonBads" class="col-md-6" ng-switch="lesson.bads && lesson.bads.length>0">
            <h3>{{labels.lessonBads}}</h3>
            <ol ng-switch-when="true">
                <li ng-repeat="item in lesson.bads">{{item}}</li>
            </ol>
            <div ng-switch-when="false">{{labels.noLessonBads}}</div>
        </div>
    </div>


]]></script> 

This design has the advantage of reduce future reworks due to changes in the backend service that does not require changes 
to the user interface to just the LessonService code.

