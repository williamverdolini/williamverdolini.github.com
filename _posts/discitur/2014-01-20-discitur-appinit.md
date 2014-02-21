---
layout: wvpost
title: "Il Progetto Discitur"
tagline: App Initialization, Global Variables
header: App Initialization
description: Progetto Discitur, Tech
group: Discitur
tags: [Angular.js,Constants,Services,Software Design]
---
{% include JB/setup %}

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
###From Server to Client

Passare ad Angular significava passare dal server al client e questo
approccio (molto utile) doveva essere rivisto. Rivisto, consapevole del fatto
che NON poteva essere riottenuto lo stesso identico risultato, per il fatto che
nelle applicazioni web tradizionali le variabili in Application Memory erano
inserite una sola volta ed erano accessibili a tutte le sessioni http che
l’applicazione riceveva; mentre in SPA con framework di templating js come
Angular l’applicazione risiede tutta sul client ed il backend è in genere
state-less e quindi quelle che saranno oggetti di applicazione, sono oggetti
ricreati su ogni client.
###Angular Constants
In Angular un buon candidato per gestire queste costanti di applicazioni è
un servizio, in particolare nella forma **value** che semplifica l’implementazione di oggetti literal instanziati una sola volta
in tutta l’applicazione. Il mio servizio sarà quindi come segue:



 
  

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
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
]]></script> 


Questo servizio dovrà essere utilizzato da ogni controller per popolare le
label visualizzate. Quindi, sfruttando la Dependency Injection di Angular, un
controller potrebbe avere questa struttura:

 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
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
]]></script> 

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

 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
angular.module('Common')
.value('overrides',
    {
        'LessonCtrl': {
            school: "La  mia Scuola"
        }
    }
)
]]></script> 

Anche questo file potrebbe essere generato automaticamente a partire da
dati salvati a DB.

Questa scelta costringe ad un rework del controller, che a questo punto non
può più accedere direttamente al dictionary, ma deve passare attravero un
servizio che data l’etichetta verifica l’esistenza di un eventuale override del
controller. 

 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
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
]]></script> 

Ed il controller diventa:

 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
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
]]></script> 

Ok.


E’ più forte di me notare che nel codice inserito c’è tanta ripetizione. Mi
aspetto infatti di avere decine di labels per controller e quindi di riscrivere
la stessa riga di codice per decine di volte. In più, in ogni riga di codice c
sono dei literals, che tendo ad evitare, perché 9 volte su 10 sono gestite con
copia/incolla e fare bug-fixing può essere una cosa snervante.

La prima soluzione è semplice:

 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
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
]]></script> 

 
**Meglio!**


###_Controller Inheritance?_

Rifletto su questo aspetto per il fatto che, sulla base del codice appena
scritto, tutti i controller della mia applicazione avranno questi componenti e
riscrivere, controller dopo controller, le stesse funzioni la trovo una pratica
da evitare (se possibile) perché _error-prone_ (come ogni copia/incolla) e per il fatto che è più difficile da manutenere (se
dovessi modificare la funzione private getLabel, dovrei ripassarmi tutti i
controller dell’applicazione). 

Questa sarebbe l’occasione giusta di gestire classi base dalle quali ogni
controller dovrebbe derivare.

Per far questo la soluzione che alla fine trovo più pulita è questa: [http://blog.omkarpatil.com/2013/02/controller-inheritance-in-angularjs.html](http://blog.omkarpatil.com/2013/02/controller-inheritance-in-angularjs.html)
che si basa sulla creazione di una classe che realizza il controller “padre”
che può essere ereditato dai singoli controller:
 
<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
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
]]></script> 
 
 
riflessioni:

1. Utilizzo un servizio con lo scopo di dare una
     sorta di "namespace" al Controller, senza inquinare con variabili
     globali.
2. la parte "chiave" dell’implementazione è
     quella relativa all’istruzione di return, che restituisce il Costruttore e
     consente quindi al chiamante di instanziare la classe. Ecco perché NON sto
     utilizzando un controller vero e proprio, ma un servizio, perché ho
     bisogno

A questo punto il mio controller potrebbe essere reingegnerizzato come di
seguito:

