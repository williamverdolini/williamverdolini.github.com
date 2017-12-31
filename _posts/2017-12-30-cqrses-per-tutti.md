---
title: "CQRS+ES per tutti"
excerpt: "Se la conoscenza può creare dei problemi, non è tramite l’ignoranza che possiamo risolverli (Asimov)"
header:
    overlay_image: "/assets/images/nigel-tadyanehondo-346836.jpg"
    overlay_filter: 0.3
    caption: "Photo by Nigel Tadyanehondo on [**Unsplash**](https://unsplash.com/photos/pXf4OH65OhE)"
toc: false
toc_label: "Contents"
last_modified_at: 2017-12-31T00:00:00
author_profile: true
categories: 
   - CQRS+ES
tags: [CQRS+ES]
---


Sì, hanno tutti ragione quando dicono che CQRS è complicato e che spesso viene usato sovraingegnerizzando "pericolosamente" le cose. Hanno ragione quando dicono che andrebbe usato solo quando ci sono tutte le condizioni giuste.

Ha ragione [Greg Young](https://ordina-jworks.github.io/domain-driven%20design/2016/02/02/A-Decade-Of-DDD-CQRS-And-Event-Sourcing.html).<br/>
Ha ragione [Martin Fowler](https://martinfowler.com/bliki/CQRS.html).<br/>
Ha ragione [Udi Dahan](http://udidahan.com/2011/04/22/when-to-avoid-cqrs/).<br/>
Ed ha ragione [Mauro Servienti](http://blogs.ugidotnet.org/topics/archive/2017/12/29/Quando-la-veritagrave-non-egrave-una-sola-CQRS-consistenza-eventuale.aspx). 

Sono anni che leggo e sento questi avvertimenti autorevoli, ma nonostante abbia letto di tutto, nonostante abbia sperimentato in "garage", nonostante le conferenze e le chiacchierate, nonostante abbia un po' d'anni di esperienze e comincio a sentire la puzza un po' prima che la merda entri in casa...

nonostante tutto, l'ho fatto. E, potendo tornare indietro lo rifarei.<br/>
E confesso: ~~quasi~~ sicuramente (con il team) l'abbiamo adottato in sistemi che non ne avevamo bisogno; o, almeno, non ne avevano bisogno ovunque l'abbiamo usato. Però continuo a vederne giornalmente i benefici; anche se essere asincroni è una bella rogna..

Ecco la mia top 5 del perchè stiamo usando CQRS:

1. Il team è spaventosamente cresciuto! Ed avere un team cazzuto è meglio di qualunque altra cosa
2. Il team ragiona veramente in termini DDD. Usavamo DDD prima ancora di adottare CQRS; ma dopo aver fatto il passaggio, sono fioccate domande come: _ma su cosa prende decisioni il modello? Ma questa informazioni a chi serve (utente/modello)? Non si è mai usato prima il termine "XXXXXX", cos'è? Ma se questa informazione non ce l'ho "in tempo", che problema ci sarebbe?_
3. Il codice è fatto meglio, le responsabilità sono chiare, si esprime nella lingua del business e si manutiene in maniera lineare (il più delle volte). Questo anche e soprattutto grazie al lavoro dei ragazzi di [Proximo](https://github.com/ProximoSrl/Jarvis.Framework). E pensare che qualcuno sostiene... 
> [Don't write a CQRS framework](https://twitter.com/cyriux/status/693112052542521344)!!!
4. Cerchiamo di fare piccole applicazioni e poi di collegarle una all'altra; più sono piccole, meglio è; anche se dovessimo buttar via un'applicazione fatta in CQRS per riscriverla sui 3 layer, non sarebbe una cosa sconvolgente. Per ora non ci è capitato. 
5. Il team è spaventosamente cresciuto. DAJE!


E' vero. Sono tutti "side-effects" e non tengono conto delle esigenze del contesto. Lo so, lo so. Ma ribadisco il concetto: **avere un team cazzuto è meglio di qualunque altra cosa**!<br/>E' il primo dei prerequisiti e va ben oltre gli aspetti tecnici.

Passare da un team che "butta dati dentro e fuori da una tabella" ad uno che ragiona sui comportamenti del modello e degli utenti è un bel cambiamento.
Chiaro, non è una passeggiata di salute, e, chiaro, non è tutto e solo merito del CQRS. Ma da quando abbiamo cominciato ad adottarlo la musica è cambiata. Ci ha costretto a fare un salto di qualità, ad anticipare tutta una serie di domande e a migliorare di brutto il nostro modo di lavorare.

Non facciamo tutto in CQRS e ultimamente si riflette molto su cosa sia opportuno gestire ad eventi/projections e cosa sia opportuno fare in maniera più "tradizionale"; sono tutte riflessioni sane, poi non è detto che le scelte siano azzeccate.
 
Ma stiamo crescendo ed un giorno prenderemo tutte decisioni giuste, con meritate pacche sulle spalle da Mauro, Udi, Greg e Martin. Nel frattempo continuiamo a studiare, applicare, correggere e crescere.

Mi viene in mente una frase...

> The journey is the most important thing, not the destination. 

...dov'è che l'ho letta?