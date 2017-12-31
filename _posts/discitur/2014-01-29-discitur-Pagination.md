---
title: "Routing, Pagination"
excerpt: "Il Progetto Discitur"
header:
    overlay_image: "/assets/images/neonbrand-426918.jpg"
    caption: "Photo by NeONBRAND on [**Unsplash**](https://unsplash.com/photos/zFSo6bnZJTw)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: discitur_it
description: Progetto Discitur,Tech,Angular.js,Pagination,UI-Router
group: Discitur
tags: [Angular.js,Routing]
---

Un altro aspetto legato alla gestione degli stati e del routing che ho
dovuto gestire è quella legata alla gestione di ricerche paginate. Lo scenario
è abbastanza semplice e comune:

- form di ricerca che lancia una ricerca
     server-side
- viene presentata una lista di risultati
     paginata
- si scorrono alcune pagine (con ricerche
     server-side)
- si entra nel dettaglio di uno dei risultati
- si torna indietro (back)...(boom!)

 

Il comportamento che mi aspetto da utente è quello di tornare alla pagina
da cui sono partito. Fare questo non è stato immediato per il fatto che non
avevo ben compreso il legame tra lo stato “Ui-Router” e l’URL. Fondamentalmente
è un legame 1:1. Uno stato implica un URL diverso. Solo definendo una sequenza
di stati è possibile sfruttare il back del browser per fare quanto descritto.

 

Quindi, cercando di ricostruire i passi logici che ho seguito:

- 1) si parte dal servizio: cosa si aspetta in
     input? Nel mio caso ipotizzando di avere una ricerca in querystring per
     keyword, un tipico oggetto di input può essere di questo tipo:

  

```js
{ 
 keyword: "example",
 startRow: 0,
 pageSize: 3,
 orderBy: "PublishDate",
 orderDir: "DESC"
}
```


- 2) Ogni ricerca differente deve ricaricare una
     lista di risultati che deve rimanere nella history di navigazione
- 3) quindi ogni variabile deve essere
     intercettata dall’URL-stato. Per far questo sono tornato sulla
     configurazione delle route-stati inserendo nell’URL dello stato tutte le
     variabili in gioco



```js
.state('lessonSearch', {
    url: '/lesson?keyword?startRow?pageSize?orderBy?orderDir',
    parent: 'master.2cl',
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
```



- 4) A questo punto, ovunque possa essere lanciata
     una ricerca (cioè dalla form di ricerca e dalla paginazione) si procede
     alla transizione di stato, alla quale vanno passati i parametri necessari
     alla ricerca. Per assicurarsi che il cambio di stato venga registrato è
     preferibile inserire l’opzione di reload 
     (altrimenti potrebbe capitare che la navigazione avanti/indietro
     dei pulsanti di navigazione ripropongano le stesse variabili e quindi gli
     stessi stati già navigati, impedendo di tracciare ogni reale cambio di stato)



```js
// Invoke search service for paging through state transition to preserve paging history
// the state transition is forced cause the same params could be used in previous navigations
$scope.getPage = function (pager) {
    $state.go('lessonSearch', LessonService.getPage(pager), { reload: true })               
}
```

Questo è il “core” della gestione degli stati. Ovviamente c’è dell’altro
legato strettamente al servizio di ricerca, come il preservare sul singleton
del servizio i dati della ultima ricerca/pagina visitata. Per questo rimando al
repository su github.

Un aspetto che esteticamente non mi piace è il vedere in query string tutti
quei parametri di ricerca. E’ inestetico secondo me, ma non ho approfondito se
si riesca a mantenere questa gestione degli stati, lasciando come URL
visualizzato qualcosa di più elegante. Qualcuno c’ha provato?