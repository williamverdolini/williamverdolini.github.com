---
title: "Discitur Project"
tagline: Climbing Angular.js TDD
header: Climbing Angular.js TDD
description: Progetto Discitur, Tech, Angular.js, TDD
group: Discitur_en
tags: [Angular.js,TDD]
---

<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Climbing Angular.js TDD",
  "author" : {
    "@type" : "Person",
    "name" : "williamverdolini"
  },
  "datePublished" : "2014-01-26",
  "articleSection" : [ "Angular.js", "TDD" ],
  "url" : "http://williamverdolini.github.io/2014/01/26/discitur-Climbing_TDD_en/"
}
</script>
[_italian_]({{BASE_PATH }}/2014/01/26/discitur-Climbing_TDD)

 
 
I'm climbing the mountain, I'm not sure if I can reach the top or return to the valley in a while, 
but after a lot of effort I start to breath a bit of fresh air ... 

I decided to change a bit of the framework chosen in the first sprint, 
just to be more "standard" and find more support in the web, which is vital in the exploratory stage. 
So now I use <a href="http://jasmine.github.io/" target="_blank">jasmine</a> as a assertion framework for the unit test (no more mocha). 
For now I focus on unit tests to do some real TDD. 

Note: In an exploratory project like this is ok, but if I were asked to implement TDD in a real project, 
I would think a lot about that and, probably, I would do it only in a project in which I master the technology and unit testing know how. 
Or at least I would put a clause of a few weeks to put together a well-oiled machine for testing, with examples in different cases. 
TDD approach in Angular is tough if you do not know Angular, the libraries and the testing frameworks. 
You can (I think I'm on the right track), but if time is a fixed size, consider placing it in a second step is not a bad idea. 

 
As I said, in this sprint I wanted to focus on TDD to verify
the effectiveness and I have made ​​some progress , list them and then deepen them :

- Backend-less development: mocking services
     back-end ( always to be consistent with the principles of the [Loop Refining]({{BASE_PATH }}/2014/01/14/discitur-sprint_planning)
- Sharing mocks between development and testing
- Real (TDD hurray!!)



For the first two points do an in-depth later. I would now like
to see the first results obtained with the TDD . Let's start by testing that
fails. On the <a href="https://github.com/williamverdolini/discitur-web" target="_blank">repository</a> is all the code, but here I want to focus on a
couple of tests.

The scenario is a scenario in which they are quite common in real-world projects ,
for many aspects . For example . almost always happen to develop components
new to an existing application and then for application development
There may be convenient to use the actual services ( if stable ) and mockare only
services in developing countries in order to separate the developments in an easy way.
I think it could be useful to describe the sequence of steps that I followed in
My development :

1. Create the mock data returned from the 
     service. It starts from the data. This is another common aspect, especially in system integration. In fact, when you 
     have to integrate some external, third-party, services, beyond the 
     technical aspects of the invocation, the main thing is to manage the data 
     exchanged with the service and then understand and manage the interface and 
     create the mock to work independently. Having the data in a lesson it was quite easy to define the <a href="https://github.com/williamverdolini/discitur-web/blob/sprint2/mock/modules/lesson/mocks.js#L6" target="_blank">initial mock</a> 
2. At this point I create the test for the service's invocation. The <a href="https://github.com/williamverdolini/discitur-web/blob/sprint2/test/unit/modules/jservicesSpec.js#L285" target="_blank">unit test</a> using the mock data created and all 
     other settings common to the actual calls (eg. ApiURL basis for services already integrated)
3. in the test code try to find and <a href="https://github.com/williamverdolini/discitur-web/blob/sprint2/test/unit/modules/jservicesSpec.js#L287" target="_blank">isolate the code to develop</a> in the real application 
4. I run the test to get the "RED" 
5. Develop application code to pass 
      the test. At this stage, from my point of view, it is important to make sure 
      mocked data are the same for both the test and 
      the application. This allows you to get more shipped in the development and 
      test without having to deal with code duplication. In this phase 
      there is often activity of refactoring the code for both the 
      application and the test 
6. Execute the test again to get the "GREEN" 
7. It starts again from step 1 or 2 depending on the requirements 



The folder structure of my project has become the following: 

<img src="{{ BASE_PATH }}/images/discitur/mock_folder.png" /> 

Mock folder contains mock settings (currently only one file .js) and is 
common to the two environments. Obviously, this file will remain in the environment only 
in the development phase. Here's what's in the file mock.js at this time


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[


angular.module('Lesson')
    .config(function ($provide) {
        $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
    })
    .constant('MockedData', {
        lessons: [
          { "Author": { "UserId": 1, "Name": "Federica-MOCK", "Surname": "Giampaoletti", "Email": "chiarestelle@virgilio.it", "UserName": "Fede" }, "FeedBacks": [{ "LessonFeedbackId": 1, "LessonId": 1, "Nature": 1, "Feedback": "Ampia partecipazione degli alunni" }, { "LessonFeedbackId": 2, "LessonId": 1, "Nature": 1, "Feedback": "Semplice da spiegare" }, { "LessonFeedbackId": 3, "LessonId": 1, "Nature": 1, "Feedback": "consente collegamenti interdisciplinari" }, { "LessonFeedbackId": 4, "LessonId": 1, "Nature": 1, "Feedback": "utilizza media che catturano l'attenzione" }, { "LessonFeedbackId": 5, "LessonId": 1, "Nature": 2, "Feedback": "un po' lunga, rischia di non chiudersi in lezioni interrotte frequentemente" }, { "LessonFeedbackId": 6, "LessonId": 1, "Nature": 2, "Feedback": "poco fruttuosa se negli orari finali" }], "Tags": [{ "LessonTagName": "classe multi-etnica", "LessonId": 1 }, { "LessonTagName": "Classe numerosa", "LessonId": 1 }, { "LessonTagName": "DSA", "LessonId": 1 }, { "LessonTagName": "Rivoluzione Francese", "LessonId": 1 }], "LessonId": 1, "Title": "La rivoluzione Francese secondo Robespierre", "Discipline": "Storia", "School": "Scuola Secondaria", "Classroom": "II Media", "Rate": 4, "UserId": 1, "PublishDate": "2013-12-08T00:00:00", "Content": "…", "Conclusion": "…" },
          { "Author": { "UserId": 2, "Name": "William-MOCK", "Surname": "Verdolini", "Email": "william.verdolini@gmail.com", "UserName": "Willy" }, "FeedBacks": [{ "LessonFeedbackId": 7, "LessonId": 2, "Nature": 1, "Feedback": "Collegamenti a video e film di interesse" }, { "LessonFeedbackId": 8, "LessonId": 2, "Nature": 1, "Feedback": "Concreti riferimenti ad esempi carismatici" }, { "LessonFeedbackId": 9, "LessonId": 2, "Nature": 2, "Feedback": "Scarsa partecipazione degli alunni" }, { "LessonFeedbackId": 10, "LessonId": 2, "Nature": 2, "Feedback": "Personaggio non conosciuto in Italia" }, { "LessonFeedbackId": 11, "LessonId": 2, "Nature": 2, "Feedback": "Riferimenti a fatti non di stretta attualità" }, { "LessonFeedbackId": 12, "LessonId": 2, "Nature": 2, "Feedback": "Film scarsamente conosciuti. Per usare dei riferimenti occorre verificare che questi siano veri riferimenti per gli alunni" }], "Tags": [{ "LessonTagName": "Attualità", "LessonId": 2 }, { "LessonTagName": "Classe multi-etnica", "LessonId": 2 }, { "LessonTagName": "Razzismo", "LessonId": 2 }], "LessonId": 2, "Title": "Impegno Civile", "Discipline": "Educazione Civica", "School": "Scuola Secondaria", "Classroom": "III Media", "Rate": 2, "UserId": 2, "PublishDate": "2014-01-02T00:00:00", "Content": "…", "Conclusion": "…" },
          { "Author": { "UserId": 1, "Name": "Federica-MOCK", "Surname": "Giampaoletti", "Email": "chiarestelle@virgilio.it", "UserName": "Fede" }, "FeedBacks": [{ "LessonFeedbackId": 13, "LessonId": 3, "Nature": 1, "Feedback": "Si apprende velocemente grazie alla creazione di un manufatto fisico" }, { "LessonFeedbackId": 14, "LessonId": 3, "Nature": 1, "Feedback": "Gli obiettivi sono raggiunti indipendentemente dal livello di partenza e dalla presenza di DSA" }], "Tags": [], "LessonId": 3, "Title": "La Carta Geografica", "Discipline": "Geografia", "School": "Scuola Secondaria", "Classroom": "I Media", "Rate": 5, "UserId": 1, "PublishDate": "2014-01-04T00:00:00", "Content": …" }
        ]
    })
    .run(function ($httpBackend, DisciturSettings, MockedData) {
      // define responses for requests here as usual
        $httpBackend.whenGET(DisciturSettings.apiUrl + 'lesson/').respond(MockedData.lessons);
        $httpBackend.whenGET(DisciturSettings.apiUrl + 'lesson/1').respond(MockedData.lessons[0]);
        
        // Don't mock GET on modules
        $httpBackend.whenGET(/modules\/\w+.*/).passThrough();

        // For everything else, don't mock
        $httpBackend.whenGET(/^\w+.*/).passThrough();
        $httpBackend.whenPOST(/^\w+.*/).passThrough();
    });


]]></script> 

Below the code of two test cycles to show the results.

**CYCLE 1**


test code

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[


  describe("LessonService [invoke]", function () {
    var _MockedData,
        _httpBackend,
        _LessonService,
        _DisciturSettings;

    // Before each test in the suite I inject the modules needed
    beforeEach(function () {
        //load the module.
      module('Lesson');

      //get your service, also get $httpBackend
      //$httpBackend will be a mock, thanks to angular-mocks.js
      inject(function (MockedData, $httpBackend, LessonService, DisciturSettings) {
        _MockedData = MockedData;
        _httpBackend = $httpBackend;      
        _LessonService = LessonService;
        _DisciturSettings = DisciturSettings;
      });
    })
    
    //make sure no expectations were missed in your tests.
    //(e.g. expectGET or expectPOST)
    afterEach(function() {
      _httpBackend.verifyNoOutstandingExpectation();
      _httpBackend.verifyNoOutstandingRequest();
    });
 
    //-------- TEST CASES:
    it('Should the LessonService.search() return all the lessons', function () {
      //create an object with a function to spy on.
      var _test = {
          successCB: function() {}
      };
      //set up a spy for the callback handler.
      spyOn(_test, 'successCB');

      // Create mocked api route.
      // I want to emulate what I will do in real app code, 
      // so I use the same config as in the real code
      _httpBackend.expectGET(_DisciturSettings.apiUrl + 'lesson/').respond(_MockedData.lessons)

      //--------------------- TEST CODE TO DRIVE THE DEVELOPMENT [START] -------------------------
      //make the call.
      var returnedPromise = _LessonService.search();
      
      //use the handler you're spying on to handle the resolution of the promise.
      returnedPromise.then(_test.successCB);
      
      //--------------------- TEST CODE TO DRIVE THE DEVELOPMENT [END] ---------------------------

      //flush the backend to "execute" the request to do the expectedGET assertion.
      _httpBackend.flush();      
      
      //check your spy to see if it's been called with the returned value.  
      expect(_test.successCB).toHaveBeenCalledWith(_MockedData.lessons);
    });


]]></script> 

  
Dev code


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
    .factory('LessonService', [
        '$resource',
        '$http',
        '$q',
        'LessonDTO',
        'DisciturSettings',
        function ($resource, $http, $q, LessonDTO, DisciturSettings) {
          var _dataTransfer = function (lessonData) {
            var _dto = new LessonDTO();

            return _dto;          
          }


          return {
              // Retrieve Async data for lesson id in input 
              // and return a LessonDTO instance
              get: function (inputParams) {
                  // create deferring result
                  var deferred = $q.defer();

                  // Retrieve Async data for lesson id in input        
                    
                  //$http.get('../api/lesson/' + inputParams.id)
                  $http.get(DisciturSettings.apiUrl + 'lesson/' + inputParams.id)
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
              },
              search: function (inputParams) {
                  // create deferring result
                  var deferred = $q.defer();
                    
                  // Retrieve Async data for lesson id in input        
                  $http.get(DisciturSettings.apiUrl + 'lesson/' )
                      .success(
                          // Success Callback: Data Transfer Object Creation
                          function (result) {
                              deferred.resolve(result)
                          })
                      .error(
                          // Error Callback
                          function (data) {
                              deferred.reject("Error for search:" + data);
                          });
                    
                  //deferred.resolve(mockedLessonData);
                  return deferred.promise;
              }
          };
      }]);

]]></script> 

  
**CYCLE 2**

 

test code

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

    it('Should the LessonService.search() return all the lessons in DT Object Model', function () {
      // Create a test client to explore returned data
      // DO NOT USE Spy (It prevents to callback in promise chain)
      var _test = {
        //--------------------- TEST CODE TO DRIVE THE DEVELOPMENT [START] -------------------------
        successCB: function (data) {
            for (var i = 0; i < data.length; i++) {
              expect(data[i].author, 'proprieta\' author').toBeDefined();
              expect(data[i].tags, 'proprieta\' tags').toBeDefined();
              expect(data[i].title, 'proprieta\' title').toBeDefined();
              expect(data[i].goods, 'proprieta\' goods').toBeDefined();
              expect(data[i].bads, 'proprieta\' bads').toBeDefined();

              expect(data[i].Author, 'proprieta\' Author').not.toBeDefined();
              expect(data[i].Tags, 'proprieta\' Tags').not.toBeDefined();
              expect(data[i].Title, 'proprieta\' Title').not.toBeDefined();
              expect(data[i].FeedBacks, 'proprieta\' FeedBacks').not.toBeDefined();
            }
        }
        //--------------------- TEST CODE TO DRIVE THE DEVELOPMENT [END] ---------------------------
      };

      // Create mocked api route.
      // I want to emulate what I will do in real app code, 
      // so I use the same config as in the real code
      _httpBackend.expectGET(_DisciturSettings.apiUrl + 'lesson/').respond(_MockedData.lessons)

      //make the call.
      var returnedPromise = _LessonService.search();

      //use the handler you're spying on to handle the resolution of the promise.
      returnedPromise.then(_test.successCB);

      //flush the backend to "execute" the request to do the expectedGET assertion.
      _httpBackend.flush();
    });

  })


]]></script> 


dev code


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

angular.module('Lesson')
    /*-------------------------------------------------------------------------------
    Vantaggi del DTO:
    - disaccoppiamento tra i dati restituite dal BE e quelli gestiti dal FE
    - presenza di un (Client) Object Model distinto dal (Server( Object e/o Entity Model
    - possibilità di verificare il reale contenuto delle classi a codice (non a runtime)

    riferimenti: http://www.bennadel.com/blog/2527-Defining-Instantiatable-Classes-In-The-AngularJS-Dependency-Injection-Framework.htm
    ---------------------------------------------------------------------------------*/
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
    .factory('LessonService', [
        '$resource',
        '$http',
        '$q',
        'LessonDTO',
        'DisciturSettings',
        function ($resource, $http, $q, LessonDTO, DisciturSettings) {
          // Private methods for DTO purposes
          var _dataTransfer = function (lessonData) {
            var lesson = new LessonDTO();
            lesson.lessondId = lessonData.lessondId;
            lesson.title = lessonData.Title;
            lesson.discipline = lessonData.Discipline;
            lesson.school = lessonData.School;
            lesson.classroom = lessonData.Classroom;
            lesson.author = {
              name: lessonData.Author.Name,
              surname: lessonData.Author.Surname
            }
            lesson.publishedOn = lessonData.PublishDate;
            lesson.rate = lessonData.Rate;
            angular.forEach(lessonData.FeedBacks, function (feedBack, key) {
              if (feedBack.Nature == 1) this.goods.push(feedBack.Feedback)
              if (feedBack.Nature == 2) this.bads.push(feedBack.Feedback)
            }, lesson);
            angular.forEach(lessonData.Tags, function (tag, key) {
              this.tags.push(tag.LessonTagName)
            }, lesson);
            lesson.content = lessonData.Content;
            lesson.conclusion = lessonData.Conclusion;
            return lesson;
          }
          var _arrayDataTransfer = function (resultArray) {
            var lessons = [];
            for (var i = 0; i < resultArray.length; i++) {
              lessons.push(_dataTransfer(resultArray[i]));
            }
            return lessons;
          }

          return {
              // Retrieve Async data for lesson id in input 
              // and return a LessonDTO instance
              get: function (inputParams) {
                  // create deferring result
                  var deferred = $q.defer();

                  // Retrieve Async data for lesson id in input        
                  //$http.get('../api/lesson/' + inputParams.id)
                  $http.get(DisciturSettings.apiUrl + 'lesson/' + inputParams.id)
                      .success(
                          // Success Callback: Data Transfer Object Creation
                          function (result) {
                              deferred.resolve(_dataTransfer(result));
                          })
                      .error(
                          // Error Callback
                          function () {
                              deferred.reject("no Lesson for id:" + inputParams.id);
                          });

                  return deferred.promise;
              },
              search: function (inputParams) {
                  // create deferring result
                  var deferred = $q.defer();
                    
                  // Retrieve Async data for lesson id in input        
                  $http.get(DisciturSettings.apiUrl + 'lesson/' )
                      .success(
                          // Success Callback: Data Transfer Object Creation
                          function (result) {
                            deferred.resolve(_arrayDataTransfer(result))
                          })
                      .error(
                          // Error Callback
                          function (data) {
                              deferred.reject("Error for search:" + data);
                          });
                    
                  //deferred.resolve(mockedLessonData);
                  return deferred.promise;
              }
          };
      }]);

]]></script> 

Develop the code was simple and it seems clear to me the refactoring operation 
done by entering the private methods for the transfer on the Front-end object Model. 

After a quick refactoring of test code, all my test pass now! 
And a quick call on the console of my application demonstrates this: 


<img src="{{ BASE_PATH }}/images/discitur/DTO_console.png" /> 



At this point, I'm very happy for the results, but I have to sleep on it, because 
I did not understand if the enthusiasm arises from the fact that the TDD is actually 
effective or just because, after so many attempts, I managed to run 
something ... so ... 


  
good night!
