---
title: "Climbing Angular.js TDD"
excerpt: "Il Progetto Discitur"
header:
    overlay_image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1404&q=80"
    caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
toc: true
toc_label: "Contents"
author_profile: false
pagination: false
sidebar:
  nav: discitur_it
description: Progetto Discitur, Tech, Angular.js, TDD
group: Discitur
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
  "url" : "http://williamverdolini.github.io/2014/01/26/discitur-Climbing_TDD/"
}
</script>
[_english_]({{BASE_PATH }}/2014/01/26/discitur-Climbing_TDD_EN)

 
Sto scalando la montagna, non sono ancora sicuro se riuscirò a raggiungere
la vetta o ritornerò a valle tra un po’, ma dopo un sacco di fatica comincio a
sentire un po’ di aria fresca…

 

Ho deciso di cambiare un po’ del framework scelto nel primo sprint, giusto
per essere più “standard” e trovare maggior supporto in rete, che in fase
esplorativa è vitale. Quindi adesso uso <a href="http://jasmine.github.io/" target="_blank">jasmine</a> come framework per le
asserzioni dello unit test. Per ora mi concentro sullo unit test per fare del
vero TDD.

Nota: in un progetto esplorativo come questo è ok, ma se mi chiedessero di
implementare il TDD in un progetto reale, ci penserei bene e lo farei solo in
un progetto in cui padroneggio le tecnologie e conosco le modalità di unit
testing. O comunque metterei una clausola di qualche settimana per mettere in
piedi una macchina per i test rodata, con esempi nelle diverse casisitiche.
Approcciare il TDD in Angular è dura se non conosci Angular, le librerie ed i
framework per i test. Ci si riesce (io, credo di essere sulla strada giusta),
ma se il tempo è una grandezza fissa, valutare di inserirlo in uno step
successivo non è una cattiva idea.

 

Come dicevo, in questo sprint mi volevo concentrare sul TDD per verificarne
l’efficacia ed ho fatto qualche passo avanti, li elenco e poi li approfondisco:

- backend-less development: mocking dei servizi
     di back-end (sempre per essere coerente ai principi del [Ciclo di Raffinazione]({{ BASE_PATH }}/2014/01/14/discitur-sprint_planning) 
- Condivisione dei mocks tra sviluppo e test
- reale TDD (hurra!!)

 

Per i primi due punti faccio un approfondimento in seguito. Adesso vorrei
far vedere i primi risultati ottenuti con il TDD. Cominciamo dal test che
fallisce. Sul <a href="https://github.com/williamverdolini/discitur-web" target="_blank">repository</a> c’è tutto il codice, ma qui vorrei concentrarmi su un
paio di test.

Lo scenario in cui sono è uno scenario del tutto comune in progetti reali,
per moltissimi aspetti. Ad es. quasi sempre capita di sviluppare componenti
nuovi di una applicazione esistente e quindi per lo sviluppo dell’applicazione
ci può far comodo utilizzare i servizi veri (qualora stabili) e mockare solo i
servizi in via di sviluppo per poter separare gli sviluppi in maniera semplice.
Penso possa essere utile descrivere la sequenza degli step che ho seguito nel
mio sviluppo:

1. Creare il mock dei dati restituiti dal
     servizio. Si parte dai dati e dal loro modello quindi. Questo è un altro
     aspetto comune, soprattutto nella system integration. Infatti quando siete
     chiamati ad integrare servizi esterni, di terze parti, aldilà degli
     aspetti tecnici dell’invocazione, la cosa principale è gestire i dati
     scambiati con il servizio e quindi comprenderne e gestirne l’interfaccia e
     creare i mock per lavorare in autonomia. Avendo già i dati di una lezione
     è stato abbastanza semplice definire il <a href="https://github.com/williamverdolini/discitur-web/blob/sprint2/mock/modules/lesson/mocks.js#L6" target="_blank">mock iniziale</a>
2. A questo punto creo il test per l’invocazione
     del servizio. Lo <a href="https://github.com/williamverdolini/discitur-web/blob/sprint2/test/unit/modules/jservicesSpec.js#L285" target="_blank">unit test</a> utilizza il mock dei dati creato e tutte le
     altre impostazioni comuni alle chiamate reali (ad es. URL di base delle
     api per i servizi già integrati)
3. nel test cerco di individuare ed <a href="https://github.com/williamverdolini/discitur-web/blob/sprint2/test/unit/modules/jservicesSpec.js#L287" target="_blank">isolare il
     codice da produrre</a> nell’applicazione reale
4. Eseguo il test per ottenere il “RED”
5. sviluppo il codice applicativo per soddisfare
     il test. In questa fase, dal mio punto di vista, è importante fare in modo
     che i dati mockati siano gli stessi sia per il test sia per
     l’applicazione. Questo consente di andare più spediti nello sviluppo e nel
     test senza avere a che fare con duplicazione del codice. In questa fase
     c’è spesso attività di refactoring del codice sia per quello
     dell’applicazione, sia per quello del test
6. Rieseguo il test per ottenere il “GREEN”
7. Si riparte da 1 o 2 a seconda dell’esigenza

 

 

La struttura delle cartelle del mio progetto è diventata quindi la
seguente:

<img src="{{ BASE_PATH }}/images/discitur/mock_folder.png" />

Mock contiene le impostazioni di mock (al momento un solo file .js) ed è in
comune ai due ambienti. Ovviamente resterà nell’ambiente dell’applicazione solo
nella fase di sviluppo. Ecco cosa c’è in questo momento nel file di mock.js

```js
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
```


mostro il codice di due cicli per mostrare i risultati.

**CICLO 1**


test

```js
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
```

  
sviluppo

```js
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
```

  
**CICLO 2**

 

test

```js
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
```

sviluppo


```js
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
```


Sviluppare il codice è stato semplice e mi sembra evidente l’operazione di
refactoring fatta, inserendo i metodi privati per il transfer sull’Object Model
di Front-end.

Dopo un veloce refactoring anche dei test, i miei test ora passano tutti!
Ed una veloce chiamata sulla console della mia applicazione lo dimostra:


<img src="{{ BASE_PATH }}/images/discitur/DTO_console.png" />



A questo punto sono galvanizzato dai risultati, ma devo dormirci sopra, perché
non ho capito se l’entusiasmo nasca dal fatto che il TDD sia effettivamente
efficace o perché, dopo tanti tentativi, sono riuscito a far funzionare
qualcosa…quindi…buonanotte!