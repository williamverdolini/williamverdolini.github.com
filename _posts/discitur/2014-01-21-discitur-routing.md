---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Routing (Deep-Linking)
header: Routing (Deep-Linking)
description: Progetto Discitur, Tech, Angular.js, routing
group: Discitur
tags: [Angular.js,routing]
---
{% include JB/setup %}

Questo è un argomento spinoso in Angular. Onestamente da una “macchina da
guerra” come Angular mi aspettavo qualcosa di meglio per questo
aspetto….comunque…spiego le mie perplessità.

Il problema che mi sono trovato ad affrontare appena dopo la realizzazione
delle prime UI in Angular è stato il tema della gestione e del rendering parallelo
delle viste. In un app che ha l’ambizione di crescere e divenire un panel o una
sorta di portale multi-funzione è necessario riuscire ad ottenere diversi
obiettivi:

1. mantenere i VC (cioè la coppia
     view-controller) quanto più isolati ed indipendenti possibile: che
     significa? Significa che quando sviluppo un controllo dovrei preoccuparmi
     delle logiche UI e dei servizi propri del VC e non pensare affatto ai VC
     che ci sono intorno. questo consentirebbe la parallelizzazione degli
     sviluppi senza troppe difficoltà. 
2. per fare quanto al punto precedente, occorre
     avere un meccanismo per:
    1. definire le “master-pages”, ovvero view
      contenitori di VC che hanno il solo scopo di definire il layout della
      pagina (colonne, sezioni, ecc.). Il contenuto (i vari VC caricati)
      dovrebbe rimanere dinamico e non cablato nella master-page
    2. permettere la comunicazione tra VC differenti
      “montati” all’interno della stessa master-pages.

 

Di base Angular consente di avere una sola ng-view nella pagina, il cui
popolamento è regolato dalle regole di routing definite a livello di
configurazione del modulo.

Esistono diversi progetti che stanno cercando di indirizzare in maniera
ottimale questa lacuna:

- [https://github.com/dotJEM/angular-routing](https://github.com/dotJEM/angular-routing)
- [https://github.com/angular-ui/ui-router](https://github.com/angular-ui/ui-router)
- [http://www.bennadel.com/blog/2441-Nested-Views-Routing-And-Deep-Linking-With-AngularJS.htm](http://www.bennadel.com/blog/2441-Nested-Views-Routing-And-Deep-Linking-With-AngularJS.htm)


Per ora inserisco questa tematica nelle attività di refactoring (to-do), ma
mi appunto che tra i progetti visti, quello che mi sembra essere più aderente
alle mie necessità è UI-Router, che mette in piedi una macchina degli stati ai
quali le singole viste rispondono. Per ora, per rispettare i miei sprint, passo
agli aspetti più “core” (test, test, test).