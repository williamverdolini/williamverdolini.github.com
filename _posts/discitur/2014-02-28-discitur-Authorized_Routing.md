---
title: "Authorized Routing"
excerpt: "Il Progetto Discitur"
header:
    overlay_image: "/assets/images/neonbrand-426918.jpg"
    caption: "Photo by NeONBRAND on [**Unsplash**](https://unsplash.com/photos/zFSo6bnZJTw)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: discitur_it
description: Progetto Discitur,Tech,Angular.js,Authentication,Routing
group: Discitur
tags: [Angular.js,Authentication,Routing]
---

<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Authentication,Routing",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-02-28",
  "articleSection" : [ "Angular.js", "Authentication", "Routing" ],
  "url" : "https://williamverdolini.github.io/2014/02/28/discitur-Authorized_Routing"
}
</script>

Nello sprint in esame ho dovuto gestire il controllo di accessi a pagine
che richiedono l’autenticazione dell’utente. I possibili scenari che ho
valutato sono due:

1. In caso di accesso non autenticato a pagine
     con autorizzazione si reinderizza verso una pagina di login
2. In caso di accesso non autenticato a pagine
     con autorizzazione si reindereizza verso una route custom
     
## Redirect verso Login Page

Il primo caso rappresenta uno scenario semplice, ma abbastanza comune e
quindi ho fatto delle prove di implementazione. Il risultato è abbastanza
pulito e consiste di pochi passi:

1. Si imposta una **proprietà custom** sullo stato che richiede autenticazione
2. Si verifica che l’utente sia autenticato ed
     in caso contrario si esegue un **redirect**
     allo stato di default

di seguito il codice:

### Proprietà custom

```js
$stateProvider
    .state('userProfile', {
        url: 'userProfile',
        parent: 'master.1cl',
        authorized: true,
        templateUrl: 'modules/user/UserProfile.html',
        controller: 'UserProfileCtrl',
        resolve: {
            user: function (AuthService) { return AuthService.user; }
        }
    })
```

### Redirect

```js
$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    // Default behaviour for authorized states: redirect to login page (in this app to the lesson list page)
    if (toState.authorized && !AuthService.user.isLogged) {
        event.preventDefault();
        $state.go('lessonSearch');
    }
});
```
 

## Redirect con logiche Custom

Questa casistica è stata quella richiesta in questo sprint nella gestione
della modifica dei dati di una lezione. Il requisito era che solo l’utente
autore della lezione avesse i privilegi di modificare la lezione. A fronte di
questo requisito, avevo bisogno di realizzare un redirect verso un altro stato
nel caso in cui l’utente era loggato, ma non coincideva con l’autore della
lezione.

Fondamentalmente questa logica permette di mettersi al riparo da
comportamenti di “sabotaggio” per cui, conoscendo l’URL delle funzionalità di
editing di una lezione, un utente possa modificare le lezioni di altri.

 

Per realizzare questa logica custom (differente dal comportamento di
default presentato prima), ho sfruttato l’evento **onEnter** dello $state. Ecco come:


```js
.state('lessonEdit', {
    url: 'edit/lesson/:lessonId',
    parent: 'master.1cl',
    onEnter: function (AuthService, lessonData, $location) {
        // the controller can be accessed only if authenticated
        if (!AuthService.user.isLogged ||
            (lessonData.lessonId != null && lessonData.author.userid != AuthService.user.userid))
            // use location due to $state.go land on blank page...
            $location.path('lesson');
    },
    templateUrl: 'modules/lesson/LessonEdit.html',
    controller: 'LessonEditCtrl',
    resolve:{ 
       lessonData: function (...) {...}
      }
  }
```


Nell’evento onEnter è possibile accedere agli oggetti di resolve dello
stato e quindi implementare logiche come quella descritta.

 

## Gestione avanzata del routing autenticato

Le due soluzioni descritte sopra funzionano, ma non sono complete perché
non tengono conto del caso in cui qualcuno digiti l’url direttamente (o perché
magari ha salvato l’indirizzo tra i propri preferiti). Questo, in una SPA, è
equivalente ad un riavvio dell’applicazione e può avere dei side-effect se le
inizializzazioni dell’applicazione non sono pensate per gestire questa
casistica.

Ad es., nel caso sopra descritto, l’oggetto AuthService.user (se non
opportunamente inizializzato) risulterà sempre NON loggato, con lo spiacevole
effetto di essere reinderizzati anche quando non sarebbe necessario.

Per far fronte a questa casistica ho riscritto il codice nella seguente
maniera:

```js
// dynamic callback for change start event
var changeStartCallbacks = [
  // 1. Initialize Authentication Data e delete itself
  function (event) {
    event.preventDefault();
    AuthService.resolveAuth()['finally'](function () {
      // http://angular-ui.github.io/ui-router/site/#/api/ui.router.router.$urlRouter
      // Continue with the update and state transition if logic allows
      $urlRouter.sync();
    });
    changeStartCallbacks.splice(0, 1);

  },
  // 2. Manage authorized states
  function (event, toState, toParams, fromState, fromParams) {
    if (toState.authorized && !AuthService.user.isLogged) {
      // event preventDefault to stop the flow and redirect
      event.preventDefault();
      $state.go('lessonSearch');
    }
  }
]

//------- Global Event Management -------//
$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
  //console.log("$stateChangeStart")
  changeStartCallbacks[0](event, toState, toParams, fromState, fromParams);
});
```

Ovvero, scorrendolo punto per punto:

1. viene definito un array di “callback
     intelligente”. Questo l’ho fatto per lasciare il codice della gestione
     dell’evento di $rootScope quanto più leggero possibile
2. la logica di gestione è quindi contenuto
     tutta in questo array, che ha 2 functions:
    - la prima ha lo scopo di bloccare la
      transizione di stato e garantire l’inizializzazione dell’oggetto AuthService.user,
      dopo di che, riavvia il flusso della transizione di stato e si auto
      elimina dall’array di callback. Per garantire che la transizione di stato
      riparta solo dopo che l’inizializzazione fosse completata ho sfruttato le
      caratteristiche degli oggetti [promise](http://docs.angularjs.org/api/ng/service/$q) ed in
      particolare l’evento _finally_
      che viene richiamato a prescindere dall’esito della promise.
    - la seconda è la callback effettivamente
      richiamata da questo momento in poi ed è quella descritta precedentemente  