---
layout: wvpost
title: "Discitur Project"
tagline: Test, FE/BE separation…Static/Dynamic Content
header: Test, FE/BE separation…Static/Dynamic Content
description: Discitur Project, Tech, Angular.js
group: Discitur_en
tags: [Angular.js,Software Design]
---
{% include JB/setup %}

In the title is everything (but really everything), but in fact that's the mental journey that I have done to arrive at the conclusions shown in this article. 
The findings, from the technical point of view, they are not anything special, but I find it interesting to follow the process because I think it is quite common and, 
therefore, a good example of how the technical, architectural and processual topics are closely inter-related. 


All comes from my desire to make a real TDD for the sprint 2. 
So I forced myself to start from the creation of test cases for the implementation of the search service and to do this, 
with the experience gained in the first sprint, the my intention was to use the "Grunt-Karma" team, I found effective in terms of configuration environment, speed of execution and debugging.

At this point I found myself faced with a very simple configuration problem of local environments. 
REST services and the Back-End in general are built on Microsoft technologies (WebAPI 2.0, Entity Framework 6, SQL Server), 
and for the development and debugging services launch an IIS Express (integrated with Visual Studio). 
Grunt + Karma are configured to run on the Connect server (HTTP server for <a href="http://www.nodejs.org" target="_blank">node.js</a>). 
My intention was to develop the test cases (for Front-End) and after that develop what is necessary 
(possibly also for the Back-End, in terms of E2E test). 
Surely I could expect to achieve the necessary mock, but as a first TDD experiment, I wanted a "full stack" solution that allowed me 
to see the power of the approach. So I decided to work with both servers active:

- IIS Express for debugging / development wep API 
- Connect to the testing and development of services and Controller Angular
 

In doing so, I made an observation:

- Connect will serve only static content (js, html, css...). Basically the Angular part
- IIS Express will serve the "dynamic" content or, better, the server side code



At this point I came up with the concept (of design and performance tuning) to serve static content from a web server 
and dynamic content from a different one. A good read on the subject: <a href="http://www.webforefront.com/performance/webservers_statictier.html" target="_blank"> http://www.webforefront.com/performance/webservers_statictier.html </a> 



In my case the "dynamic" concept is used in terms a bit 'improper... 
However, the concept is that if I want to use Microsoft technologies that run on IIS. I'm not necessarily bound to use IIS to serve "static" content 
provided by Angular . To do this I used Angular application constants to store apiURL used on all calls via $http and $resource. 
This code:
 

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

angular.module("Discitur", [])
    .constant('DisciturSettings', {
        apiUrl: 'http://localhost:59739/api/'
    });

]]></script> 

and on the service call:

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

$http.get(DisciturSettings.apiUrl + 'lesson/' + inputParams.id)

]]></script> 

Really fast, but I think the result is very flexible. 
What to configure on the production environment is at this point a choice that can not be done by evaluating the software aspect, 
but just the Environment Configuration Management. 
Oh, I forgot...for my purpose (testing on Grunt Connect and Back-End on IIS), it works great!
