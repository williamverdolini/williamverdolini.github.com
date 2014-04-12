---
layout: wvpost
title: "Discitur Project"
tagline: Product Backlog
header: Product Backlog
description: Discitur Project, Product Backlog, Metodology, Scrum, Agile
group: Discitur_en
tags: [Agile]
---
{% include JB/setup %}

The product <a href="http://en.wikipedia.org/wiki/Scrum_(software_development)#Product_backlog" target="_blank">Backlog</a>
used has various fields. Those are the more useful:

<h6>
<table class="table">
  <thead>
    <tr>
      <th><b>ID</b></th>
      <th><b>Title</b></th>
      <th><b>User Story</b></th>
      <th><b>Description<br>(Tasks)</b></th>
      <th><b>Imp.</b></th>
      <th><b>Estimate<br>s.p.</b></th>
      <th><b>How to Test</b></th>
      <th><b>Notes</b></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td><b>Login</b></td>
      <td>As a teacher I would like to 
   logging me in order to avoid having to re-enter data each time my 
   profile (materials, school type)</td>
      <td>1) Feature to insert username/password   
       <br>
  2) service to check data 
       <br>
  3) Insertion on cache of autenthication token
</td>
      <td>5</td>
      <td>2</td>
      <td>You enter  
         wrong data and verify that the system does not allow access to  
         personal data
      
         They fit right data and access to the personal data, which are 
         cases, personal data collected in registration</td>
            <td>It serves to verify the password encryption and to manage safe navigation subsequently
      </td>
    </tr>

    <tr>
      <td>2</td>
      <td><b>Personal data management</b></td>
      <td>As a teacher I wish I could change my personal information in order to update the materials and for security update password</td>
      <td>possibility of 
   display the collected data in recording and ability to edit password, etc.</td>
      <td>2</td>
      <td>2</td>
      <td>do Login, enter on personal data area, check the data ...</td>
      <td>subsequently manage secure navigation</td>
    </tr>

    <tr>
      <td>3</td>
      <td><b>Sign up</b></td>
      <td>as a teacher I would like to sign up so you do not have to repeat my data continuously and receive updates via email for new lessons included</td>
      <td>1) UI for entering credentials, with checks password strength (with confirmation),
      email (== username), name, surname, role, 
      disciplines...
      <br>
  2) service and DB for data persistence. Verify the uniqueness of the account
    <br>
  3) to provide tag the lesson</td>
      <td>3</td>
      <td>4</td>
      <td></td>
      <td>Initially can be entered accounts manually</td>
    </tr>




  </tbody>
</table> 
</h6>

- **ID**: unique indentifier. Sharing with other teams, via mail, it's always better to refer to an ID 
- **Title**: user story name, feature name
- **User Story**: one of the aspects of <a href="http://en.wikipedia.org/wiki/Scrum_(software_development)" target="_blank">SCRUM</a>. It's described in the for of
     “as &lt;user&gt; I want to &lt;feature&gt; in order to gain this &lt;value&gt;”. It may seem redundant (and sometimes it is), 
     but never underestimate its importance: it is essential to think in terms of value to the user 
end it is important to understand if that is precisely the value it brings to the user, 
it is important to understand the priorities, it is important to 
improve their understanding in terms of functional detail. Consider, for example, Sign Up Story in the previous example, surely the 
task-list extracted would not be the same without the user story
- **Description (Tasks)**: the division into components and tasks to be carried out of the user 
story. It's bread for developers, it is prepared by the technical department as a result 
of discussions with the<a href="http://en.wikipedia.org/wiki/Scrum_(software_development)#Product_Owner" target="_blank">Product Owner</a>. 
- **Importance**: two key features: 
     - More than the number is higher, the user story is important for the user 
     - There may be NOT two user stories with the same importance. also when the user story which look similar should be intensified among the two is more important

- **Estimate (<a href="http://agilefaq.wordpress.com/2007/11/13/what-is-a-story-point/" target="_blank">Story point</a>)**: 
The estimate in story point. Assume a story point as a day/man (ie 8 hours fully dedicated to the activity). 
I find it effective to split the estimate in more detailed estimates, ie dedicated to UI, services, 
data structures, testing, refactoring. I am missing a team to make poker planning ...
- **How to Test**: for my desire to TDD is very important; in general is a way to focus in advance aspects which serve to better detailed functional requirements. 
- **Notes**: of any kind, especially tecnical. Even in this case it serves to better clarify the scope of activities.

 

In these fields, add fields linked to the state, the sprint they have in common and, in general, any other field could simplify a grouping of user stories.