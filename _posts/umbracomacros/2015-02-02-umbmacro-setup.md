---
title: "Setup"
excerpt: "Umbraco Custom Macros"
header:
    overlay_image: "/assets/images/hans-peter-gauster-252751.jpg"
    overlay_filter: 0.4
    caption: "Photo by Hans-Peter Gauster on [**Unsplash**](https://unsplash.com/photos/3y1zF4hIPCg)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: umbraco
description: Umbraco, Prototyping, Tech
group: Umbraco_CustomMacros
tags: [Technology,Umbraco]
---

I've already explained <a href="/2014/12/01/umbup-intro" target="_blank">why we choose Umbraco</a> as our core framework.
Recently we have <a href="{{ BASE_PATH }}/Umbraco-Upgrade.html" target="_blank">migrated from 4.7.1 to 6.2.4</a> and we started also a migration from WebForms framework to MVC. Our main goals were Design (aka Quality) and Performance.

### Disclaimer
In the next articles I'll show some basic components of a modular architecture built upon Umbraco framework. What I'll share is not code for production
environment, because some very important aspect - especially for a configurable product - is missing, like:

- form validation
- macro's unique IDs management
- command's configurability
- command's consuming rules management ("who listens who")
- internationalization
- and much others

But, anyway, I think that the approach described in the following articles will be clear and easily applicable.
As always, any suggestions are welcome.

### Set-up
Before to start, some steps in order to make working the <a href="https://github.com/williamverdolini/Umbraco-CustomMacros" target="_blank">shared code</a>.

1. Download or fork <a href="https://github.com/williamverdolini/Umbraco-CustomMacros" target="_blank">the repository</a>.
2. Build and run. The web.config is setup in order to launch Umbraco Installer for a fresh new Umbraco application
3. follow the standard Installation Wizard. The project is tested on MS SQL Server 2008 R2 (but I don't see problems if you use some later version).
4. At the last step of wizard choose to NOT install a starter kit
5. You're done

Go to the root page and have fun!

_I know...another "To-Do List application"..._, but that's not the point! :)

If you open the Umbraco back-office panel you'll see my sample pages already configured. In the next articles I'll go deeper into these configurations.