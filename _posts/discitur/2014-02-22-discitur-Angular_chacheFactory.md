---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Angular.js $chacheFactory
header: Angular.js $chacheFactory
description: Progetto Discitur,Tech,Angular.js,$chacheFactory,Performance
group: Discitur
tags: [Angular.js,$chacheFactory,Performance]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Angular.js $chacheFactory",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-02-22",
  "articleSection" : [ "Angular.js", "$chacheFactory", "Performance" ],
  "url" : "http://williamverdolini.github.io/2014/02/22/discitur-Angular_chacheFactory"
}
</script>

La $chacheFactory è utile per memorizzare i dati nel primo livello di
cache, quello presente sul client dell’utente. 

Grazie all’uso del servizio $http, è possibile gestire questo livello di
caching in maniera molto semplice.

 

Ad es., poiché la singola lezione ha politiche di aggiornamento molto poco
frequenti, è un buon candidato per essere inserita in cache. Il codice per
poterlo fare è più che intuitivo:



<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
$http.get(DisciturSettings.apiUrl + 'lesson/' + inputParams.id, {cache: true})

]]></script> 

in questa modalità si utilizza il cacheFactory di default, secondo quanto
riportato dalla <a href="http://docs.angularjs.org/api/ng/service/$http" target="_blank">documentazione ufficiale</a>.

Con questa impostazione, dopo la prima volta, tutte le chiamate successive
all’api di ricerca con i medesimi parametri di ricerca non produrrà
un’invocazione lato server, ma verrà risolta dal cache manager di Angular, che
restituirà i dati relativi alla prima invocazione. Questo consente di
ottimizzare notevolmente le performance dell’applicazione

 

Ogni volta che l’utente esegue operazioni sui dati che richiedono che la
cache sia rinfrescata è possibile svuotare la cache della specifica chiave, in
modo che il servizio $http esegua nuovamente una richiesta al server alla
successiva chiamata del servizio

<script type="syntaxhighlighter" class="brush: javascript;highlight: [7]">
<![CDATA[
// Retrieve Async data for lesson id in input        
$http({ method: 'PUT', url: DisciturSettings.apiUrl + 'lesson/' + _lesson.LessonId, data: _lesson })
  .success(
    // Success Callback: Data Transfer Object Creation
    function (result) {
    // if success, clear cache 
    $cacheFactory.get('$http').remove(DisciturSettings.apiUrl + 'lesson/' + _lesson.LessonId)
    deferred.resolve(_dataTransfer(result))
  })
  .error(
    // Error Callback
    function (data) {
      deferred.reject("Error updating lesson id:" + _lesson.lessonId + " -> " + data);
  });
  
]]></script> 

Un buon articolo che dettaglia le possibilità di caching e che presenta un
modulo per definire politiche di refresh della cache angular è il seguente: <a href="https://coderwall.com/p/40axlq" target="_blank">https://coderwall.com/p/40axlq</a>.

 