---
title: "Bower Update"
excerpt: "Il Progetto Discitur"
header:
    overlay_image: "/assets/images/neonbrand-426918.jpg"
    caption: "Photo by NeONBRAND on [**Unsplash**](https://unsplash.com/photos/zFSo6bnZJTw)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: discitur_it
description: Progetto Discitur,Tech,Bower,Configuration Management
group: Discitur
tags: [Bower,Configuration Management]
---

<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Authentication,Routing",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-03-09",
  "articleSection" : [ "Bower", "Configuration Management" ],
  "url" : "https://williamverdolini.github.io/2014/03/09/discitur-Bower_update"
}
</script>

Nel cercare di risolvere il <a href="http://stackoverflow.com/questions/15888162/angularjs-http-error-function-never-called" target="_blank">problema della gestione dello statuscode nelle chiamate WebApi</a>,  ho provveduto a fare un aggiornamento delle
dipendenze tramite bower (nella disperata speranza che aggiornare le release
angular portasse qualche miglioramento). Quello che ho fatto può
tranquillamente annoverarsi tra le worst-practices del Configuration
Management, quindi, siccome sbagliando (ma nel mio caso posso tranquillamente
dire, perseverando) si impara, ecco cosa è successo.
 

### bower update (bad practice #1)

Questo il comando lanciato con molto candore alle due di notte di un
venerdì qualunque…cosa è successo? Bower ha fatto “semplicemente” quello che
gli ho chiesto, cioè ha aggiornato le mie dipendenze secondo le regole
specificate. L’effetto? Ho avuto una regressione nella visualizzazione di tutte
le mie view Angular!!! AAAAARRGGHHHHH…..

_Lesson learned_:

MAI aggiornare massivamente tutti i componenti se non si è consci al 100%
di cosa avverrà. Nel dubbio aggiornare un componente alla volta e lanciare i
propri smoke tests (o per lo meno fare dei test di non regressione) per
verificare che tutto sia ok.

### packages versioning (bad practice #2)

Nel versionamento del progetto, ho fatto la scelta di versionare il file
delle regole di dipendenza (bower.json), ma NON versionare i packages
scaricati. Ritenevo inutile fare un versionamento di componenti che possono
essere ricreati con un click ogni volta…peccato che il mio file di versionamento
sia una cosa del genere:

```js
{
  "name": "mag14",
  "version": "0.0.0",
  "dependencies": {
    "angular": "~1.2.0",
    "json3": "~3.2.4",
    "es5-shim": "~2.1.0",
    "jquery": "~1.10.2",
    "sass-bootstrap": "~3.0.0",
    "angular-resource": "~1.2.0",
    "angular-cookies": "~1.2.0",
    "angular-sanitize": "~1.2.0",
    "angular-route": "~1.2.0",
    "angular-ui-router":"latest",
    "requirejs": "2.1.9",
    "bootstrap":"3.0.3",
    "angular-bootstrap": "0.10.0",
    "angular-ui-tinymce": "latest"
  },
  "devDependencies": {
    "angular-mocks": "~1.2.0",
    "angular-scenario": "~1.2.0"
  }
}
```


Cosa che c’è che non va? Niente, a parte il fatto che le seguenti sintassi
vanno esaminate con attenzione:

- "~" : la tilde indica a bower di
     prendere tutte le fix uscite all’interno della minor release specificata 
- "latest" : indica a bower di prendere l’ultima release stabile

 

_Lesson learned_:

versionare anche i packages o, in alternativa, definire in maniera statica
le dipendenze (ovvero senza latest, tilde, ecc..), in modo da essere sicuri di
poter ripristinare velocemente situazioni…complicate…

### breaking changes (bad practice #3)

Dopo diversi tentativi di ripristinare i packages allo stato originale ed
aggiornando uno alla volta i package ho scoperto che il problema l’avevo sul
package  angular-ui-router, che, manco a dirlo, era a latest.

Però, approfondendo, ho scoperto che l’aggiornamento mi aveva portato dalla
versione 0.2.7 alla 0.2.8, che, nella mia testa, significa aver aggiornato alla
versione con più fix, ma senza breaking changes…

In realtà, leggendo le <a href="https://github.com/angular-ui/ui-router/releases/tag/0.2.8" target="_blank">release notes</a>
e <a href="https://github.com/angular-ui/ui-router/issues/787" target="_blank">qualche post di disgraziati come me</a>…ho capito come fixare l’applicazione mantenendo
l’ultimo aggiornamento del package.

Secondo me, non è corretto come il team di angular-ui-router ha taggato la
release, poiché, se non si mantiene una backward compatibility, almeno la minor
release dovrebbe cambiare…anche se le regole del <a href="http://semver.org/" target="_blank">Semantic Versioning</a> sono anche più rigide:

1. MAJOR version when you make incompatible API changes,
2. MINOR version when you add functionality in a
     backwards-compatible manner, and
3. PATCH version when you make backwards-compatible bug fixes.

_Lesson learned_:

Non ci affidiamo cecamente al fatto che, in generale, codice di terze parti
sia sempre fatto alla perfezione, ma invece prendiamo le precauzioni del caso
(ad es. quelle descritte ai punti precedenti) per evitare di perdere troppo
tempo in cose inutili.