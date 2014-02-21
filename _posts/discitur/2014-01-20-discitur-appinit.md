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
 

