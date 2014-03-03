---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Angular DTO
header: Angular DTO
description: Progetto Discitur, Tech, Angular.js, DTO
group: Discitur
tags: [Angular.js,DTO,Software Design]
---
{% include JB/setup %}

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
  "url" : "http://williamverdolini.github.io/2014/01/23/discitur-DTO/"
}
</script>

Nel primo sprint realizzavo un
semplice controller che visualizzava i dati di una lezione. La lezione è un
oggetto composto da diversi sotto-oggetti. La struttura che prevedevo nel
front-end è:


- Lesson (title, school, classroom, content, rate, publishedOn,
     etc)
    - Author (name, surname, etc)
    - Lista di Goods (ciò che è andato bene nella
      lezione)
        - Good (description)
    - Lista di Bads (ciò che andato male nella
      lezione)
        - Bads (description)
    - Lista di Tags (per la classificazione
      trasversale della lezione)

Per l’approccio definito nel [Ciclo di Raffinazione]({{ BASE_PATH }}/2014/01/18/discitur-value_env) ho sviluppato prima il FE con i mock dei
servizi, ho verificato con il PO il risultato e successivamente ho realizzato
il back-end. Una volta passato al BE ho trovato più adatto prevedere un modello
(entity-table) che prevedesse una sola Entity/Table LessonFeedback per inserire
sia gli aspetti positivi sia quelli negativi di una lezione, differenziandoli
tramite l’attributo Nature del FeedBack

 

A BE quindi il mio Entity Model era del tipo:

- Lesson
    - Author (name, surname, email, userName, etc)
    - Lista di FeedBacks
        - FeedBack (Nature, description)
    - Lista di Tags (perla classificazione
      trasversale della lezione)

Questo approccio e lo scenario in sè, di fatto, è un approccio ed uno
scenario riscontrabile molto spesso anche in realtà enterprise, infatti capita che:

- ci siano gruppi separati per l’analisi e lo
     sviluppo del FE e del BE
- ci sia già un dizionario dei servizi (SOA,
     REST, ecc..) pronti per l’uso che restituiscono i dati che servono.
     Nessuno sviluppatore di Back-end ti farà una copia di un servizio
     esistente per ridarti la struttura che ti aspetti sul FE. Ed è in genere
     giusto.

 

Trovo sempre utile ed importante, quindi, marcare una linea netta di
separazione tra FE e BE per una svariata serie di motivi. Ecco perché, anche
senza avere a che fare con sistemi remoti, mi piace implementare classi [DTO](http://en.wikipedia.org/wiki/Data_transfer_object) per il
trasferimento dei dati dai servizi ad un Object Model più aderente alle
esigenze dello specifico Front-End.

 

In Angular ho realizzato il tutto attraverso l’uso dei concetti di Services
e Promises, di seguito alcuni articoli utili nei miei approfondimenti (oltre la
documentazione ufficiale) :

- [http://blog.brunoscopelliti.com/angularjs-promise-or-dealing-with-asynchronous-requests-in-angularjs](http://blog.brunoscopelliti.com/angularjs-promise-or-dealing-with-asynchronous-requests-in-angularjs)
- [http://www.bennadel.com/blog/2527-Defining-Instantiatable-Classes-In-The-AngularJS-Dependency-Injection-Framework.htm](http://www.bennadel.com/blog/2527-Defining-Instantiatable-Classes-In-The-AngularJS-Dependency-Injection-Framework.htm)
- [https://egghead.io/lessons/angularjs-chained-promises](https://egghead.io/lessons/angularjs-chained-promises)

 

Ecco il codice.


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

Il controller a questo punto resta semplice

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

ed il suo template lavora su un Object Model disaccoppiato dal servizio di BE. 

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

Questo design ha il vantaggio di limitare al solo LessonService il rework dovuto a variazioni del servizio di backend che non richiedono modifiche all’interfaccia utente.

