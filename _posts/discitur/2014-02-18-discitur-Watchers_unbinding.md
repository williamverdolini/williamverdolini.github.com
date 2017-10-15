---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Watchers Unbinding (Performance)
header: Watchers Unbinding
description: Progetto Discitur,Tech,Angular.js,Digest Cycle,watchers,Performance
group: Discitur
tags: [Angular.js,Digest Cycle,watchers,Performance]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Angular.js Watchers Unbinding (Performance)",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-02-10",
  "articleSection" : [ "Digest Cycle", "Angular.js", "watchers", "$$watchers", "$watch", "Performance" ],
  "url" : "http://williamverdolini.github.io/2014/02/18/discitur-Watchers_unbinding/"
}
</script>

Uno degli aspetti che  mi “inquieta”
di più di Angular.js è il processo di dirty checking. Ad ogni ciclo di $digest
Angular controlla tutti i watcher registrati per verificare se le informazioni
sono cambiate rispetto al ciclo precedente e se intercetta qualche cambiamento
esegue il listener associato. Il controllo viene fatto sui dati primitivi,
quindi nel caso sia messo sotto binding un array o  un oggetto vengono controllate tuttele
proprietà dell’oggetto per verificare gli eventuali cambiamenti.

Inoltre, per tutte le espressioni bindate nel view, Angular crea un watcher
che viene “spazzolato” ad ogni ciclo per verificare se ci siano cambiamenti da
recepire.

Un buon articolo che approfondisce il tema è il seguente: <a href="http://blog.bguiz.com/post/57373805814/accessors-vs-dirty-checking-in-javascript-frameworks" target="_blank">http://blog.bguiz.com/post/57373805814/accessors-vs-dirty-checking-in-javascript-frameworks</a>

 

Su applicazioni di grandi dimensioni (o destinate a diventarlo) questo
check potrebbe creare problemi di performance. Per migliorare le performance si
può eliminare dai watchers quelli che non contengono contenuto veramente dinamico.
Nella mia architettura, un buon numero di questi watchers è quello creato per
la gestione delle labels. Tutti i miei controller contengono, nello scope, un
oggetto _labels_ che contiene tutte le
etichette visualizzate in pagina. 

Per queste etichette, una volta inizializzato il controller e fatto il
primo binding sulla View, non servirebbe più fare ulteriori controlli e
potrebbero essere staccate dal dirty-checking eliminando/annullando il watcher
associato.

 

Ho provato due metodi per realizzare questo obiettivo:

 

### Metodo custom

Ho sperimentato il metodo più per scopi didattici/architetturali che per
applicarlo nell’app, anche perché il risultato non è molto elegante. Ecco il
codice inserito in uno dei miei controller:

 


{% raw %}
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
var _watchers = false;
var _detachStaticWatchers = $scope.$watch(function () {
    // first digest cycle: do nothing to populate view
    if (!_watchers) {
        _watchers = true;
    }
    // second digest cycle: remove static watchers
    else {
        var _reLabels = /^{{labels\..*}}/
        for (var i = $scope.$$watchers.length - 1; i >= 0; i--) {
            if ($scope.$$watchers[i].exp &&
                $scope.$$watchers[i].exp.exp &&
                _reLabels.test($scope.$$watchers[i].exp.exp)) {
                $scope.$$watchers.splice(i, 1);
            }
        }
        // detach this watch
        _detachStaticWatchers();
    }
    console.log($scope.$$watchers.length);
    console.log($scope.$$watchers);
})
]]></script> 
{% endraw %}

 

gli aspetti teorici utilizzati sono:

- _un
     watcher senza listener viene eseguito ad ogni ciclo di digest_. Grazie a questa particolarità, registro un
     watcher che ha lo scopo di spegnere i watcher delle espressioni statiche
- _un
     watcher restitusce una funzione che, se invocata senza parametri, elimina
     il watcher stesso_. Con
     questo principio, alla fine dell’elaborazione il watcher stesso si elimina
     da solo

 

Come si può vedere, il risultato è triviale (faccio fare un “giro” di
digest per assicurarmi di renderizzare le label ed al successivo giro elimino i
watchers statici), ma funzionante (ecco un printscreen del mio log):


<img src="{{ BASE_PATH }}/images/discitur/watchers_unbinding.png" />

Il codice è brutto (non ci piove),
ma opportunamente rivisto e, riprendendo il tema dell’ereditarietà dei
Controller, potrebbe essere codice candidato a finire nell’inizializzazione del
Controller Base (da cui tutti ereditano).

A questo punto chi sviluppa i
controller si deve preoccupare di rispettare la convenzione utilizzata per
l’inserimento delle labels e tutto sarebbe trasparente. Un esempio di quanto
riportato è il seguente:

- Controller
     applicativo (LessonEditCtrl) è libero di logiche “low-level”
- Nel
     controller di base sono inseriti i metodi per rimuovere i watchers statici
     
- Il Controller applicativo
     eredita un controller di base (DisciturBaseCtrl)
- 

Brutto, ma invisibile e
performante.

 

 

###<a href="https://github.com/Pasvaz/bindonce" target="_blank">Bindonce</a>

Questa libreria nasce proprio a questo scopo e realizza il mio obiettivo in
maniera decisamente più elegante e standard, ovvero utilizzando delle
direttive. si appoggia all’evento jQlite $destroy e quindi si occupa di
staccare i binding marcati opportunamente.

 

Bello, ma non è esattamente quello che cerco, perché vorrei tenere quanto
più "pulita" la view di aspetti meramente tecnici.

Per me, infatti, la View è un terreno che dovrebbe rimanere quanto più
leggibile possibile e quanto meno denso di logica di UI. Questo perché, in un
contesto reale, la view è data in pasto ad uno o più web-master che aggiungono
classi o altre modifiche CSS o al wireframe per vestire il modulo in maniera
appropriata. meno codice applicativo possono vedere e (peggio ancora) toccare,
meglio è. Ancora di più se parliamo di aspetti più architetturali che
funzionali. In particolare questo aspetto lo vedo nel "dominio" del controller, più che
in quello della view; è il controller, infatti, che chiama i servizi e gestisce il dato 
ed è nel controller che si ha quindi la conoscenza del fatto che la singola espressione sia statica o dinamica.

Resta il fatto che <a href="http://slid.es/pasqualevazzana/angularjs-binding" target="_blank">Bindonce è molto elegante e rappresenta l'"Angular way" di approcciare questa problematica</a>.

Inoltre ho avuto modo di conoscere l'<a href="https://twitter.com/PasqualeVazzana" target="_blank">autore della libreria</a> e di vedere all'opera le performance di una applicazione che utilizzava Bindonce.
Risultato? Lo userò presto nel progetto. 

 

 

###Altre riflessioni:

Avevo provato anche una cosa del genere nel controller:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
$scope.$on('$viewContentLoaded', function () {
    $scope.$$watchers.splice(1,1); //uno a caso per fare una prova...
});
]]></script> 

ma non funziona perché l’evento è lanciato prima della risoluzione dello
stato e quindi prima di renderizzare i watcher…peccato… 