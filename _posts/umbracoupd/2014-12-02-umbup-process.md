---
title: "The Upgrade Process"
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
tags: [Technology,Umbraco,Prototyping]
---

## Before to start

Before to start it's important to clearly define the goals and the conditions to follow.

Here are my <a href="https://en.wikipedia.org/wiki/Exit-criteria" target="_blank">exit criteria</a>:

1. **Time-box**: 3 weeks to have a complete and working prototype, with a retrospective every week. 
2. **High fidelity prototype**: in this scenario a complete prototype consists in a working Umbraco installation (in the latest release) based on a migrated legacy database and most of customized back-office features verified. So, from prototyping point of view, what I want to reach is an <a href="https://www.svpg.com/high-fidelity-prototypes/" target="_blank">high-fidelity prototype</a>, that could be the starting point for the complete upgrade process.
<span id="off-proc"></span>



## The official Process (and the first failure)

Initially I tried to follow the <a href="https://our.umbraco.org/documentation/Installation/Upgrading/version-specific" target="_blank">official upgrade path described in the Umbraco documentation</a> or in <a href="https://www.blix.co/blog/2014/6/5/follow-the-path-upgrading-umbraco-from-v4-to-v7.aspx" target="_blank">other articles in the web</a>. The process is pretty clear and it consists in a gradual upgrade throughout all the most important releases since the 4.7.1 to 7.1.8. 

But my scenario was a little more complicated, because we had customized a lot of back-office functionalities as:

- admin login
- admin back-office presentation
- rich text editor with new custom buttons
- custom "Insert Macro and parameters" management
- custom data types
- a lot of back-office extensions: navigation tracking, user research, orders research and tracking, and so on...

So, I've spent a day following the documentation and try to upgrade Umbraco from 4.7.1 to 4.7.**2**, but I've realized that there were a lot of comparisons to do (configuration files, database, code), and that these comparisons should be repeated for each upgrade step...

No. Stop! That's _definitely_ not my way.

First failure. And first hard decision: leave down the proven task list and create my own.

## <a href="https://gettingthingsdone.com/" target="_blank">Getting Things Done</a> 

GTD. Good principles always have an acronym!
Out of my mind, my approach was:
<ol>
	<li><b>Manual upgrade of legacy database</b>: to do that I had to compare a legacy database with a "to-be" database, so this task was divided into
		<ol>
			<li><b>Installation of Umbraco</b> latest release from scratch</li>
			<li><b>databases comparison</b>: the comparison was realized thanks to Schema and Data Compare features offered by SQL Server Data Tools (SSDT) integrated in Visual Studio 2013. The goal is to create a SQL script to migrate database schema and data from Umbraco 4.7.1 to the latest release<br/>
						
			<img src="{{ BASE_PATH }}/images/umbracoupd/db_compare.PNG" class="img-rounded" />
			
			</li>
		</ol>
	</li>
	<li><b>Software merge</b>, that consists of
		<ol>
			<li>check and merge of <b>web.config and other config files</b></li>
			<li>check and merge of <b>customized legacy code</b> upon the new Umbraco codebase</li>
		</ol>
	</li>
</ol>

I've made a <a href="https://trello.com/" target="_blank">Trello Board</a> so that I can always visualize my list and see where I am and I've started documenting almost everything I did. <br/>
That is **important** for me, because I’ve to do a lot of context and task switching during the week and having a clear situation to see, allow me to unload my mind of remembering what I was doing and how.

So...let's prototype.


