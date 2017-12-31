---
title: "Industrializzare il Valore"
excerpt: "Il Progetto Discitur"
header:
    overlay_image: "/assets/images/neonbrand-426918.jpg"
    caption: "Photo by NeONBRAND on [**Unsplash**](https://unsplash.com/photos/zFSo6bnZJTw)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: discitur_it
description: Progetto Discitur, Planning, Stime, Metodologia, Scrum, Agile
group: Discitur
tags: [Agile]
---

Prima di entrare nel vivo delle attività progettuali, occorre spendere un
po’ di tempo su questo aspetto. Ho dato due nomi allo stesso concetto per via
della mia doppia anima di Project Manager (tradizionale-waterfall e Agile):

- Industrializzare: ovvero rendere ripetibili,
     veloci, privi di errori, efficaci le attività ripetitive di basso livello,
     che non sono direttamente legate al business. Il programmatore “della strada”
     non ne è interessato, ma sviluppa su binari precostruiti che gli
     consentono (o dovrebbero consentirgli) di non sbagliare strada
- Creare un ambiente di valore: è la stessa
     cosa, ma con al centro l’idea di creare valore al cliente. Ovvero creare
     un contesto, un ambiente di lavoro, un metodo, un architettura che permetta
     ai componenti del team di poter creare più efficacemente e velocemente
     valore per l’utente finale

 

Man mano che scrivo mi rendo conto di dipingere il Project Manager
Waterfall come una specie di generale della marina militare ed il Project
Manager Agile come una specie di santone hippy…sono l’unico che vede calzante
questa metafora?

 

Tornando al nocciolo della questione, quello del creare un contesto in
grado di mettere i programmatori nella condizione di produrre valore più
velocemente e meglio è fondamentale prima di iniziare qualsiasi progetto.
Ognuno alla fine arriva ad un suo contesto ideale e non c’è una ricetta
vincente a prescindere, ma ho qualche riflessione generale in merito:

- Non è prioritario che i programmatori
     conoscano le motivazioni dietro alla propria architettura, alle
     convenzioni utilizzate, agli strumenti di test, alla gestione degli
     ambienti, ecc.. ma è necessario che li conoscano. Voglio dire, si produca
     valore e lo si faccia nel più breve tempo possibile, ma appena c’è una
     pausa, tra uno sprint e l’altro, approfittate per spiegare e far
     comprendere ai vostri programmatori il perché vivono nel mondo in cui
     vivono, quali sono state le motivazioni di alcune scelte, perché alcuni
     compromessi. Li renderà più consapevoli, competenti e, alla fine,
     programmatori migliori;
- lasciate che i programmatori si occupino solo
     di creare valore diretto; ovvero che le loro giornate siano produttive
     nella realizzazione di componenti di valore sensibile per il Cliente. La
     cassetta degli attrezzi dell’idraulico non interessa a quasi nessuno che
     chiama un idraulico
- Fate in modo che gli aspetti tecnici
     diventino user story. In fondo tutte le convenzioni, i metodi, le
     architetture le utilizzate per poter portare un valore più alto al
     Cliente. In termini di abbassamento del rework, del bug-fixing, del
     time-to-market, ecc..questo consentirà di ritagliarvi lo spazio ed il
     tempo necessari per poter partire con il piede giusto
- Questi sono aspetti importanti a prescindere
     dal numero di programmatori che avete nel vostro team. da 1 a 1000 la
     musica non cambia. Tra premere un bottone che genera componenti già
     scaffoldizzate e creare a mano il tutto direi che la scelta è obbligata.
- Se il progetto è nuovo non pretendente di
     avere tutto giusto prima di iniziare. l’Agile è molto più efficace in
     quest’ottica delle metodologie tradizionali. Prototipate, realizzate e
     reingegnerizzate per abitudine; dopo qualche tentativo si arriverà
     naturalmente alla soluzione più adatta alle diverse esigenze
- Come architetti o Project Manager studiate e
     siate curiosi. Oltre a migliorare le vostre competenze personali, può
     capitare di imbattersi in qualcuno che è passato prima di voi per la
     vostra stessa strada e vi evita di ripassare per gli stessi vicoli ciechi.
     Il bello della rete è questo per me. Digressione dovuta: un grazie di
     cuore a tutti quelli che hanno avuto la voglia di condividere le loro
     esperienze; nel mio piccolo cerco di dare il mio contributo


### La struttura del Progetto Angular

Entriamo nel vivo. Front-end subito per l’utente finale e quindi Angular.js
(sul perché della scelta di questo framework, eventualmente, mi soffermerò più
avanti). Approfondendo da settimane il framework Angular.js, ho provato diversi
approcci per strutturare il progetto, poi ho fatto tesoro dell’esperienza e dei <a href="http://entwicklertagebuch.com/blog/2013/10/how-to-structure-large-angularjs-applications/" target="_blank">consigli di Marco Rinck</a>.  

### TDD

Una delle più grosse novità per me in questo progetto è l’uso del
Test-Driven Development. Un po’ difficoltoso è iniziare, soprattutto se ci si
deve liberare delle “tossine” della programmazione tradizionale…per trattare
questo importantissimo tema ho preferito tracciare una cronistoria nelle
sprint-review dei miei avanzamenti nell’uso di questa nuova filosofia di vita!

### Task Board

Non ho particolari insight da aggiungere sull’argomento. Vi rimando
all’<a href="http://www.infoq.com/minibooks/scrum-xp-from-the-trenches" target="_blank">antologia</a> per i dettagli. L’unica cosa che ci tengo a dire è: usatela,
anche se vi sembra inutile. E’ tutto il contrario. Avere sotto gli occhi la
situazione e gli obiettivi è importantissimo per migliorare la produttività. 