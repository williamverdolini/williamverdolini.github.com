---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Angular.js Routing (UI-Router)
header: Angular.js Routing (UI-Router)
description: Progetto Discitur,Tech,Angular.js,Routing,UI-Router,Pagination
group: Discitur
tags: [Angular.js,Routing]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Angular.js Routing (UI-Router)",
  "author" : {
    "@type" : "Person",
    "name" : "williamverdolini"
  },
  "datePublished" : "2014-01-28",
  "articleSection" : [ "Angular.js", "Routing" ],
  "url" : "http://williamverdolini.github.io/2014/01/28/discitur-Routing/"
}
</script>

Come promesso nel primo sprint, avrei affrontato questo argomento non
appena potevo. Il secondo sprint sembra ora essere sovrastimato per quello che
occorre realizzare ed il primo sprint è stato chiuso più velocemente del
previsto; perciò è l’opportunità giusta per approfondire alcuni aspetti più di
design. E quindi dopo il TDD, ho voluto prendermi un po’ di tempo per inserire
e provare UI-Router. La cosa è risultata molto semplice e veloce.
Reingegnerizzare l’app ed i test per togliere angular-route e mettere dentro
UI-Router è stato un passo senza grosse difficoltà. Uno di quegli step che ti
fanno aumentare la considerazione del framework Angular e della sua
estendibilità. Come immaginavo <a href="https://github.com/angular-ui/ui-router" target="_blank">UI-Router</a>
ha tutto quello che mi serviva:

- possibilità di annidare in maniera dinamica
     le view
- possibilità di risolvere dinamicamente view
     in parallelo
- possibilità di gestire il routing in maniera
     più logica
- <a href="https://github.com/angular-ui/ui-router/wiki" target="_blank">buona documentazione</a>

 

Uno dei concetti interessanti e su cui farò più avanti un refactoring è
quello delle viste abstract. Queste sono viste che non possono essere
instanziate da sole, ma che si aspettano delle view figlie che le completino.
Mi sembrano ottime per realizzare un concetto di masterpage, ovvero di una o
più pagine contenitore che hanno l’unico scopo di impaginare il sito ed
“intabellare” le reali view. Questo è un aspetto importante per me, soprattutto
nell’ottica di avere un app molto grande; infatti questo concetto permette alla
singola view di non preoccuparsi troppo delle regole di routing o di cosa c’è
intorno a lei. Se strutturate bene (intendo definite le interfacce in termini
di eventi per la comunicazione con gli altri VC) la singola coppia VC isolata
può tranquillamente essere sviluppata in autonomia da un programmatore o un
team.

Per ora ho organizzato così l’app:

<img src="{{ BASE_PATH }}/images/discitur/masterpages.png" />


separando quindi le pagine html
che costituiscono le masterpages dell’applicazione, dai moduli angular veri e
propri (che quindi hanno le singole funzionalità). L’impalcatura delle regole
di routing (o per meglio dire, la macchina degli stati) è realizzata a due
livelli.

 

**1° Livello: Masterpages (Stati astratti)**

Questo livello è definito nelle
configurazioni dell’applicazione web e definisce che tipo di layout è previsto
nella navigazione del sito. Queste configurazioni non definiscono delle vere e
proprie regole di routing, per il fatto che tutti gli stati sono definiti come
abstract e non possono quindi essere risolti dallo stateManager dell’ui-router
senza altre configurazioni per l’implementazione. Ecco la parte interessante
del codice:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            //MasterPages (Abstract States)
            .state('master', {
                url: '',
                abstract: true,
                templateUrl: 'masterpages/master.html'
            })
            // One Column Layout (Abstract States)
            .state('master.1cl', {
                url: '/project',
                abstract: true,
                parent: 'master',
                templateUrl: 'masterpages/1cl.html'
            })
            // Two Columns Layout (Abstract States)
            .state('master.2cl', {
                url: '',
                abstract: true,
                parent: 'master',
                templateUrl: 'masterpages/2cl.html'
            })
    })
]]></script> 


**2° Livello: Content-Pages (Stati “fisici”)**

Questo livello è quello che
definisce l’insieme degli stati dell’applicazione e che definisce quindi le
regole di routing. Ogni modulo ha le proprie regole di routing ed i propri stati,
che devono implementare uno degli stati abstract definito nelle master pages.

 

Ad es. per il sito “statico”, ho
definito il modulo main, la cui configurazione è:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
    .config(function ($stateProvider, $urlRouterProvider) {
        // For any unmatched url, redirect to HomePage
        $urlRouterProvider.otherwise('/project/home');

        $stateProvider
            // Web Site (Content States)
            .state('master.1cl.home', {
                url: '/home',
                parent: 'master.1cl',
                templateUrl: 'modules/main/site/HomePage.html'
            })
            .state('master.1cl.mission', {
                url: '/mission',
                parent: 'master.1cl',
                templateUrl: 'modules/main/site/Project.html'
            })

    })
]]></script> 

Come si può vedere il parent usato è (per scelta) sempre 'master.1cl' ad indicare che le pagine statiche
dell’applicazion sono sempre mono-colonna.

Mentre per il modulo Lesson, alcuni stati sono i seguenti:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('lessonSearch', {
                url: '/lesson?keyword',
                parent: 'master.2cl',
                onEnter: function () {
                    console.log("Entering Lesson Search");
                },
                views: {
                    'sidebar': {
                        templateUrl: 'modules/lesson/sidebar.html'
                    },
                    'main': {
                        templateUrl: 'modules/lesson/LessonNews.html',
                        controller: 'LessonNewsCtrl',
                        resolve: {
                            lessonNewsData: function (LessonService, $stateParams) {
                                return LessonService.search($stateParams);
                            }

                        }
                    }
                }
            })
            .state('404lesson', {
                url: '/404lesson',
                parent: 'master.2cl',
                views: {
                    'sidebar': {
                        templateUrl: 'modules/lesson/sidebar.html'
                    },
                    'main':{
                        controller: 'Lesson404Ctrl',
                        templateUrl: 'modules/lesson/Lesson404.html',
                        onEnter: function () {
                            console.log("master.2cl.404lesson");
                        }
                    }
                }
            });
]]></script> 

Con un Layout a 2 colonne (parent: 'master.2cl'). Il singolo modulo interno (ad es. il 'LessonNewsCtrl',che probabilmente assumerà un nome diverso al
prossimo refactoring) è stato sviluppato senza minimamente tenere a mente alcun
aspetto legato al wireframe dell’applicazione.

Trovo la cosa modulare e molto comoda.
