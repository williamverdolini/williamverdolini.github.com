---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Bootstrap 3 Social Buttons con Angular.js
header: Bootstrap 3 Social Buttons con Angular.js
description: Progetto Discitur,Bootstrap,Social Network,Angular.js
group: Discitur
tags: [Bootstrap,Angular.js,Social Network]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Bootstrap 3 Social Buttons con Angular.js",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-03-16",
  "articleSection" : [ "Bootstrap", "Angular.js", "Social Network"  ],
  "url" : "http://williamverdolini.github.io/2014/03/09/discitur-Bootstrap3_SocialBar"
}
</script>

Tra le features di questo sprint c’era l’inserimento dei social buttons.
L’argomento in se e per se non è particolarmente accattivante, infatti, nella
versione base, si tratta di andare sui vari siti dei social network e
copiare/incollare il codice presentato nella sezione developer. Qualche
esempio:

 

- Facebook: <a href="https://developers.facebook.com/docs/plugins/like-button/" target="_blank">https://developers.facebook.com/docs/plugins/like-button/</a>
- Twitter: <a href="https://about.twitter.com/resources/buttons" target="_blank">https://about.twitter.com/resources/buttons</a>
- Google Plus: <a href="https://developers.google.com/+/web/+1button/" target="_blank">https://developers.google.com/+/web/+1button/</a>

 

Ma, francamente, trovo i pulsanti prefabbricati abbastanza bruttini. E qui
arriva il mio dramma quotidiano. Non sono un grafico web e queste cose mi fanno
impazzire, sto decisamente troppo tempo a torturare i miei css nella speranza
di tirarne fuori qualcosa di decente e la maggior parte delle volte, con scarsi
risultati.

 

E’ in queste occasioni che la rete mi è davvero utile. Soprattutto quando
trovo siti come questo: <a href="http://ostr.io/code/html-social-like-share-buttons-no-javascript.html" target="_blank">http://ostr.io/code/html-social-like-share-buttons-no-javascript.html</a>

 

L’altro aspetto (più interessante) è quello legato alle direttive. Infatti
una bar di social button è un buon candidato a finire in una direttiva, se non
altro per tenere pulito il template della pagina in cui si vuole usare, e,
ovviamente, per modularizzare la propria applicazione. E’ una direttiva
particolarmente facile perché non richiede alcuna interazione con il “mondo
esterno” e può esporre proprietà per ricevere in input i dati necessari allo
sharing sui vari social network.

Il codice completo:

template: <a href="https://github.com/williamverdolini/discitur-web/blob/master/app/modules/common/socialBar.html" target="_blank">https://github.com/williamverdolini/discitur-web/blob/master/app/modules/common/socialBar.html</a>

direttiva: <a href="https://github.com/williamverdolini/discitur-web/blob/master/app/modules/common/socialBarDrv.js" target="_blank">https://github.com/williamverdolini/discitur-web/blob/master/app/modules/common/socialBarDrv.js</a>

 
 