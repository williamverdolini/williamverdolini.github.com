---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Test, FE/BE separation…Static/Dynamic Content
header: Test, FE/BE separation…Static/Dynamic Content
description: Progetto Discitur, Tech, Angular.js
group: Discitur
tags: [Angular.js,Software Design]
---
{% include JB/setup %}

Nel titolo c’è tutto (ma veramente tutto!!), però di fatto è il percorso
mentale che ho fatto per arrivare alle conclusioni mostrate in questo
paragrafo. Le conclusioni, dal punto di vista tecnico, non sono niente di
speciale, ma trovo interessante il processo seguito perché penso sia del tutto
comune e, quindi, un buon esempio di come aspetti tecnici, architetturali, di
processo siano strettamente collegati tra loro.

 

Tutto parte dalla mia volontà di fare un reale TDD per lo sprint 2. Quindi
mi sono forzato a voler partire dalla realizzazione dei casi di test per la
realizzazione del servizio di ricerca e per far questo, forte dell’esperienza
fatta nel primo sprint, la mia intenzione è stata quella di utilizzare il team
Grunt-Karma, che ho trovato efficace in termini di configurazione ambiente,
velocità di esecuzione e debugging.

 

A questo punto mi sono trovato di fronte ad un banalissimo problema di
configurazione degli ambienti locali. i servizi REST ed il BE in generale sono
sviluppati su tecnologia Microsoft (WebApi 2.0, Entity Framework 6, SQL
Server), e per lo sviluppo ed il debug dei servizi lancio un IIS Express
(integrato con Visual Studio). Grunt+Karma sono configurati per girare su server
Connect (HTTP server per nodejs.org). Era mia intenzione realizzare quindi i
casi di test (per il FE) e sulla base di questi sviluppare quanto necessario
(eventualmente anche per il BE, in termini di E2E test). Sicuramente avrei
potuto prevedere di realizzare i mock necessari, ma come primo esperimento TDD
volevo una soluzione “full stack” che mi permettesse di toccare con mano la
potenza dell’approccio. Quindi ho deciso di lavorare con entrambi i server
attivi:

- IIS Express per il debug/sviluppo delle wep
     API
- Connect per il test e lo sviluppo dei servizi
     e controller Angular

 

Nel far questo ho fatto una considerazione:

- su Connect girerà solo contenuto statico (js,
     html, css…). Fondamentalmente tutto il mondo Angular
- si IIS Express gira il contenuto “dinamico”
     o, meglio, la parte server

 

A questo punto mi è venuto in mente il concetto (tra design e performance
tuning) di servire il contenuto statico da un web server diverso da quello
usato per generare contenuto dinamico. Una buona lettura al riguardo: [http://www.webforefront.com/performance/webservers_statictier.html](http://www.webforefront.com/performance/webservers_statictier.html)

 

Nel mio caso il concetto di dinamico è usato in termini un po’ impropri,
però il concetto è che se voglio usare tecnologia Microsoft che gira su IIS,
non sono necessariamente vincolato ad usare IIS per servire anche il contenuto
statico fornito dalla web app Angular. Per far questo ho utilizzato costanti
dell’applicazione Angular per memorizzare apiURL da utilizzare su tutte le
chiamate tramite $http e $resource. Questo il codice (ripulito delle parti non
necessarie):


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

angular.module("Discitur", [])
    .constant('DisciturSettings', {
        apiUrl: 'http://localhost:59739/api/'
    });

]]></script> 

e sul singolo servizio:

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

$http.get(DisciturSettings.apiUrl + 'lesson/' + inputParams.id)

]]></script> 

Veramente due mosse, ma penso che il risultato sia molto flessibile. Cosa configurare sull’ambiente di produzione è a questo punto una scelta che può essere fatta valutando non l’aspetto software, ma solo quello sistemistico o di Configuration Management.
Ah, dimenticavo…per il mio scopo (test su Grunt Connect e BE su IIS), funziona alla grande!

