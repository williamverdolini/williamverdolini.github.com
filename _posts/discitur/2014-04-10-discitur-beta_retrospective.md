---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Release Discitur 0.1.0 (beta!) Retrospettiva 
header: Release Discitur 0.1.0 (beta!) Retrospettiva
description: Progetto Discitur,Agile,Tech
group: Discitur
tags: [Agile,Tech]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Release Discitur 0.1.0 (beta!) Retrospettiva",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-04-10",
  "articleSection" : [ "Agile","Tech"  ],
  "url" : "http://williamverdolini.github.io/2014/04/10/discitur-beta_retrospective"
}
</script>

 

Sono arrivato alla <a href="https://github.com/williamverdolini/discitur-web/releases/tag/0.1.0" target="_blank">Beta version!</a> Un momento di auto-celebrazione (anche
perché, sono sincero, all’inizio non ero proprio convinto che sarei arrivato in
fondo…)

Ok, finito il momento autocelebrativo.

E’ il momento per analizzare un po’ questa esperienza e definirne i
pro-contro.

###Partiamo dai numeri

prima i dati oggettivi.

- ho iniziato il progetto il 29/12/2013 e sono
     andato in beta il 30/03/2014: **91 giorni**(13 settimane)
- il tempo dedicato al progetto è stato
     abbastanza costante e pari a circa 2,5h/giorno a settimana (la media per
     eccesso sulla settimana lunga è infatti circa 20hh), per un totale di circa
     32,5 ggu (giorni uomo).
- Non tutto il tempo è stato dedicato al
     progetto di sviluppo, infatti circa 5-6 ggu (complessivamente) sono stati
     dedicati alla predisposizione del <a href="http://williamverdolini.github.io/" target="_blank">blog</a> (grazie e <a href="https://github.com/" target="_blank">https://github.com/</a> e <a href="http://jekyllbootstrap.com/" target="_blank">http://jekyllbootstrap.com/</a>) e alla
     scrittura degli <a href="http://williamverdolini.github.io/Discitur.html" target="_blank">articoli del diario di progetto</a> (che finirò di pubblicare a breve), quindi, con
     buona approssimazione, il progetto (comprensivo dei costi di formazione,
     apprendimento e configuration management) è costato **25 ggu**
- Gli sprint, inizialmente 7, poi accorpati in
     5, sono stati chiusi con una progressione abbastanza costante ogni 2-3
     settimane (2,6 settimane ogni sprint).
- **45 story
     points** del progetto (dalle
     stime iniziali) 
- **9-10
     sp la velocity** assestata sul
     finale

 

Non male, considerando in più le seguenti caratteristiche del progetto:

- tecnologie nuove e curva d’apprendimento da
     scalare
- metodologia nuova e, per quanto riguarda il
     TDD, impegnativa

 

Sono particolarmente convinto, però, che proprio la metodologia Agile è
stata una delle chiavi di velocità ed efficienza del progetto; infatti
l’attenzione al time-box degli sprint, l’aggiornamento e controllo quotidiano
della task-board di ogni sprint mi ha fortemente motivato a rimanere sulla
track giusta, anche a discapito del tanto tempo investito in formazione ed
approfondimenti. Ovviamente l’esperienza vissuta non è un esempio che mi
permetta di accertare in generale la bontà del metodo perché:

- l’ho applicato con scarse competenze (e mi
     sono aggiustato le cose molte volte)
- ero da solo (una deviazione forte dal modello
     ideale di applicazione)

ma i tratti migliorativi credo di averli colti a pieno.

 

###Una valutazione sulle tecnologie

**_Front-end_**

<a href="http://angularjs.org/" target="_blank">Angular.js</a>. Ottima valutazione. Tutto molto ben strutturato
e testato, che consente di avere un elevato time-to-market, anche per i novizi.
Ha dei lati oscuri, che richiedono un approfondimento importante e non sono
intuitivi come il resto (come quelli legati al routing, al dirty-checking,
all’uso delle direttive collegate, all’intreccio carpiato tra gli scope che si
possono avere, ecc..), ma per il resto è uno dei migliori framework che mi è
capitato di utilizzare. La vera nota dolente? E’ Javascript….certo, oggi ci
sono strumenti di controllo, test e debugging davvero ben fatti e lo sviluppo
è, di fatto, paragonabile a quello di un linguaggio compilato, ma la “libertà”
(o, se vogliamo, la mancanza di struttura o tipizzazioni) rende a volte molto
complicato il problem detecting and solving. E’ per questo che in uno dei
prossimi progetti ho intenzione di approfondire ed utilizzare <a href="https://www.dartlang.org/" target="_blank">Dart</a>, un framework di front-end su cui
Google sta lavorando molto e che, dal mio punto di vista, ha anche lo scopo di
migliorare la sicurezza, testabilità, robustezza, velocità nello sviluppo di
SPA. E siccome la famiglia è sempre la stessa (Google) le competenze fatte su
Angular, spero si possano riutilizzare a pieno nella libreria <a href="https://angulardart.org/" target="_blank">AngularDart</a>! (ho già l’acquolina in bocca :))

 

**_Back-End (Web Services)_**

<a href="http://www.asp.net/vnext/overview/aspnet-web-api" target="_blank">WebApi 2.0</a>. Non ho spinto gli approfondimenti più del
necessario, ma l’ho trovato semplice e funzionale per il mio scopo. E’ stato un
po’ più complesso gestire l’autenticazione con OAuth e OWIN perché questo
middleware esce un po’ dalla struttura dei Controller di WebApi, ma alla fine
si riesce ad ottenere risultati in poco tempo. Per fare un esempio concreto: un
aspetto che non mi è piaciuto per come l’ho fatto è la gestione della
registrazione di un account, che prevede:

·        
la
validazione dei dati di input

·        
l’inserimento
di un account nella gestione dell’Identity previsto dal framework .NET 4.5

·        
l’inserimento
di un nuovo user nella struttura applicativa dell’applicazione 

·        
l’inserimento
di un record per gestire l’attivazione dell’account

·        
l’invio di
una mail per l’attivazione finale dell’account. 

Alcuni di questi step (in particolare quelli legati alla gestione dell’Identity)
l’ho dovuti gestire con la chiamata ai servizi esposti dallo specifico
controllo “spezzando” la transazione in più parti. Questo è male perché espone
il fianco ad una non integrità del dato inserito. Sono sicuro che può (e deve)
essere fatto meglio e che la transazione si riesca a garantire alla fine, ma
non mi è stato facile (come per il resto) capire il modo migliore di farlo. Non
ho nemmeno voluto investigare troppo perché le mie priorità erano legate al
rispetto delle time-box e all’approfondimento di Angular e anche perché in
futuro mi piacerebbe provare qualcosa di…”diverso”.

 

**_Back-End (ORM)_**

<a href="http://msdn.microsoft.com/en-us/data/ee712907.aspx" target="_blank">Entity Framework 6</a>. Più soddisfatto rispetto al WebApi. E’ un ORM
maturo e semplice da utilizzare, sia in Code First, sia in Model First. In
questo caso, l’approfondimento fatto, se possibile, è ancora minore rispetto al
WebApi (e quindi il mio giudizio è proprio da prendere con le pinze), ma questo
è anche un segnale del fatto che è stato particolarmente facile ed immediato
fare ogni task richiesto, senza grosse complicazioni…che è poi ciò che un
programmatore chiede ad un framework!<br/>Poco non è!

 

**_Versioning Control System_**

<a href="http://git-scm.com/" target="_blank">Git</a>. Mai più senza! Davvero un prodotto
ben fatto e, dopo gli approcci iniziali, abbastanza semplice da utilizzare. Ho
avuto un approccio “darwiniano” a Git, partendo da utilizzarlo da riga di
comando, per poi passare a <a href="http://git-scm.com/" target="_blank">Github for Windows</a>,
per poi approdare definitivamente su <a href="http://www.sourcetreeapp.com/" target="_blank">SourceTree</a>,
(davvero un salvavita!) e questa evoluzione mi ha permesso di approfondirlo in
maniera più “amichevole”. Quello che poi mi ha impressionato è il <a href="https://github.com/" target="_blank">Github</a>, che (come si sa) per progetti Open
Source è gratuito e mette a disposizione uno spazio che è possibile usare per
siti personali, blog, ecc..

Ho provato anche il supporto online e devo dire eccellente: per un
progettino qualunque come era il mio ad una segnalazione qualunque hanno
risposto in diverse occasioni nel giro di mezz’ora. WOW.

Se devo proprio trovare una nota spiacevole è stato leggere <a href="http://techcrunch.com/2014/03/15/julie-ann-horvath-describes-sexism-and-intimidation-behind-her-github-exit//" target="_blank">questo articolo</a>: molto spiacevole leggere queste cose…
 

###Una valutazione sulla metodologia Agile

Non nego che gli aspetti metodologici sono stati quelli più duri da
abbracciare, perché richiedono (per quelli come me che hanno un po’ di “storia”
e tanta metodologia RUP-Style alle spalle) di “scongelare” meccanismi oramai
consolidati per sperimentare nuovi approcci. Il Test Driven Development è
sicuramente l’aspetto più faticoso per me, in tanti piccoli e grandi aspetti,
ma sono profondamente convinto che sia una pratica più che buona per garantire
elevata qualità tecnico funzionale del prodotto e sono pentito di non aver
fatto di più e meglio. Però credo che apprendere la metodologia Agile significhi
anche adattare la metodologia stessa alle esigenze del progetto e quindi
renderla malleabile e “comporla” (o scomporla) a seconda delle necessità.

Il progetto Discitur è un progetto di apprendimento, di prototipi, di
sperimentazioni, un terreno questo che non si sposa bene con il TDD e forzarsi
ad adottare il TDD in maniera talebana non credo potesse essere vincente. E,
alla fine, decidere di applicarlo solo in alcuni contesti, penso sia stato un
approccio…agile.

Però anche questo rafforza in me il concetto che l’Agile richieda molta più
esperienza e pratica per riuscire ad esprimere le sue reali potenzialità. Infatti
l’apertura ad un approccio “libero” richiede una maggiore attenzione e
sensibilità rispetto al “metodo classico” dove i processi sono ben codificati e
definiti. Nella metodologia RUP (in linea teorica) si esegue un processo
secondo le indicazioni, manufatti, template previsti e c’è poco da inventarsi
(o sbagliare) e questo garantisce un recinto “sicuro” all’interno del quale
muoversi. L’agile non mette recinti ma lascia che sia il team a creare il
recinto migliore…tra tutti quelli possibili. 

Mi vengono in mente le parole di Novecento: 

<blockquote>Tu pensa a un pianoforte. I tasti iniziano. I tasti finiscono. <br/>
Tu lo sai che sono 88 e su questo nessuno può fregarti. Non sono infiniti, loro.<br/>
Tu sei infinito, e dentro quegli 88 tasti la musica che puoi fare è infinita. Questo
a me piace. In questo posso vivere. <br/><br/>
Ma se io salgo su quella scaletta, e
davanti a me si srotola una tastiera di milioni di tasti, milioni e miliardi di
tasti, che non finiscono mai, e questa è la verità, che non finiscono mai...
Quella tastiera è infinita.  <br/><br/>

Ma se quella tastiera è infinita allora su quella tastiera non c'è musica
che puoi suonare. E sei seduto sul seggiolino sbagliato: quello è il pianoforte
su cui suona Dio.</blockquote>

 

Ecco, personalmente mi sento un po’ più coraggioso di Novecento e
continuerò ad approfondire, provare e fare pratica, ma il sospetto che Dio
(qualora esista) stia applicando un approccio agile mi viene…

 

In fondo, ad esempio, la Creazione…non era forse un bel progetto in 6
sprint?

 