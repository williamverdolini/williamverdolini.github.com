---
title: "Angular.js Digest Cycle"
excerpt: "Il Progetto Discitur"
header:
    overlay_image: "/assets/images/neonbrand-426918.jpg"
    caption: "Photo by NeONBRAND on [**Unsplash**](https://unsplash.com/photos/zFSo6bnZJTw)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: discitur_it
description: Progetto Discitur,Tech,Angular.js,Digest Cycle,watchers
group: Discitur
tags: [Angular.js,Digest Cycle,watchers]
---

<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Angular.js Digest Cycle",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-02-10",
  "articleSection" : [ "Digest Cycle", "Angular.js", "watchers", "$$watchers", "$watch" ],
  "url" : "https://williamverdolini.github.io/2014/02/10/discitur-Digest/"
}
</script>

Altro aspetto sempre legato all’autenticazione: come intercettare che
l’utente si logghi e come reagire a questo evento.

Aggiungo qualche aspetto in più: la login, nell’applicazione Discitur,
nasce per stare in una finestra modale, che può essere richiamata da più parti
dell’applicazione. Ad es., già in questo sprint (che è il primo ad usare il
concetto di autenticazione) la login si richiama da almeno tre punti
differenti:

1. Dalla barra di navigazione principale tramite
     il link “Accedi”
2. Dalle form di Commento inserite alla fine di
     ogni lezione (le lezioni sono visibili a tutti, ma commentare è una
     funzionalità che prevede autenticazione)
3. dalla sezione “Valutazioni” per inserire la propria
     valutazione

Nel corso dei prossimi sprint ci saranno sicuramente altri punti che prevedranno
un accesso autenticato. Quindi quello che vorrei evitare è di “inquinare” i
vari controlli (che hanno bisogno dell’autenticazione) con codice per l’apertura
della finestra modale, che renderebbero i controller highly-coupled tra loro.

Per far questo, mi appoggio alla gestione degli eventi Angular, in
particolare <a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/lesson/LessonCommentDrv.js#L60" target="_blank">lanciando dal $rootScope un broadcast dell’evento di login</a>. Una velocissima
riflessione: uso il <a href="http://docs.angularjs.org/api/ng/service/$rootScope" target="_blank">$rootScope</a> per essere sicuro che l’evento raggiunga il
controller principale da cui la finestra modale di login si genera. Se utilizzassi
il semplice $scope del controller di partenza, ed il controller non fosse uno
scope padre di quello che voglio raggiungere, rischierei di lanciare nel vuoto
l’evento

Quindi, se da un mio generico controller ho bisogno della login utente,
predispongo un metodo che mi lancia il mio evento:

```js
scope.actions = {
   // call Sign Modal Dialog to login
   openSignIn: function () {
      $rootScope.$broadcast('disc.login', scope.actions)
   },
   ...
}
```

A questo punto, da qualche parte, l’evento sarà gestito e la finestra di
Login aperta. In questo articolo, più che su aspetti di UI o di interazione con
il back-end, mi volevo concentrare sulla gestione del dato di autenticazione e
su come questo sia propagato ai vari controller che lo controllano. Procedendo
per punti, questi sono i passaggi seguiti:

1. la login viene invocata e procede ad eseguire
     le autenticazione server-side
2. se la <a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L69" target="_blank">login</a>
     da esito positivo, viene valorizzata una proprietà “<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L66" target="_blank">user</a>”
     del servizio di autenticazione con un oggetto contenente tutte le
     informazioni sull’utente
3. Questo oggetto, essendo all’interno di un
     servizio (che per sua natura è un singleton) è unica ed i suoi
     aggiornamenti sono visibili ovunque si faccia injection del servizio
4. all’interno dei controller che hanno bisogno
     di conoscere lo stato di autenticazione dell’utente, si realizza un <a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/lesson/LessonCommentDrv.js#L134" target="_blank">watcher</a>
     delle proprietà di user interessate, in particolare user.isLogged

Personalmente trovo questo approccio funzionale, ma non proprio elegante,
in particolare avrei preferito non scrivere un watcher dello stesso tipo in
ogni controller; viceversa avrei voluto iniettare il mio servizio di
autenticazione e controllare le proprietà dell’oggetto user, per capire se
l’autenticazione è avvenuta o meno.

Facendo un confronto tra quello che ho fatto e quello che
mi sarebbe piaciuto fare:

<h4>Quello che ho fatto</h4>

<b><i>Controller</i></b>:

```js
scope.local = {
  isLogged: AuthService.user.isLogged,
  sameUser: (scope.comment.author.username == AuthService.user.username)
}
...

scope.$watch(function () {
  return AuthService.user.isLogged;
},
function () {
  scope.local.isLogged = AuthService.user.isLogged;
  scope.local.sameUser = (scope.comment.author.username == AuthService.user.username);
                        }
                    );
```

<b><i>Template</i></b>:

```html
<div class="col-xs-12" ng-show="!local.isLogged || !local.sameUser">
<h5><small>
<a ng-click="actions.openUserComment()">{{labels.commentAnswer}}</a>
</small>
</h5>
</div>
```

   
<h4>Quello che avrei voluto fare</h4>


<b><i>Template</i></b>:

```html
<div class="col-xs-12" 
     ng-show="! AuthService.user.isLogged || ! AuthService.user.username==comment.author.username ">
  <h5>
    <small><a ng-click="actions.openUserComment()">{{labels.commentAnswer}}</a></small>
  </h5>
</div>
```

Quello che ho fatto è conseguenza del ciclo di digest e delle logiche che
utilizza Angular per il controllo dei cambiamenti. Angular esegue un “dirty
checking” ad ogni ciclo di digest (agganciato al ciclo degli eventi del
browser). Il ciclo d checking spazzola tutti gli scope alla ricerca di
modifiche ai valori, Il problema è che i servizi non sono spazzolati in
autonomia da angular e quindi sono richiesti i watcher che altro non sono che
funzioni che il ciclo di digest periodico di angular richiama per aggiornare i
vari scope. Il giro mi è chiaro e alla fine è ok, ma mi sarebbe piaciuto se il
ciclo di digest avesse spazzolato anche i servizi iniettati dai vari scope.
 

**_Revisione_**

Facendo ulteriori approfondimenti e, soprattutto, avendo approfondito <a href="http://stackoverflow.com/a/16465890/3316654" target="_blank">questo post</a> ho capito
meglio come lavora il ciclo di digest di Angular. Il check che Angular fa è
relativo ai soli tipi primitivi, e, nel caso di <a href="http://docs.angularjs.org/api/ng.$rootScope.Scope#methods_$watch" target="_blank">watcher</a>
accesi su oggetti non primitivi, Angular fa un dirty checking di tutte le
proprietà primitive dell’oggetto, secondo quanto riportato dal metodo di
confronto utilizzato: <a href="http://docs.angularjs.org/api/angular.equals" target="_blank">angular.equal</a>.

<b><i>Controller</i></b>:

```js
scope.local = {
  user: AuthService.user
}
```


<b><i>Template</i></b>:

```html
<div class="col-xs-12" 
     ng-show="!scope.local.user.isLogged || ! AuthService.user.username==comment.author.username ">
  <h5>
    <small><a ng-click="actions.openUserComment()">{{labels.commentAnswer}}</a></small>
  </h5>
</div>
```

Con il codice precedente, Angular definisce un $watch sull’oggetto “scope.local.user.isLogged” per farlo individua la poprietà dello scope “scope.local.user” che, per riferimento è settata con l’oggetto user del servizio. Quindi
con il seguente codice:


<b><i>Controller</i></b>:

```js
scope.local = {
  user: AuthService.user
}
```

<b><i>Template</i></b>:

```html
ng-show="!scope.local.user.isLogged">
```

Angular, imposta un watcher del seguente tipo:

```js
scope.$watch(
    function () { return scope.local.user.isLogged }, // where scope.local.user === AuthService.user
    function () {
        // do binding…
    }
);
```

In questa maniera si è riuscito a mettere in binding le proprietà di un
servizio, senza dover ricorrere ad un watcher esplicito nel controller.

_prima riflessione_:

Il codice che volevo scrivere inizialmente era sbagliato per il semplice
fatto che i watcher non si attaccano direttamente ai servizi (magari un giorno
lo faranno), ma guardano all’interno del loro scope.

_seconda riflessione_:

una lettura che ha confermato tutti i miei approfondimenti è stata questa: <a href="http://stsc3000.github.io/blog/2013/10/26/a-tale-of-frankenstein-and-binding-to-service-values-in-angular-dot-js/" target="_blank">http://stsc3000.github.io/blog/2013/10/26/a-tale-of-frankenstein-and-binding-to-service-values-in-angular-dot-js/</a>

Se solo l’avessi trovata prima…

In ogni caso, è sicuro che d’ora in avanti scriverò codice più consapevole!

_terza riflessione_:

questo dei watcher apre un argomento, quello delle performance, abbastanza
importante. In applicazioni complesse è facile arrivare a migliaia e migliaia
di questi watcher che girano ad ogni ciclo di digest…

Non lo faccio ora, ma una cosa intelligente da fare è quella di staccare i
watcher quando non ce n’è più bisogno. Delle letture velocissime (ma interessanti)
che ho fatto a riguardo:

<a href="http://angular-tips.com/blog/2013/08/removing-the-unneeded-watches/" target="_blank">http://angular-tips.com/blog/2013/08/removing-the-unneeded-watches/</a>

<a href="http://www.bennadel.com/blog/2480-Unbinding-watch-Listeners-In-AngularJS.htm" target="_blank">http://www.bennadel.com/blog/2480-Unbinding-watch-Listeners-In-AngularJS.htm</a>.

 

 


  