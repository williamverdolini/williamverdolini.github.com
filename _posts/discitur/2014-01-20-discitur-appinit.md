---
title: "App Initialization, Global Variables"
excerpt: "Il Progetto Discitur"
header:
    overlay_image: "/assets/images/neonbrand-426918.jpg"
    caption: "Photo by NeONBRAND on [**Unsplash**](https://unsplash.com/photos/zFSo6bnZJTw)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: discitur_it
description: Progetto Discitur, Tech
group: Discitur
tags: [Angular.js,Constants,Services,Software Design]
---

Prima di passare ad Angular, ero abituato a lavorare su tipici progetti
web, nei quali l’applicazione aveva il suo core server-side, con la generazione
server del codice html e client. Uno degli step che inserivo in quasi tutte le
applicazioni erano step di inizializzazione dell’intera applicazione. Robe che
si inserivano in Global_asax per intenderci (per chi arriva dal .Net).

Una cosa tipica era l’inserimento in oggetti inseriti in memoria di
applicazione che contenevano il valore di tutte le label visualizzate. Per chi
ha a che fare con un prodotto per il web è una cosa abbastanza comune e
consente a Clienti diversi di poter inserire il proprio testo specifico per
ogni label visualizzata; con lo stesso meccanismo si poteva gestire anche
l’internazionalizzazione delle label. 


## From Server to Client

Passare ad Angular significava passare dal server al client e questo
approccio (molto utile) doveva essere rivisto. Rivisto, consapevole del fatto
che NON poteva essere riottenuto lo stesso identico risultato, per il fatto che
nelle applicazioni web tradizionali le variabili in Application Memory erano
inserite una sola volta ed erano accessibili a tutte le sessioni http che
l’applicazione riceveva; mentre in SPA con framework di templating js come
Angular l’applicazione risiede tutta sul client ed il backend è in genere
state-less e quindi quelle che saranno oggetti di applicazione, sono oggetti
ricreati su ogni client.


## Angular Constants
In Angular un buon candidato per gestire queste costanti di applicazioni è
un servizio, in particolare nella forma **value** che semplifica l’implementazione di oggetti literal instanziati una sola volta
in tutta l’applicazione. Il mio servizio sarà quindi come segue:


```csharp
angular.module('Common')
.value('dictionary',
    {
        specifics : "Caratteristiche",
        discipline: "Disciplina",
        school: "Scuola",
        classroom: "Classe",
        rating: "Valutazione",
        author: "Pubblicato da",
        ...
    }
)
```


Questo servizio dovrà essere utilizzato da ogni controller per popolare le
label visualizzate. Quindi, sfruttando la Dependency Injection di Angular, un
controller potrebbe avere questa struttura:

 
```csharp
angular.module('Lesson')
    .controller('LessonCtrl', [
        '$scope',
        'dictionary',
        function (
            $scope,
            dictionary,
            ) {
            //-------- public properties-------
            $scope.labels = {
                specifics: dictionary.specifics,
                discipline: dictionary.discipline,
                school: dictionary.school,
                classroom: dictionary.classroom,
                author: dictionary.author
            };
```

Ammetto che questa soluzione non mi piace al 100% perché richiede di
inserire una step di deploy “esterno” (per leggere da DB le labels e creare il
file js di dictionary da includere) e questo può non essere sempre comodo in
situazioni di emergenza (non capita mai di dover patchare e rilasciare un
applicazione velocissimamamente? no vero..?...).
 

Però, così come è, questa soluzione ha il limite di non poter gestire
l’override di una label su un controller specifico. Cioè: se definisco che la
label school equivale a “Scuola”, in tutta l’applicazione il suo valore rimarrà sempre
lo stesso. Ma se in un controller specifico volessi visualizzare “La mia
Scuola”, cosa dovrei fare? duplicare le label per ogni controller non mi sembra
un buona idea. Meglio quella di predisporre un file di costanti globali con le
sole etichette personalizzate per lo specifico controller:

 
```csharp
angular.module('Common')
.value('overrides',
    {
        'LessonCtrl': {
            school: "La  mia Scuola"
        }
    }
)
```

Anche questo file potrebbe essere generato automaticamente a partire da
dati salvati a DB.

Questa scelta costringe ad un rework del controller, che a questo punto non
può più accedere direttamente al dictionary, ma deve passare attravero un
servizio che data l’etichetta verifica l’esistenza di un eventuale override del
controller. 

 
```
angular.module('Common')
        .factory('LabelService', function (dictionary,  overrides) {
            return {
                get: function (controller, label) {
            // if exists the overriden label within the Controller is returned 
            // otherwise the dictionary's label is returned

                 return 
          (overrides[controller] && overrides[controller][label]) ?
          overrides[controller][label] :
          dictionary[label] || 'Label (' + label + ') not set!';
                }
            };
        });
```

Ed il controller diventa:

 
```
angular.module('Lesson')
    .controller('LessonCtrl', [
        '$scope',
        'LabelService'
        function (
            $scope,
            LabelService,
            ) {
            //-------- public properties-------
            $scope.labels = {
                specifics: LabelService.get('LessonCtrl','specifics'),
                discipline: LabelService.get('LessonCtrl','discipline'),
                school: LabelService.get('LessonCtrl','school'),
                ...
            };
```

Ok.


E’ più forte di me notare che nel codice inserito c’è tanta ripetizione. Mi
aspetto infatti di avere decine di labels per controller e quindi di riscrivere
la stessa riga di codice per decine di volte. In più, in ogni riga di codice c
sono dei literals, che tendo ad evitare, perché 9 volte su 10 sono gestite con
copia/incolla e fare bug-fixing può essere una cosa snervante.

La prima soluzione è semplice:

 
```csharp
angular.module('Lesson')
    .controller('LessonCtrl', [
        '$scope',
        'LabelService'
        function (
            $scope,
            LabelService,
            ) {
            var getLabel = function (label) {
                return LabelService.get('LessonCtrl', label);
            }

            //-------- public properties-------
            $scope.labels = {
                specifics: getLabel('specifics'),
                discipline: getLabel('discipline'),
                school: getLabel('school'),
                ...
            };
```

 
**Meglio!**


## _Controller Inheritance?_

Rifletto su questo aspetto per il fatto che, sulla base del codice appena
scritto, tutti i controller della mia applicazione avranno questi componenti e
riscrivere, controller dopo controller, le stesse funzioni la trovo una pratica
da evitare (se possibile) perché _error-prone_ (come ogni copia/incolla) e per il fatto che è più difficile da manutenere (se
dovessi modificare la funzione private getLabel, dovrei ripassarmi tutti i
controller dell’applicazione). 

Questa sarebbe l’occasione giusta di gestire classi base dalle quali ogni
controller dovrebbe derivare.

Per far questo la soluzione che alla fine trovo più pulita è questa: <a href="http://blog.omkarpatil.com/2013/02/controller-inheritance-in-angularjs.html" target="_blank">http://blog.omkarpatil.com/2013/02/controller-inheritance-in-angularjs.html</a>
che si basa sulla creazione di una classe che realizza il controller “padre”
che può essere ereditato dai singoli controller:
 
```csharp
angular.module("Discitur")
    .factory('DisciturBaseCtrl', function () {
        function DisciturBaseCtrl($scope, LabelService) {
            //-------- public methods-------
            $scope.getLabel = function (label) {
                return LabelService.get($scope.ctrl, label);
            };
        }
        return (DisciturBaseCtrl);
    });
```
 
 
riflessioni:

1. Utilizzo un servizio con lo scopo di dare una
     sorta di "namespace" al Controller, senza inquinare con variabili
     globali.
2. la parte chiave dell’implementazione è
     quella relativa all’istruzione di return, che restituisce il Costruttore e
     consente quindi al chiamante di instanziare la classe. Ecco perché NON sto
     utilizzando un controller vero e proprio, ma un servizio.

A questo punto il mio controller potrebbe essere reingegnerizzato come di
seguito:

```csharp
angular.module('Lesson')
    .controller('LessonCtrl', [
        '$scope',
        'DisciturBaseCtrl',
        '$injector',
        function ($scope, DisciturBaseCtrl, $injector) {
            $scope.ctrl = 'LessonCtrl';
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });
            //-------- public properties-------
            $scope.labels = {
                specifics: $scope.getLabel('specifics'),
                discipline: $scope.getLabel('discipline'),
                school: $scope.getLabel('school'),
                classroom: $scope.getLabel('classroom')
            };
```


Da un punto di vista del codice scritto, in questo specifico caso, non c’è
molto beneficio (alla fine più o meno lo stesso numero di righe di codice), ma
qualora le funzionalità base dei controller aumentino il beneficio si vedrebbe
più sensibilmente. L’aspetto sicuramente migliorativo sta nel design del
software, che consente di isolare nel controller base le funzionalità comuni,
percui la manutenzione/evoluzione ne risulta semplificata.

Al momento NON applicherò questo design, perché non sono sicuro sia il modo
corretto di interpretare il framework Angular e perché mi sembra una forzatura
la gestione del controller padre tramite istanze da servizio. So che funziona,
ma per ora utilizzerò l’injection dei servizi che mi sembra il modo più “standard”
di affrontare la questione.


Qualche opinione a riguardo?