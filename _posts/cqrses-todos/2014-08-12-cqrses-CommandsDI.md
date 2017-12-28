---
title: "Command Handling via Dependency Injection"
excerpt: "CQRS+ES Todo List"
header:
    overlay_image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1350&q=80"
    caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
toc: false
toc_label: "Contents"
author_profile: false
sidebar:
  nav: cqrses
description: CQRS, ES, Command Query Responsibility Segregation, Tech, Dependency Injection, Inversion of Control, IoC, Castle Windsor
group: CQRS_ES_Todos
categories: CQRS
tags:
  - gallery
  - Post Formats
  - tiled
---

What is the purpose of the Dependency Injection? 

<blockquote> <i>Dependency Injection enables loose coupling, and loose coupling makes code more maintainable</i>
<h6>Mark Seeman</h6></blockquote>

The purposes of the DI (maintainability and extensibility) are among the purposes for which anyone should strive to achieve the mission of realize software products. I speak of software products, rather than software development projects, in fact, in my experience I've worked with several software-house that had as its mission the creation of web or desktop application, but did not have the habit, nor 'approach to work having among its objectives, high maintainability and extensibility of the code...
The effect? Both re-factoring and sleepless nights just to understand what the code wants to do...I guess I could write a nice collection of "bad programming and design practices" on the subject (maybe one day...).

In my "new" experience of "backing in the front line" of the creation of software products I rediscovered the need (and the undoubted pleasure) to continuously study design and software technologies, if only to understand what the trend of the period is, and (importantly) why. Having a rich toolbox is a prerequisite for anyone who wants to make a product; and for whom develop software, this means constantly studying design patterns and their applications and to identify which technologies/libraries or frameworks may work better in different areas. 
With this spirit I threw myself into the world of CQRS+ES. 
And in this dive was natural to run into issues of Dependency Injection (DI) and Inversion of Control (IoC). It was a kind of revelation! Or rather, I realized that in the creation of the products that I was helping to make this concept/design was always present, but I had never used a structured library to do it (and this is not a problem by itself). 

The real problem is that if you have a small team that deals with the product’s architecture and there is no knowledge you are likely to achieve “naïve” solutions, good into the intention, but sometimes not satisfactory or not fully meet the requirements of decoupling and maintainability. 
The use of open source framework and widely used libraries not only guarantees the stability of the solution, but also a huge range of applications and a much better quality of the solution. 

<blockquote> <i>"Make or Buy"? Definitely Buy!</i>
<h6>Andrea Saltarello</h6></blockquote>

Among the libraries that are definitely leaders for Inversion of Control (IoC) in the .NET framework there is <a href="http://docs.castleproject.org/Windsor.MainPage.ashx" target="_blank">Castle.Windsor</a>.
