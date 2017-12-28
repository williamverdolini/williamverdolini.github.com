---
title: "Il Progetto Discitur"
tagline: Angular.js TDD
header: Angular.js TDD
description: Progetto Discitur, Tech, Angular.js, TDD
group: Discitur
tags: [Angular.js,TDD]
---

Come primo approccio al TDD non è stato un successo. Ammetto che la mia
storia e la mia esperienza mi hanno fatto travisare, confondere e sbagliare
strada diverse volte. Avevo creduto che gli strumenti in dote con l’assunzione
di Angular.js potessero permettermi di entrare in questo mondo in maniera
fluida…non è stato così, perché fondamentalmente non è un problema di
tecnologie o framework…è un problema di cultura.

Di fondo si tratta di scrivere prima il test e poi il codice che lo
soddisfa. Non sono affatto abituato a ragionare così…nella mia testa si
concretizza codice per la realizzazione di servizi, per la realizzazione di
modelli e UI…test? test prima di fare qualsiasi cosa? COME SI FA??!!

Nel primo sprint il TDD è stato un fallimento, ma ci riprovo a partire dal secondo.
Nel mezzo mi documento, studio per cercare di rendermi la cosa più familiare,
perché sono convinto (e per ora è solo convinzione) che la cosa funzioni
davvero meglio…vedremo.

 

Nel frattempo approfitto per fare il punto sul tema Testing affrontato nel
primo sprint, ecco un riepilogo:

- il punto di partenza, oltre la documentazione
     ufficiale Angular, sono stati  gli
     ottimi articoli di yearofmoo: <a href="http://www.yearofmoo.com/2013/01/full-spectrum-testing-with-angularjs-and-karma.html" target="blank">http://www.yearofmoo.com/2013/01/full-spectrum-testing-with-angularjs-and-karma.html</a>
     e  <a href="http://www.yearofmoo.com/2013/09/advanced-testing-and-debugging-in-angularjs.html" target="blank">http://www.yearofmoo.com/2013/09/advanced-testing-and-debugging-in-angularjs.html</a>.
     Gran bell’inizio, ma per quanto riguarda il TDD mi ha un po’ confuso <a href="http://www.yearofmoo.com/2013/09/advanced-testing-and-debugging-in-angularjs.html#so-when-do-you-do-your-testing" target="blank">http://www.yearofmoo.com/2013/09/advanced-testing-and-debugging-in-angularjs.html#so-when-do-you-do-your-testing</a>
      Avevo assimilato il concetto del
     test-develop-refactor ma leggere e studiare l’articolo mi aveva convinto
     (subito!) che questo non era il miglior approccio per portar subito valore
     al cliente: il rischio, infatti, è quello di spendere troppo tempo e
     risorse nello scrivere test prima di creare del vero valore con il codice
     deployabile; oltre al fatto che quando poi si fa un refactoring del codice
     mi capitava spesso di dover refactorare anche il test. Serve? Non sono
     sicuro…credo che al prossimo sprint riproverò dando al test un taglio più
     di design/requisiti (che tecnico) e realizzando un solo test per volta
     senza perdermi troppo nello scrivere test…per ora la domanda mi resta: che
     senso ha fare codice (anche automatizzabile) per testare le dipendenze dei
     moduli? Gli errori dell’assenza dei moduli si possono vedere in run-time o
     tramite altri test e2e che li usa…forse è tempo sprecato fare quel <a href="http://www.yearofmoo.com/2013/01/full-spectrum-testing-with-angularjs-and-karma.html#testing-modules" target="_blank">tipo di test</a>…lo stesso vale per <a href="http://www.yearofmoo.com/2013/01/full-spectrum-testing-with-angularjs-and-karma.html#testing-routes" target="_blank">routes</a>
     (a meno di casi per la gestione delle eccezioni o logiche particolari).
     Nel prossimo sprint proverò a definire il test con un carattere più legato
     al design e meno al codice e poi vedrò il test (unit, e2e, midway) che mi
     permette di scriverlo meglio…vedremo. Molto interessante per i novizi come
     me è vedere all’opera un esempio “reale”: <a href="http://www.objectmentor.com/resources/articles/xpepisode.htm" target="_blank">http://www.objectmentor.com/resources/articles/xpepisode.htm</a>
- Per il momento sono concentrato sul Front-End
     e su Angular. Per il test sto trovando soddisfazione con l’uso di: 
    - <a href="http://gruntjs.com/" target="_blank">Grunt</a> per
      la gestione dei task. Uno dei più importanti è quello del test continuo
      tramite task di watch changing del codice
    - <a href="http://karma-runner.github.io/0.10/index.html" target="_blank">Karma</a> (per
      unit-test e midway) + <a href="http://visionmedia.github.io/mocha/" target="_blank">mocha</a>
      (per la scrittura delle asserzioni)
    - <a href="https://github.com/angular/protractor" target="_blank">Protractor</a> ed il suo <a href="https://github.com/teerapap/grunt-protractor-runner" target="_blank">runner per Grunt</a>) per l’e2e (profondo, dato che consente di esplorare lo scope
      Angular) + <a href="http://jasmine.github.io/" target="_blank">jasmine</a> (per test
      e assertion framework)
    - per il debug del test trovo karma più
      semplice di protractor, ma devo approfondire meglio

 