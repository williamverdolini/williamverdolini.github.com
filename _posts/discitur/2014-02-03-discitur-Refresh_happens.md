---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Refresh Happens...(Angular.js Authentication)
header: Refresh Happens
description: Progetto Discitur,Tech,Angular.js,Login,Authentication,Autenticazione,token,localstorage
group: Discitur
tags: [Angular.js,Authentication]
---
{% include JB/setup %}
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
  "url" : "http://williamverdolini.github.io/2014/02/03/discitur-Refresh_happens/"
}
</script>


Uno dei diversi aspetti che girano attorno al tema Autenticazione nelle SPA
è quello relativo alla gestione del Page Reload, ovvero mantenere viva la
“sessione autenticata”, anche a seguito di un reload della pagina. Un breve
cenno su come è stata gestita l’autenticazione. Questi gli step:

 

1. Servizio angular di autenticazione chiamato
     dalle varie form di login ([#1](https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L14))
2. il metodo login chiama un servizio API con
     accesso NON autenticato che verifica Username/Password. Per gestire i temi
     di sicurezza sarebbe preferibile utilizzare un protocollo HTTPS. ([#2](https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L69))
3. Se i dati passano il controllo il servizio
     restituisce un token criptato, che contiene informazioni sull’account e
     sul periodo di validata del token stesso ([#3](https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L93))
4. il token viene salvato nella localStorage ([#4](https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L47))
5. nella callback della login viene chiamato un
     servizio API con accesso autenticato per recuperare/completare le
     informazioni sull’utente ([#5](https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L95))
6. la chiamata (in realtà ogni chiamata) passa
     attraverso un interceptor che setta l’header per la gestione della
     chiamata autenticata, se presente il token di autenticazione ([#6](https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L198))
7. il servizio API, se il token è valido,
     restituisce i dati richiesti, altrimenti restituisce una risposta 401
     (risorsa Non Autorizzata) ed il token viene rimosso dalla localStorage ([#7](https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L156))
8. se la richiesta dà esito ok, i dati
     dell’utente sono recuperati e si aggiorna l’oggetto “user” del servizio di
     autenticazione, che è controllato nell’applicazione ovunque serva gestire
     logiche legate alla sessione autenticata ([#8](https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L151))

 

Se si fa un reload della pagina (o si chiude il browser e lo si riapre dopo
qualche giorno sull’applicazione), in fase di inizializzazione del servizio di
autenticazione si ricerca la presenza del token di autenticazione e, se presente,
si chiama il servizio per il recupero delle informazioni dell’utente,
ricollegandosi al punto 6 dell’elenco precedente. Un estratto saliente del
servizio è questa:




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

Il codice completo è su github: [https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js](https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js)

 

La gestione è lineare e chiara dal mio punto di vista. L’unico aspetto che
non sono riuscito a chiarirmi in rete è quello relativo alla gestione delle
callback del servizio $http del core angular. La cosa che ho riscontrato è che
sebbene il servizio REST restituisca uno status 401, il servizio $http chiama
la success callback…mentre mi sarei aspettato avesse richiamato la error
callback. La [documentazione
ufficiale](http://docs.angularjs.org/api/ng.$http) mi pare mi dia ragione…ma non ho trovato grossi riscontri a
questa segnalazione in rete…qualcuno mi può illuminare?

[https://github.com/angular/angular.js/issues/2609](https://github.com/angular/angular.js/issues/2609)