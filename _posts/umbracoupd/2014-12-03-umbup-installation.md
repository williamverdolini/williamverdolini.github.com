---
title: "Umbraco Installation"
excerpt: "Umbraco Upgrade"
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
group: Umbraco_Update
tags: [Technology,Umbraco]
---

I order to have a "to-be" database to compare with, I've made a basic Umbraco installation from scratch.
here are the steps done:

1. I've downloaded the <a href="http://our.umbraco.org/download" target="_blank">Umbraco latest release</a> (.zip)
2. I've unzipped Umbraco release in a local folder. For simplicity I've created an "umbraco_original" folder, that I've used also as backup of original code
3. I've created a new database on SQL Server 2008 R2
4. I've created a new Empty Web Project (.NET 4.5) in Visual Studio <br/><br/>			
			<img src="{{ BASE_PATH }}/images/umbracoupd/vsproject.png" class="img-rounded" style="width: 100%; height:100%" /><br/><br/>
			<img src="{{ BASE_PATH }}/images/umbracoupd/vsproject-2.png" class="img-rounded" style="width: 100%; height:100%" />
5. I've copied all the content of umbraco_original folder under my project root folder
6. I've included files and folders to my project<br>
			<img src="{{ BASE_PATH }}/images/umbracoupd/vsproject-3.png" class="img-rounded" />
7. I've modified <b>web.config</b> to point my new database instance
8. I've compiled solution and run (F5)
9. The first run opened the installer that I've followed till the end, creating a new working application and database

```
<connectionStrings>
	<remove name="umbracoDbDSN"/>
	<add name="umbracoDbDSN" connectionString="server=yourserver;database=yourdb;user id=useradmin;password=password" providerName="System.Data.SqlClient" />
</connectionStrings>
```


That's all. 

Very easy, but, anyway, I've documented it, because it costed less than remembering it every time I needed to recreate original installation.

And I didn't want to waste my time in so simple (and with low value) tasks. 
So, my lesson learned (in previous experiences) is **document everything** in this kind of prototyping. 

It's cheaper than not doing it.