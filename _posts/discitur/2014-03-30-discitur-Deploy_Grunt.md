---
title: "Deploy automatico - Grunt"
excerpt: "Il Progetto Discitur"
header:
    overlay_image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1404&q=80"
    caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: discitur_it
description: Progetto Discitur,Configuration Management,Deploy,Grunt
group: Discitur
tags: [Configuration Management,Deploy,Grunt]
---

<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Deploy automatico: Grunt!",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-03-30",
  "articleSection" : [ "Configuration Management","Deploy","Grunt"  ],
  "url" : "http://williamverdolini.github.io/2014/03/30/discitur-Deploy_Grunt"
}
</script>

Una volta chiusa la prima beta-version, l’aspetto deploy diventa un tema
interessante. In uno scenario enterprise il deploy di un’applicazione è un
aspetto decisamente importante. In molti progetti in cui ho lavorato il
Configuration Management aveva una parte significativa nella gestione del ciclo
di vita del software e, in ultima istanza, nei costi del progetto.

Ci sono davvero scuole di pensiero e metodologie dietro il configuration
management, ma, da sviluppatore software e project manager, gli aspetti che
alla fine più mi premono sono:

- velocizzare le attività di impacchettamento e
     rilascio del software (time-to-market!!)
- automatizzarlo (ho visto troppi ftp manuali
     sbagliati in vita mia…)

Al quarto deploy su github-pages per l’ambiente di test, ero già
stanco…quindi mi son detto che era ora di sfruttare le potenzialità appena
intraviste di Grunt. Non è stato difficile, fondamentalmente Grunt è pensato per
essere modulare e per poter inserire nuove funzionalità all’occorrenza. Al
momento il mio processo di deploy prevede questi step:

1. **clean**: pulizia delle cartelle definite per
     l’ambiente di deploy
2. **concat:css**: concatenazione in unico file dei css
3. **concat:libraries**: concatenazione in un unico file dei js di
     terze parti
4. **concat:app**: concatenazione in un unico file dei js dell’applicazione
5. **cssmin**: minificazione del file css
6. **uglify**: minificazione e compattazione dei file js
7. **copy**: copia dei file da deployare nelle cartelle
     finali dell’ambiente di deploy
8. **htmlbuild**: manipolazione di index.html per linkare i
     css ed i js concatenati/minificati/compattati a seconda dell’ambiente
9. **hashres**: modifica dei riferimenti ai file js e css
     per forzare l’aggiornamento sui client (per evitare il caching delle
     precedenti versioni dei file)

Una versione funzionante si trova sul repository: <a href="https://github.com/williamverdolini/discitur-web/blob/master/Gruntfile.js" target="_blank">https://github.com/williamverdolini/discitur-web/blob/master/Gruntfile.js</a>

Fatto. Duplicare il set di task per il deploy in produzione è altrettanto
semplice ed ora con un clik è possibile eseguire in maniera automatizzata il
deploy dell’applicazioni in test o in produzione senza troppo sforzo.

Ovviamente questi task si possono aggiungere e complicare a piacere; ad es.
mi piacerebbe (in un prossimo futuro) gestire in automatico il clone da una
release specifica di github (passata magari da riga di comando al grunt) e l’ftp
finale verso l’ambiente. Come dicevo prima Grunt nasce per essere modulare e
quindi nulla vieta di agganciare moduli per il <a href="https://github.com/sindresorhus/grunt-shell" target="_blank">lancio di comandi da shell</a>
o di creare proprio moduli custom per le più disparate esigenze.