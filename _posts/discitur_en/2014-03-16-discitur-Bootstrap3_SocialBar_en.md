---
title: "Discitur Project"
tagline: Bootstrap 3 Social Buttons with Angular.js
header: Bootstrap 3 Social Buttons with Angular.js
description: Discitur Project,Bootstrap,Social Network,Angular.js
group: Discitur_en
tags: [Bootstrap,Angular.js,Social Network]
---

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
  "url" : "https://williamverdolini.github.io/2014/03/09/discitur-Bootstrap3_SocialBar_en"
}
</script>

Among the features of this sprint was the inclusion of social buttons. The argument is not particularly attractive, in fact, the basic version, it comes to going on the various social networking sites and copy / paste the code presented in the developer. Some examples:
 

- Facebook: <a href="https://developers.facebook.com/docs/plugins/like-button/" target="_blank">https://developers.facebook.com/docs/plugins/like-button/</a>
- Twitter: <a href="https://about.twitter.com/resources/buttons" target="_blank">https://about.twitter.com/resources/buttons</a>
- Google Plus: <a href="https://developers.google.com/+/web/+1button/" target="_blank">https://developers.google.com/+/web/+1button/</a>

 

But, frankly, I find the buttons prefabricated pretty ugly. And here comes my daily drama. I'm not a deb designer and these things make me crazy, I'm much too long to torture my css hoping to pull out something decent and most of the time, with poor results.

 

It's on these occasions that the web is really helpful to me. Especially when I find sites like this: <a href="http://ostr.io/code/html-social-like-share-buttons-no-javascript.html" target="_blank">http://ostr.io/code/html-social-like-share-buttons-no-javascript.html</a>

 

The other (more interesting) topic is linked with the directives. In fact a social button bar is a good candidate to end up in a directive, if only to keep clean the template of the page where you want to use, and, of course, to modularize your application. It's a particularly easy directive because it requires no interaction with the "outside world" and can expose properties to receive input data necessary for sharing on various social networks.

The complete code:

template: <a href="https://github.com/williamverdolini/discitur-web/blob/master/app/modules/common/socialBar.html" target="_blank">https://github.com/williamverdolini/discitur-web/blob/master/app/modules/common/socialBar.html</a>

directive: <a href="https://github.com/williamverdolini/discitur-web/blob/master/app/modules/common/socialBarDrv.js" target="_blank">https://github.com/williamverdolini/discitur-web/blob/master/app/modules/common/socialBarDrv.js</a>

 
 