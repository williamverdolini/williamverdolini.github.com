---
layout: wvpage
title: "Il Progetto Discitur"
tagline: Prerequisiti
header: Prerequisiti
description: Progetto Discitur, Prerequisiti, Tecnologie
group: Discitur
---
{% include JB/setup %}

Difficile da dire, penso si capisca strada facendo. Sicuramente nessun
prerequisito avanzato sulle tecnologie: la maggior parte di quelle che userò
per me saranno nuove e non ho avuto precedenti esperienze lavorative che mi
hanno permesso di utilizzarle; quindi per molti aspetti penso che l’uso che ne
farò sia lievemente più che amatoriale (spesso anche meno). 

 

###Parlando di _tecnologie_ :
 

1.    VCS: **Git**. Mai
usato prima. Quasi sempre (come tutti) ho lavorato con strumenti di
versionamento e quindi ho una cultura generalista sull’uso. Git mi affascina
per la sua diffusione e per il concetto che ognuno ha una copia locale del
repository che costituisce di fatto un branch, che, parliamoci chiaro, è quello
che capita di fatto nella vita quotidiano di chi sviluppa software

2.    Front-End
Client: **Angular.js**. E’ amore, lo sto studiando con voracità e passione: ed ho
andamenti molto altalenanti, a giorni lo amo (professional!), a giorni lo odio
(da ragazzi)…non so ancora quale sarà l’ultimo sentimento a riguardo, ma per
ora è un crescendo J Leggendo questo
blog: [http://www.bennadel.com/blog/2439-My-Experience-With-AngularJS-The-Super-heroic-JavaScript-MVW-Framework.htm](http://www.bennadel.com/blog/2439-My-Experience-With-AngularJS-The-Super-heroic-JavaScript-MVW-Framework.htm)
direi che il sentimento è comune...quindi ok così

3.    Back-End: REST-Full webservice + ORM. Non ancora deciso cosa alla
fine, ma probabilmente inizierò con .Net **WebAPI 2.0** con **Entity Framework 6** (che
sono tecnologie che mi hanno incuriosito nell’ultimo [.NET CommunityDays](http://www.communitydays.it/events/communitydays2013-roma/) ).

4.    Database:
relazionale. **SQLServer** (forse un domani Mysql o PostGRE SQL, ma adesso non è
tra le mie priorità). Inizialmente ero molto incuriosito dai db NoSQL, MongoDB
su tutti, ma avevo molti dubbi sulla loro reale applicabilità, per il fatto che
avere documenti non facilmente collegabili tra loro è un aspetto che penso sia
fortemente limitante per applicazioni che hanno un progetto di crescita ed
evoluzione non sempre definito. Voglio dire: il progetto su cui lavorerò
(Discitur) è una web app che ha un perimetro di funzionalità definito, ma che è
aperto all’inserimento di chissà quali altre funzionalità in futuro (e questo
vale per il 99,9% delle applicazioni in giro). Avere bisogno di fare delle
join, di estrarre e collegare tra loro i dati è una necessità quotidiana e
lavorare con documenti JSON, scollegati l’uno dall’altro e con limitate forme
di normalizzazione lo trovo fortemente limitante in termini funzionali. Poi
sono sicuro che sia performante ed adattissimo per blog o simili, ma per
un’applicazione…ho studiato un po’ MongoDB, ma leggere questo articolo [http://www.sarahmei.com/blog/2013/11/11/why-you-should-never-use-mongodb/](http://www.sarahmei.com/blog/2013/11/11/why-you-should-never-use-mongodb/)  ha confermato quelle che erano poco più che
sensazioni. Quando avrò soddisfatto la mia curiosità sulle SPA e su Angular e
quando avrò un po’ più di coraggio proverò MongoDB. Se c’è qualcuno che può
portarmi qualche esperienza concreta di utilizzo di DB NoSQL in un contesto di
un applicazione complessa, ne sarei davvero felice (una vocina mi dice che
sarebbe bello provarlo).

 

###_Metodologia_ :

1.    **Agile**. E’ da parecchi
anni che mi interesso di metodologie lean ed “agile” (ma sempre da
autodidatta). Un ulteriore libro che mi è piaciuto come approccio (dalle
trincee…) è questo: [http://www.infoq.com/minibooks/scrum-xp-from-the-trenches](http://www.infoq.com/minibooks/scrum-xp-from-the-trenches)
(lo consiglio a chiunque avesse un passato o un presente da Project Manager IT).
Definirei il mio approccio “agilino” :), per il fatto che realizzo il progetto da solo, senza un team (per ora),
ma senza un team molte delle tecniche agili si depontenziano (dalle stime, agli
sprint, alle demo, ecc…), però l’approccio è lo stesso che ho per le
tecnologie, ovvero quello di sfruttare questo progetto come una palestra, per
provare, allenarmi e tastare con mano cosa c’è di buono e cosa no nella
metodologia Agile applicata

2.    Per prima
cosa vorrei coniugare un aspetto architetturale, conseguenza di realizzare una
SPA ed un aspetto tipico delle metodologie agili:

        -       Uno dei principi espressi nel manifesto Agile è questo: 
        >_Our highest priority is to satisfy the customer through early and
        >continuous delivery of valuable software_
        >######[http://agilemanifesto.org/principles.html](http://agilemanifesto.org/principles.html)
        Una delle più efficacy chiavi di lettura che ho trovato a questo principio è 
        quella di progettare e realizzare le interfacce di front-end subito senza
        preoccuparsi di “sistemare” le cose dietro le quinte (aka back-end) e ricevere
        quanto prima feedback da parte dell’utente su quello che sarà il risultato
        finale. Questo approccio è vincente perché consente di avere nel minor tempo
        possibile e con la maggior definizione possibile quello che è un anteprima
        funzionante del sistema finito. Questo si sposa bene con uno degli aspetti
        delle architetture SPA.

        -       Il back-end non è così importante ([http://aspectized.com/2012/10/backend-is-important-its-just-the-last-of-components/](http://aspectized.com/2012/10/backend-is-important-its-just-the-last-of-components/))
        in un’architettura di una SPA, l’accesso ai dati avviene per lo più via
        webService RESTful, quindi l’aspetto degno di nota di questo concetto è che il
        back-end può essere facilmente e velocemente “mockato”. Ben inteso: la frase
        “non è così importante” è vera solo con la premessa che arriva dal punto
        precedente. Il back-end E’ IMPORTANTE in realtà, perché è solo grazie ad un
        back-end solido, che individua le giuste entità, che incapsula le logiche di
        business con la minor dipendenza possibile da ciò che ci sta sopra, che
        consente una gestione efficiente e “integra” della transazione, che
        un’applicazione può avere un futuro indipendentemente dal canale che la offre.
        L’aspetto che però va sottolineato è che il back-end NON interessa l’utente (9 volte su 10). 
        Questa è la realtà. E quindi anche se sono uno che ha speso molto
        tempo e risorse a realizzare back-end “cazzuti” – passatemi il termine da
        “backendista” -  (con gestione delle
        transazioni , versioning dei record e delle transazioni, gestione
        implicita/esplicita della transazione, con e senza ORM, sia online, sia batch,
        ecc..), sono anche uno che si è reso spesso conto che le tecnologie cambiano ed
        affezionarsi a qualcosa è sbagliato (affezioniamoci al nostro cane). Leghiamoci
        ai disegni architetturali ben fatti invece, quelli restano a prescindere,
        mentre le tecnologie, i db, gli ORM, i framework sono solo “tecnicaglia”. Se
        l’obiettivo è passare una bella giornata a disneyland con la famiglia, a chi
        interessa la macchina che ci ha portato fino al parcheggio?


3.    **Test Driven**: è tanto, tanto, tanto, tanto che vorrei provare. In ambito lavorativo non mi è
mai capitato di lavorare su progetti TDD; solo in eccezionali occasioni mi è
capitato di incontrare clienti/manager “visionari” che puntavano a concetti
simili a questo. Una “mosca bianca” che cito con piacere era stata Cesare
Pistelli (ora un pezzo grosso di Zurich IT): ai tempi si era “fissato” di
creare un sistema di automazione dei test per abbattere i costi di NON
regressione (che cubavano uno sproposito e, parlandoci chiaro, non davano molto
valore aggiunto); ma MAI si è riusciti ad accontentarlo. Forse i tempi (ed i
luoghi) non erano maturi, ma il massimo che si era riuscito a fare era mettere
in piedi una serie di script per la navigazione automatica dell’applicazione
web, che però non venivano usati per i test di non regressione, quanto, invece,
come smoke test all’avvio giornaliero dell’applicazione per verificare che
tutti i sotto-sistemi fossero funzionanti. Non so cosa stai facendo ora Cesare,
ma se hai qualche programmatore da instradare nella direzione giusta, butta un
occhio a [Karma](http://karma-runner.github.io/0.10/index.html)
(uno dei motivi per cui voglio approfondire Angular.js) e [Grunt](http://gruntjs.com/).