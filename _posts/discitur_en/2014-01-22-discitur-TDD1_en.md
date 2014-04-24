---
layout: wvpost
title: "Discitur Project"
tagline: Angular.js TDD
header: Angular.js TDD
description: Discitur Project, Tech, Angular.js, TDD
group: Discitur_en
tags: [Angular.js,TDD]
---
{% include JB/setup %}

As a first approach to TDD has not been a success. 
I admit that my story and my experiences have made me misrepresent, confuse and put me in the wrong way several times. 
I had thought that the test instruments offered by Angular.js could afford to enter this world smoothly...it was not so, 
because basically it is not a problem of technology or framework...it is a problem of mindset.

Basically it comes to writing the test first and then the code that satisfies him. 
I'm not used at all to thinking in that way...
in my head I always see the code for the implementation of services, models and UI before...
not test...? test before you do anything ? HOW DO I DO?

In the first sprint TDD was a failure, but I will try again in the second. 
In the middle I will study to try to make it a more familiar thing to me, because I am convinced (and for now is only a belief) 
that the thing actually will work better...we'll see.


In the meantime, take this opportunity to make the point on testing addressed in the first sprint, here's a summary :

- the starting point, in addition to the official documentation Angular, were excellent articles of yearofmoo: 
     <a href="http://www.yearofmoo.com/2013/01/full-spectrum-testing-with-angularjs-and-karma.html" target="blank">http://www.yearofmoo.com/2013/01/full-spectrum-testing-with-angularjs-and-karma.html</a>
     and  <a href="http://www.yearofmoo.com/2013/09/advanced-testing-and-debugging-in-angularjs.html" target="blank">http://www.yearofmoo.com/2013/09/advanced-testing-and-debugging-in-angularjs.html</a>.
     Great great start, but about TDD I was a bit confused by this article <a href="http://www.yearofmoo.com/2013/09/advanced-testing-and-debugging-in-angularjs.html#so-when-do-you-do-your-testing" target="blank">http://www.yearofmoo.com/2013/09/advanced-testing-and-debugging-in-angularjs.html#so-when-do-you-do-your-testing</a>.
     I had assimilated the concept of test-develop-refactor but reading and studying the article had convinced me (quickly!) 
     that this was not the best approach to bring value to the customer immediately: the risk , in fact, is to spend too much time and resources to write 
     tests before creating the true value with the deployable code; besides the fact that refactoring happens it could touch test code too. 
     It is necessary? I'm not sure...I think I 'll try again next sprint giving the test a more design/requirements approach than technical 
     and made ​​only one test at a time without losing too much to write test sets...
     for now the question remains for me: what is the meaning to write test code (even if automated) to test the module dependencies? 
     The errors of the absence of the modules can be seen in run-time or by other e2e test that uses them...
     maybe it's a waste of time to do that kind of test...the same applies to routes (except for cases of exception handling logic or details). 
     In the next sprint will try to define the test with a more design and less tied to the code and then I will see the test (units, e2e , midway) 
     that allows me to write better. 
     Very interesting for novices like me is to read an example from real life: 
     <a href="http://www.objectmentor.com/resources/articles/xpepisode.htm" target="_blank">http://www.objectmentor.com/resources/articles/xpepisode.htm</a>
- For the moment I'm focused on Front-End 
     and Angular. For testing I'm finding satisfaction with the use of: 
    - <a href="http://gruntjs.com/" target="_blank">Grunt</a> for task management. One of the most important task is 
      automatec and continous test throught chanches watching task
    - <a href="http://karma-runner.github.io/0.10/index.html" target="_blank">Karma</a> (for
      unit/midway test) + <a href="http://visionmedia.github.io/mocha/" target="_blank">mocha</a>
      (for assertion library)
    - <a href="https://github.com/angular/protractor" target="_blank">Protractor</a> and its <a href="https://github.com/teerapap/grunt-protractor-runner" target="_blank">Grunt runner</a>) for e2e 
      (veny nice, because it allows to check the Angular scope) + <a href="http://jasmine.github.io/" target="_blank">jasmine</a> (for assertion framework)
    - for test debugging I find karma simpler than protractor, but I have to investigate

 