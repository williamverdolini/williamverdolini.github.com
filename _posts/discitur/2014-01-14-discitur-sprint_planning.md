---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Le Stime
header: Le Stime
description: Progetto Discitur, Planning, Stime, Metodologia, Scrum, Agile
group: Discitur
tags: [Agile]
---
{% include JB/setup %}

Di seguito un elenco di aspetti da tenere in considerazione nel planning dei propri sprint.

### User Story Tecniche

Se il progetto è nuovo, è comune avere tante componenti tecniche da
indirizzare (routing, macchina di test, ambienti, back-end, ecc..). Questi sono
aspetti importanti e quasi mai valutati come si deve. E’ importantissimo
sensibilizzare il Cliente ed il Product Owner sulla necessità di dedicare
risorse alla realizzazione di queste componenti, anche con azione di “terrorismo
psicologico” (se non lo farai la tua casa sarà invasa da migliaia di
cavallette…). Scherzi a parte (ma non troppo), per questi aspetti trovo vangelo
quanto condiviso da Henrik Kniberg nel suo favoloso libro (lettura obbligata
per chi vuole avventurarsi nello SCRUM): [http://www.infoq.com/minibooks/scrum-xp-from-the-trenches](http://www.infoq.com/minibooks/scrum-xp-from-the-trenches)

Buona lettura!

### Refactoring

Le attività di refactoring sono attività quotidiane, soprattutto se si
segue un approccio di sviluppo Test-Driven. Ma non solo. Infatti se si sta
lavorando su progetti nuovi o start-up, le attività di refactoring devono
comprendere anche attività ristrutturazione, isolamento ed astrazione del
codice, che possono essere anche molto dispendiose. Per citarne alcune (qualora
possa servire a non perdere pezzi nelle stime iniziali):

- separazione layer, modularità, Single
     Responsibility Principle
- bug-fixing
- tracing, logging ed altri “aspetti”
     cross-layer
- configurazioni ambienti di test e CI
- attività di scaffolding

Gli approcci che trovo più utili per gestire il refactoring sono:

- prevedere attività di refactoring per ogni
     story, proporzionali alla stima della story
- prevedere una User Story tecnica finale per
     un refactoring complessivo

Entrambe hanno pro e contro e quindi il miglior approccio in assoluto è
quello di usarle entrambe contemporaneamente. Attenzione però (e sempre) a
cercare di individuare il vero valore di queste attività tecniche, in modo che
il PO non possa minimizzare, sottovalutare e passare ad altro.

### Sprint Re-Planning

Questo è un aspetto altamente destabilizzante per la realizzazione degli
sprint. E’ segno di una scarsa analisi ed approfondimento delle funzionalità e
potrebbe avere conseguenze devastanti sulla riuscita degli sprint. MA, capita.
Capita in tutte le metodologie di dover fare i conti con la vita vera. Capita
quindi di dover ripianificare il progetto e la cosa va gestita come qualsiasi
altra situazione. Ho letto diversi articoli sulla questione e li ho trovati un
po’ contraddittori. La contraddizione di fondo che ho notato è che quasi sempre
si parla della pianificazione Agile come un qualcosa che si adatta alle
esigenze che mette il cliente ed il valore rilasciato al centro e che quindi
non deve essere qualcosa di immutabile, dall’altra parte articoli (con un
taglio più pratico) sconsigliavano assolutamente di fare replanning degli
sprint definiti. Io penso che se la metodologia è Agile, deve esserlo
soprattutto sulla pianificazione. E’ vero che su questo aspetto le cose si
fanno più difficili, perché potrebbe non essere sempre facile, comodo,
possibile ripianificare rispetto le condizioni contrattuali stabilite, però
bisogna fare un tentativo e condividere, per quanto possibile, con il Cliente
le scelte e le problematiche progettuali. 

In ogni caso è un aspetto che va approfondito nella retrospettiva dello
sprint: limitare al massimo le interferenze esterne alla black-box dello sprint
è una delle chiavi del successo degli sprint. Evitate che il product back-log
cambi, evitate che le date cambino, evitate che il commitment del gruppo cambi.
Non sono cose che si possono controllare a volte (pensiamo alle malattie), ma
c’è sempre da prevedere l’imprevisto nel calcolo della velocità del team
(qualunque metodologia si applichi).

### Ciclo di Raffinazione

Sicuramente esisterà un nome più corretto per quello che chiamo il Ciclo di
Raffinazione (chi lo conosca mi illumini).Con questo termine voglio
sintetizzare il processo di raffinazione progressiva che porta la singola user
story dal concetto alla realizzazione finale. I concetti alla base di questo
ciclo è il solito: 

1)     Coinvolgere il Product Owner / Cliente il più
possibile

2)     Portare valore il prima possibile

3)     Minimizzare il rework



Come lo realizzo. Cercando di rispettare questa sequenza:

1. Produrre la UI in maniera completa (**UI**). Se parliamo in Angular
     significa produrre view, services, controller, routes. Le directives
     possono essere trattate successivamente. In questa fase è importante
     produrre una UX quanto più simile al prodotto finito. Le directives,
     spesso, possono essere trattate come refactoring della UI e viste
     successivamente. Se TDD, il test ed il refactoring, per quanto possibile,
     va sviluppato in maniera congiunta al proprio codice e quindi, in questa
     fase, anche per il test E2E è preferibile usare dei mock per concentrarsi
     sull’interfaccia, le routes, ecc..
2. FeedBack con il Product Owner (o con il
     Cliente). Questa sorta di User Acceptance (**UA**) può essere una sorta di anticipazione della demo finale se
     è stato tutto chiaro; in caso contrario, ovvero quando il PO aveva in
     testa tutt’altra resa grafica consente di bloccare gli sviluppi e rivedere
     le cose prima ancora di aver realizzato test e back-end. Il concetto è che
     per il PO o l’utente finale l’applicazione è la UI, è quello che usa, è
     quello che vede. Tutto quanto c’è sotto (e che fa funzionare realmente
     l’applicazione) non è un valore effettivamente tangibile per l’utente e
     quindi ricade in una importanza decisamente minore. In questa fase è
     facilissimo che il PO aggiunga funzionalità non menzionate prima: siate
     agili, che in questo caso significa saper valutare bene se le funzionalità
     aggiuntive possano essere incluse senza scossoni al planning, se inserire
     nuove user stories in coda al resto. Importante è che il PO non diventi un
     tiranno e forzi la mano per inserire aspetti non presenti nella
     definizione del backlog. Succederà (per lo meno a me succede sempre), ma
     non è complicatissimo educare il PO, si tratta di relazioni umane ed
     ingegno J
3. Back-End (BE). si sviluppa tutto il back-end,
     eliminando i fake sparsi qua e là per consentire la UA del punto 2
4. TDD per il BE. Si rieseguono anche i test
     realizzati precedentemente
5. Refactoring completo (R).
6. Demo finale

 

Schematizzando:

 

UI --> TDD --> R --> UA --> BE --> TDD --> R --> DEMO

 

Se consideriamo che UI e BE sono _Sviluppo_,
UA e DEMO sono _Feedback_ e TDD e R
sono _Refactoring _ è possibile
tracciare la seguente rappresentazione

<img src="/images/discitur/dev_cycle.png"/> 

 

che schematizza bene il circolo virtuoso dell’approccio agile.

ATTENZIONE: questo approccio è molto utile per individuare falle o lacune
nella definizione dei requisiti e della parte di analisi e consente di fatto di
ridurre il rework su quanto fatto, MA potrebbe “bruciare” lo sprint e la demo
finale, presentando di fatto il 100% delle funzionalità utente previste dallo
sprint. Questo in genere mette il PO nella condizione di chiedere accelerazioni
o di inserire altre funzionalità. Siate bravi a mostrare quanto sia mockato
quello che si fa vedere nella prima fase e fate in modo da non enfatizzare
questo step, magari delegando lo scrum master o un analista di riferimento a
vedere insieme al PO il "premasticato". Non pubblicizzate la cosa, non fate
venire persone alla demo, basta il PO.