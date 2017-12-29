---
title: "CQRS+ES Version"
excerpt: "Il Progetto Discitur"
header:
    overlay_image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1404&q=80"
    caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: discitur_it
description: Discitur Project,CQRS+ES
group: Discitur
tags: [CQRS+ES,Software Design]
---
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "CQRS+ES Version",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-11-23",
  "articleSection" : [ "CQRS+ES", "Software Design" ],
  "url" : "http://williamverdolini.github.io/2014/11/23/discitur-CQRS/"
}
</script>

Dal momento del rilascio in produzione della beta-release del progetto Discitur sono passati più di sei mesi. In questo periodo, tra le altre cose, ho studiato il pattern <a href="http://martinfowler.com/bliki/CQRS.html" target="_blank">CQRS</a>+<a href="http://martinfowler.com/eaaDev/EventSourcing.html" target="_blank">ES</a>. Sto ancora studiando e imparando, ma in questo momento posso dire che questo modello mi ha cambiato come sviluppatore, come analista, come manager. Davvero!

Come? Torniamo ad aprile 2014. In quel periodo avevo già conosciuto CQRS + ES e avevo cominciato ad approfondire questi approcci. Intanto stavo pensando a una seconda release della mia applicazione (Discitur). Nel mio backlog c'erano alcune funzionalità che avevano lo scopo di misurare la qualità degli insegnanti, in particolare la funzionalità "reputazione". Si tratta della stessa funzionalità reputazione che è in <a href="http://stackoverflow.com/" target="_blank">Stackoverflow</a>, trasposto al Progetto Discitur. Ho realizzato che questo tipo di funzionalità si sarebbe adattata molto bene nel contesto Discitur, perché, come in StackOverflow, la reputazione dell'utente potrebbe diventare sinonimo di qualità degli utenti e delle loro competenze. In effetti, un'insegnante che pubblica più lezioni probabilmente è un insegnante che si applica più profondamente di altri, e le lezioni che vengono votate maggiormente rispetto ad altre sono lezioni migliori (e il suo autore un insegnante migliore) e l'utente che partecipa ed applica le lezioni altrui più spesso è probabilmente un insegnante più incline a condividere le loro esperienze e così via...Ma come implementare questa funzione?

Cos è la reputazione? Si tratta di un punteggio, che l'utente ha guadagnato facendo qualcosa di valore in Discitur (pubblicare qualche lezione, ottenere voti di apprezzamento, ecc). Alla fine il punteggio dell'utente è qualcosa che è stato guadagnato dopo alcuni _**eventi**_ della vita dell'utente. Qualcosa di molto simile al modello di Event Sourcing che stavo studiando...Allora...perché non refactorizzare l'intera applicazione in architettura CQRS + ES?

_che sciocco_...


## Quando utilizzare CQRS+ES è un errore

Come ho detto prima, lo studio di CQRS+ES mi sta rendendo un miglior sviluppatore, analista e project mangager. Di seguito, la mia lista dei punti chiave

- **Usalo solo se sai come usarlo**: Voglio dire che questo modello richiede una certa abilità tecnica di progettazione, si deve pensare a un sacco di aspetti prima di iniziare a sviluppare, il che è potrebbe essere costoso. È necessario impostare l'infrastruttura, si deve pensare alla separazione delle dll, alla conversione degli eventi, alle politiche di snapshooting, al DI container, a code asincrone, Saghe, proiezioni, ecc e se si dispone di un sistema legacy anche di strategie di migrazione, Ids-mapping , etc.
- **Usalo solo se sai cosa stai facendo**: voglio dire che questo modello non si adatta a tutto, leggete l'articolo <a href="http://www.udidahan.com/2011/04/22/when-to-avoid-cqrs/" target="_blank" >When to avoid CQRS - Udi Dahan</a>, quindi leggete di nuovo, e di nuovo ancora
- **Usalo solo se sai "che cosa" sei**: Voglio dire che questo modello richiede che si comprenda appieno il vostro dominio di business. Non c'è spazio per frasi come "Utente, hai bisogno di più campi del modulo? Nessun problema!", NO. Dovete capire quei campi, che cosa significano, perché l'utente li vuole in quel momento e in quel caso d'uso.

A volte (la maggior parte delle volte) non ho tempo ed energie (che è quello che dico a me stesso) per approfondire e padroneggiare le tecnologie, i frameworks, i designs, i domini, e così via...bene, in questi casi, non dovrei utilizzare CQRS+ES, a meno che qualcun altro possa pagare per le conseguenze. E per il resto delle volte? Beh...dipende. Non so se sono riuscito a passarvi il messaggio, ma se è così, riflettete su voi stessi ;-)

In ogni caso, Discitur è il mio "progetto palestra" e sto spendendo il mio tempo e le mie energie per comprendere a pieno CQRS + ES


## Perché praticare CQRS+ES è importante

CQRS+ES ha cambiato il mio punto di vista su come realizzare software perché questo pattern mi ha costretto a passare dalla "confort-zone dello sviluppatore" alla (scomoda) "zona di dominio". Comprendere il dominio, sia dal punto di vista del business sia da quello tecnico, ti permette di fare le cose di cui si ha realmente bisogno, e, probabilmente, nel modo più conveniente.

_Prima di CQRS+ES ero_

- uno sviluppatore pigro ("Utente, aggiungerò tutti i campi del modulo di cui hai bisogno...giusto il tempo di modificare la mia tabella")
- un analista superficiale ("Create-Read-Update-Delete...di entità...qualunque entità di cui stiamo parlando!")
- un progettista software chiuso di mente: ("n-tier, SOA, un - robusto - Database e il gioco è fatto.")
- un Project Manager confuso (più campi si hanno, più complessa è la funzionalità, più giorni-uomo nelle stime...Forza ragazzi! andiamo a rilasciare altri campi stanotte!!)


Che brutta persona che ero, ma...

_Dopo di CQRS+ES sono_...

più consapevole di tutti i miei difetti, e ora posso lavorare su di loro.

Sono pieno di speranza e di gioia oggi!


### Still Working...
Sto sempre studiando e provando nuove soluzioni e so che un giorno rilascerò la nuova release di Discitur in CQRS+ES. Questa è la mia direzione, oggi.