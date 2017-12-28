---
title: "Discitur Project"
tagline: Refresh Happens...(Angular.js Authentication)
header: Refresh Happens
description: Discitur Project,Tech,Angular.js,Login,Authentication,token,localstorage
group: Discitur_en
tags: [Angular.js,Authentication]
---

<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Refresh Happens (Angular.js Authentication)",
  "author" : {
    "@type" : "Person",
    "name" : "William Verdolini"
  },
  "datePublished" : "2014-02-03",
  "articleSection" : [ "Authentication", "Angular.js", "Login", "token" ],
  "url" : "http://williamverdolini.github.io/2014/02/03/discitur-Refresh_happens_en/"
}
</script>


One of the aspect you have to face in a SPA Authentication is the Page Reload management, that's how to keep the "authenticaed session" alive even during
the page reload. Following are the steps used in my implementation:

 

1. angular authentcation service called from different login forms (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L14" target="_blank">#1</a>)
2. the login method calls an "anonimous" (not authorized) API service which check for Username/Password. For security reasons it could be preferable to use HTTPS protocol. (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L69" target="_blank">#2</a>)
3. If data pass the account validation check, the service returns an encrypted token that contains account and validation period information (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L93" target="_blank">#3</a>)
4. the token is saved in localStorage (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L45" target="_blank">#4</a>)
5. in the login service callback it's called an authenticated back-end service to get/complete user data (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L95" target="_blank">#5</a>)
6. the call passes through an interceptor that sets the header for the management of authenticated calls, if this authentication token exixts (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L210" target="_blank">#6</a>)
7. the service, if token is valid, returns the requested data, otherwise it returns a 401 response (Not Authorized resource) and the token is removed from the localStorage(<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L157" target="_blank">#7</a>)
8. if the request is successful, the user data is retrieved and update the "user" object of the authentication service, which is controlled in the application anywhere you want to manage the logic related to the authenticated session (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L152" target="_blank">#8</a>)

 
If you reload the page (or you close the browser and reopen it after a few days on the application), 
initializing the authentication service check for the existance of the authentication token and, if exists, call the service for retrieving 
user information, linking in step 6 of the previous list. An highlight of this service is:



<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
    .factory('AuthService', [
        '...',
        function (...) {
            //-------- private methods -------
            var _getUserInfo = function () {
                _authService.getUserInfo().then(
                    function (successData) {
                        _authService.user = successData;
                    },
                    function (errorData) {
                        // do something...
                    })
            }
            var _authService = {
                //-------- public properties-------
                user: ...,
                //-------- public methods-------
                getUserInfo: function () {
                    DiscUtil.validateInput('UserService.userInfo', {}, arguments);
                    // create deferring result
                    var deferred = $q.defer();
                    // Retrieve Async data CurrentUser        
                    $http.get(DisciturSettings.apiUrl + 'Account/UserInfo')
                        .success(function (result, status) {...})
                        .error(function (error, status) {...});
                    return deferred.promise;
                }
            }

            //-------- Singleton Initialization -------
            // get security token from local storage
            var _token = localStorage.getItem(DisciturSettings.authToken);
            if (_token) {
                _getUserInfo();
            }

            return _authService;
        }
    ])

]]></script> 

The complete code is on github: <a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js" target="_blank">https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js</a>

 
The management is straightforward and clear from my point of view. 
The only aspect that I was not able to clarify is related to the management of $http service's callback (core angular). 
The thing I found was that although the REST service returns a status 401, $http service calls the success callback...
while I would have expected had called the error callback. The <a href="http://docs.angularjs.org/api/ng.$http" target="_blank">official documentation</a> seems to me to give me reason...
but I did not find major findings in this report on the net ... someone can enlighten me?



**Update**

The problem of callback was becoming more frequent and I then had to deal with, stopping the rest. 
I did a lot of research to see if others had had similar problems and the first step to do in this kind of problems is <a href="http://stackoverflow.com/" target="_blank">Stackoverflow</a>.

I was doubly unlucky, because yes, I found a <a href="http://stackoverflow.com/questions/15888162/angularjs-http-error-function-never-called" target="_blank">post expressing my exact same problem</a>, too bad that the solutions proposed had nothing to do with mine... Effect? 
Nearly a week of ("useless") discussions on the operation of IIS, about the HTTP standard, about .Net WebAPI.

The problem was that <a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/main/DisciturApp.js#L119" target="_blank">I was wrong in using a intercpetor Angular.js</a>.

Techniques for Problem Solving deserve a separate article (or maybe books...), but the thing I learned from this experience is to remain lucid and critical 
about what is really happening in the system without being distracted (too much) by forum post. It is not easy...especially for one who is "Stackoverflow-addicted" like me.

Open and debug Angular.js is quite educational, but it makes me seasick... so I added <a href="http://stackoverflow.com/a/22425383/3316654" target="_blank">my own little contribution to the Stackoverflow community</a>.  
  