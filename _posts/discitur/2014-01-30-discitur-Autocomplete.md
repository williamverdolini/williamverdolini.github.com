---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Angular.js Autocomplete
header: Angular.js Autocomplete
description: Progetto Discitur,Tech,Angular.js,Auto Complete,Autocomplete
group: Discitur
tags: [Angular.js]
---
{% include JB/setup %}

Tra i tanti aspetti positivi di questo sprint, uno di quelli che più di
altri ha fatto ulteriormente crescere l’apprezzamento del framework
Angular è stata la realizzazione di una textbox con funzionalità di
autocomplete. schematizzando brutalmente Il flusso previsto dalla funzionalità,
si possono individuare 4 step principali:


<img src="{{ BASE_PATH }}/images/discitur/Autocomplete.png" />


1.   L’utente inizia a digitare le lettere del campo richiesto

2.   ad ogni lettera inserita viene fatta una richiesta ad un servizio di
ricerca

3.   il servizio di ricerca restituisce l’oggetto JSON dei valori che contengono
le lettere inserite

4.   l’array di dati restituito viene renderizzato come valori di una
combobox 

 

La funzionalità, per quanto minima, è un componente verticale che
attraversa tutti i layer dell’architettura. Nei framework con cui abitualmente
lavoro (ASP.NET Web Form, Custom Web Architectures, o in passato JSP, JSF)
questo componente può essere abbastanza complicato da realizzare. Questo tipo
di funzionalità, apparentemente semplici e nella pratica abbastanza complesse,
sono le tipiche funzionalità “traditore”. Per il fatto che sono in genere sotto
stimate perché non si entra mai, in fase di stima, in un dettaglio così
approfondito (almeno le prime volte) e puntualmente il “burned” è decisamente
peggiore dell’”earned”.

In Angular + WebApi, realizzare la funzionalità è stata invece
particolarmente semplice. Ecco i passaggi nel dettaglio:

 

**1) Utilizzo di [Angular-ui Bootstrap](http://angular-ui.github.io/bootstrap/)**

Nella libreria Angular Bootstrap esiste un componente/direttiva già pronta
per il rendering utente: il [Typeahead](http://angular-ui.github.io/bootstrap/#/typeahead).

Il componente consente di essere configurato per bindare un promises,
quindi il risultato di servizi di backend (i classici $http o $resource). Ecco un
esempio:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
<input class="form-control input-sm" type="text"
       name="school"
       ng-model="local.school"
       typeahead-wait-ms="300"
       typeahead="k for k in getSchools($viewValue) | filter:$viewValue"
       typeahead-on-select="select('school')"
       typeahead-editable='false'>

]]></script> 


Il controller contiene i campi per il model collegato ed i metodi per la
gestione delle chiamate server:

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

$scope.local = {
    school: null,
};

$scope.getSchools = function (q) {
    return LessonService.getDistinctValues('school', { schoolQ: q });
}
]]></script> 


**2) Utilizzo di Angular Service standard per le chiamate server-side**

Nulla di nuovo. Ripulendo il codice dal “rumore di fondo”:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

.factory('LessonService', [
'$resource',
'$http',
'$q',
'LessonDTO',
'DisciturSettings',
'DiscUtil',
function ($resource, $http, $q, LessonDTO, DisciturSettings, DiscUtil) {
  return {
    // Get Async list of disciplines
    getDistinctValues: function (type, inputParams) {
      switch (type) {
        case ('school'):
          DiscUtil.validateInput('LessonService.getDistinctValues.school', 
               { schoolQ: null }, 
               inputParams);
          break;
        default:
          throw { 
               code: 20003, 
               message: 'invalid type string for LessonService.getDistinctValues :' + type 
          }
    }

    // create deferring result
    var deferred = $q.defer();

    // Retrieve Async data for lesson id in input        
    $http({ method: 'GET', url: DisciturSettings.apiUrl + 'lesson', params: inputParams })
      .success(function (result) {deferred.resolve(result) })
      .error(function (data) {deferred.reject("Error for LessonService.getDistinctValues:" + data); });
    // create deferring result
    return deferred.promise;
    }
  };
}]);
]]></script> 

**2) WebApi 2 + Entity Framework 6**

La realizzazione di questo servizio è stato…semplice:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
 [HttpGet]
public async Task<List<string>> FindSchool(string schoolQ)
{
   IQueryable<string> schools = db.Lessons
                                  .Where(l => l.School.Contains(schoolQ))
                                  .Select(l => l.School).Distinct();

   return await schools.ToListAsync();
}

]]></script>

**4) Bootstrap Theming per completare**

Per il rendering e l’effetto conclusivo mi sono appoggiato ad uno dei temi
Bootstrap 3 disponibili. L’effetto è molto gradevole:

<img src="{{ BASE_PATH }}/images/discitur/Autocomplete-screenshot.png" />


In questo componente tutto è stato piuttosto facile (incredibile!).
Sicuramente il ruolo più importante ce l’ha Angular Bootstrap che nella
direttiva messa a disposizione fa il grosso del lavoro. Chi sviluppa da un po’
(nemmeno tanto) sa che è meglio provare a cercare se quello che ci serve
qualcun altro l’ha già fatto (meglio) prima di noi.



_[Don’t
reinvent the wheel](http://www.codinghorror.com/blog/2009/02/dont-reinvent-the-wheel-unless-you-plan-on-learning-more-about-wheels.html)_ dicono gli americani. 