---
title: "Discitur Project"
tagline: automatic Deploy - Grunt!
header: automatic Deploy - Grunt
description: Discitur Project,Configuration Management,Deploy,Grunt
group: Discitur_en
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
  "url" : "https://williamverdolini.github.io/2014/03/30/discitur-Deploy_Grunt_en"
}
</script>

 

After closing the first beta-version, the deployment aspect becomes an interesting theme. In a enterprise scenario, the deployment of an application is a very important aspect. In many projects where I worked the Configuration Management had a significant part in the management of software development and, ultimately, in the cost of the project.

There really are schools of thought and methodologies behind the configuration management, but, as a software developer and project manager, aspects of which I care most are:

- speed up the activities of packaging and software release (time-to-market !!)
- automate it (I have seen too many wrong manual ftp in my life ...)
 

The fourth deploy on github-pages for the test environment, I was already so tired ... I said it was time to exploit the potential of Grunt. It was not difficult, basically Grunt is designed to be modular and to add new functionality as needed. At the moment my deployment process involves these steps:

clean: clean-defined folders for the environment deployment
concat: css: concatenation in single file of css
concat: libraries: concatenation in a single file js third party
concat: app: concatenation in a single file js application
cssmin: minificazione file css
uglify: minificazione and compacting files js
Copy: copy the files from the folders deployare final deployment environment
htmlbuild: manipulation of index.html to link the css and js concatenated / minificati / compacted depending on the environment
hashres: changing references to js and css file to force the update on the client (to prevent caching of earlier versions of files)

1. **clean**: clean the defined folders for the environment deployment
2. **concat:css**: concatenation of css files in a single file
3. **concat:libraries**: concatenation of the third party .js in a single file
4. **concat:app**: concatenation of js application in a single file 
5. **cssmin**: css minification
6. **uglify**: js bundling and minification
7. **copy**: copy the files to deploy into the final folders
8. **htmlbuild**: manipulation of index.html to link the (concatenated / minificated / compacted ) css and js depending on the environment 
9. **hashres**: changing references to js and css file to force the update on the client (to prevent caching of earlier versions of files)

 
 

You can find a working Grunt configuration file in the repository: <a href="https://github.com/williamverdolini/discitur-web/blob/master/Gruntfile.js" target="_blank">https://github.com/williamverdolini/discitur-web/blob/master/Gruntfile.js</a>

Done. Duplicate the tahk set for deployment in production is just as simple, and now with a click you can perform an automated deployment to the Application in test or production without too much effort.

 

Obviously these tasks can be added made more complex as you want; eg. I would like (in the near future) automatically manage the clone from a specific release of github (maybe passed from the command line to grunt) and ftp final to the environment. As I said before Grunt is designed to be modular, so nothing prevents you from attaching modules to <a href="https://github.com/sindresorhus/grunt-shell" target="_blank">launch shell commands</a> or create their own custom modules for many different needs.	