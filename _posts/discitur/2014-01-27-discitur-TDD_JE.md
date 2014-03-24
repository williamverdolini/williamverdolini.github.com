---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Angular.js TDD, QB (Quanto Basta)
header: Angular.js TDD, QB (Quanto Basta)
description: Progetto Discitur, Tech, Angular.js, TDD
group: Discitur
tags: [Angular.js,TDD]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Angular.js TDD, QB (Quanto Basta)",
  "author" : {
    "@type" : "Person",
    "name" : "william verdolini"
  },
  "datePublished" : "2014-01-27",
  "articleSection" : [ "Angular.js", "TDD" ],
  "url" : "http://williamverdolini.github.io/2014/01/27/discitur-TDD_JE/"
}
</script>
[_english_]({{BASE_PATH }}/2014/01/27/discitur-TDD_JE_EN)

 
C’ho dormito sopra più notti e lavorato ancora un po’. Mi sono imbattuto in qualche caso significativo. Parto dal codice che è più semplice. 

**1° TDD Cycle (ripulito del codice iniettato)**

_il test: _


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
it("Should the ControllerX controller exists", function () {
    var _ctrl = _$controller('ControllerX', { $scope: _scope }); // <-- _scope = {}
    expect(_ctrl).toBeDefined();
});
]]></script> 


_il codice: _

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

_il test: _


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
it("Should ControllerX have propertyY in its $scope", function () {
    var _ctrl = _$controller('ControllerX', { $scope: _scope }); // <-- _scope = {}
    expect(_scope.propertyY).toBeDefined();
});
]]></script> 



_il codice: _


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



bene.

**3° TDD Cycle**

_il test: _


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
it("Should ControllerX.propertyY be populated with propertyYData in input", function () {
    _ctrl = _$controller('LessonNewsCtrl', { $scope: _scope, propertyYData: {} });

    expect(_scope.propertyY).toEqual({})

});
]]></script> 



_il codice: _


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



Con questo step ho creato un servizio per passare i dati iniziali nel controller e funziona,
ma questo step mi obbliga ad aggiornare il codice dei test precedenti, perchè propertyYData non è iniettato...
il che significa che la terza iterazione TDD rompe i precedenti casi di test!!!
Senza una ragione funzionale...

L’esempio sopra  ha fatto un po’ vacillare la mia fiducia nel TDD in Angular.js, 
anche se nel metodo TDD ci sta che si debba re-ingegnerizzare il codice del test…anche 
se mi sarei aspettato un comportamento diverso (soprattutto in js).

Poi ho continuato ancora, nel TDD di Angular services. Il codice lo pubblicherò e quindi, 
volendo sarà possibile vedere tutti i dettagli, ma fondamentalmente vorrei concentrare l’esperienza su un dettaglio. 
Stavo realizzando il servizio di ricerca (uno dei principali dell’applicazione) e continuavo nell’applicare il TDD. 
Nello scrivere il test dopo poco sono arrivato all’esigenza di realizzare l’interfaccia di input che, 
nella mia testa DDD ( _Development-Driven Development_ ) suonava così:




<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
.factory('LessonService', [
        …,
        function ($resource, $http, $q) {
            …
            search: function (inputParams) {…}
        }]);
]]></script> 



dove




<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
inputParams = {
    discipline: '...',
    school: '...',
    ...
}
]]></script> 


Dopo diversi approfondimenti e ragionate (non tutti immediati come mi sarei aspettato), 
arrivo alla scrittura del seguente set di test (nella solita prassi Red-Dev-Green). 
Scorreteli tutti perché penso siano significativi:

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

Ricordiamoci che la mia intenzione era definire come input del mio servizio un oggetto le cui proprietà potessero essere  usate come parametro del servizio REST.
Il codice che ne è venuto fuori è stato il seguente:


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


poi rifattorizzato in:


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


Con la creazione di un servizio di Utility da riutilizzare nel resto dei servizi. 


La domanda è: **è stata una scelta giusta quella di seguire questo processo?**


La mia risposta abbastanza convinta è: **NO**.


Perché? Perché in realtà quello che volevo ottenere era banale, l’avevo in testa sin dall’inizio; 
ed il TDD è più efficace in altri contesti (per me), ovvero quando gli algoritmi non sono così 
scontati ed è bene puntare al design prima di scrivere qualcosa. 
Inoltre per ottenere il risultato iniziale ho scritto decine e decine di righe di codice 
(ben inteso, probabilmente si poteva scrivere meglio, ma il mio obiettivo era scrivere con una certa 
fluidità il test anche per poterlo paragonare ad uno sviluppo classico). 
Confesso che senza TDD non avrei scritto nulla del codice che valida l’input, 
ma nel contesto in cui sono probabilmente NON serviva scrivere quel codice. 

Ho portato valore facendolo? Probabilmente sì, ma altrettanto probabilmente il tempo impiegato 
non giustifica quel valore. 
Avrei portato più valore se avessi sviluppato direttamente e mi fossi concentrato sul TDD in altri contesti.

Una conferma importante. 
Qualche sera fa, ho avuto una piacevole conversazione con Lorenzo Massacci, co-fondatore di <a href="http://www.e-xtrategy.net/" target="_blank">E-xtrategy</a>, 
una realtà locale molto attiva in campo Agile. Lorenzo mi ha raccontato qualche esperienza ed 
il suo punto di vista sul TDD e mi ha detto: “noi non siamo talebani dell’Agile, 
lo utilizziamo nel modo in cui meglio si adatta alle esigenze. 
Il TDD puro lo lascio per le cose complesse, per il resto creo unit test da automatizzare 
e lascio al framework (Angular), consolidato dall’esperienza e dal lavoro di altri, di occuparsi di molti aspetti”. 
Sono pienamente d’accordo con Lorenzo! 
Dai miei studi e dalle mie letture avevo in testa questa conclusione, 
ma sentirla esprimere da chi vive l’Agile tutti i giorni la fa diventare qualcosa di più concreto.

Quindi, riassumendo: pensare sempre al Valore finale. TDD QB (Quanto Basta).
