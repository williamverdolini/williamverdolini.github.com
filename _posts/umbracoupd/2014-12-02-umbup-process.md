---
layout: wvpost
title: "Umbraco Upgrade"
tagline: The Upgrade Process
header: The Upgrade Process
description: Umbraco, Prototyping, Tech
group: Umbraco_Update
tags: [Technology,Umbraco]
---
{% include JB/setup %}

###Before to start

Before to start it's important to clearly define the goals and the conditions to follow.

Here are my <a href="http://en.wikipedia.org/wiki/Exit-criteria" target="_blank">exit criteria</a>:

1. **Time-box**: 3 weeks to have a complete and working prototype, with a retrospective every week. 
2. **High fidelity prototype**: in this scenario a complete prototype consists in a working Umbraco installation (in the latest release) based on a migrated legacy database and most of customized back-office features verified. So, from prototyping point of view, what I want to reach is an <a href="http://www.svpg.com/high-fidelity-prototypes/" target="_blank">high-fidelity prototype</a>, that could be the starting point for the complete upgrade process.

We have a web app application that has developed upon <a href="http://umbraco.com/products/umbraco-cms" target="_blank">Umbraco CMS</a>. Umbraco is a very flexible and good CMS we have chosen some years ago because:

-	It’s in .NET framework: our land.
-	It’s flexible and extensible: it allows us to add custom functionalities using pluggable (familiar) .NET user control
-	We wanted to focus on business functionalities, without spending too much time/money developing some trasversal aspects (user/account management, content management, back-office features, etc). Umbraco has them out of the box.
-	It’s open-source. That allows us to customize even core functionalities if we need it.
-	It has a good and live community.
-	It has a lot of downloadable plugins for CMS (that is not our core business)

The first stable release of our web application was delivered on january 2013. It was on Umbraco version 4.7.1.
During this period, we focused just on business functionalities, in order to give to our customers the most competitive features, but in the meanwhile Umbraco has grown and has added some important features, first of all the abilities to use <a href="http://www.asp.net/mvc" target="_blank">AspNet.MVC framework</a>.
Now it’s time to upgrade to the latest Umbraco release.
The following articles describe the prototyping steps that allowed me to upgrade and jump from version 4.7.1 to 6.2.4.
Not without some obstacle and failure.
And in these articles I wanted to highlight some principles concretely used during this prototype. 

_Because prototyping is an hard discipline_.


###The official Process (and the first failure)

Initially I tried to follow the <a href="http://our.umbraco.org/documentation/Installation/Upgrading/version-specific" target="_blank">official upgrade path described in the Umbraco documentation</a> or in <a href="http://www.blix.co/blog/2014/6/5/follow-the-path-upgrading-umbraco-from-v4-to-v7.aspx" target="_blank">other articles in the web</a>. The process is pretty clear and it consists in a gradual upgrade throughout all the most important releases since the 4.7.1 to 7.1.8. 

But my scenario was a little more complicated, because we had customized a lot of back-office functionalities as:

- admin login
- admin back-office presentation
- rich text editor with new custom buttons
- custom "Insert Macro and parameters" management
- custom data types
- a lot of back-office extensions: navigation tracking, user research, orders research and tracking, and so on...

So, I've spent a day following the documentation and try to upgrade Umbraco from 4.7.1 to 4.7.2, but I've realized that there were a lot of comparisons to do (configuration files, database, code), and that these comparisons should be repeated for each upgrade step...

No. Stop! That's _definitely_ not my way.

First failure. And first hard decision: leave down the proven task list and create my own.

###<a href="http://gettingthingsdone.com/" target="_blank">Getting Things Done</a> 

GTD. Good principles always have an acronym!
Out of my mind, my approach was:
<ol>
	<li><b>Manual upgrade of legacy database</b>: to do that I had to compare a legacy database with a "to-be" database, so this task was divided into
		<ol>
			<li><b>Installation of Umbraco</b> latest release from scratch</li>
			<li><b>databases comparison</b>: the comparison was realized thanks to Schema and Data Compare features offered by SQL Server Data Tools (SSDT) integrated in Visual Studio 2013. The goal is to create a SQL script to migratedatabase schema and data from Umbraco 4.7.1 to the latest release<br/>
						
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

so...let's protype.


