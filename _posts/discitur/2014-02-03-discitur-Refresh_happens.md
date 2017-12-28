---
title: "Il Progetto Discitur"
tagline: Refresh Happens...(Angular.js Authentication)
header: Refresh Happens
description: Progetto Discitur,Tech,Angular.js,Login,Authentication,Autenticazione,token,localstorage
group: Discitur
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
  "url" : "http://williamverdolini.github.io/2014/02/03/discitur-Refresh_happens/"
}
</script>


Uno dei diversi aspetti che girano attorno al tema Autenticazione nelle SPA
è quello relativo alla gestione del Page Reload, ovvero mantenere viva la
“sessione autenticata”, anche a seguito di un reload della pagina. Un breve
cenno su come è stata gestita l’autenticazione. Questi gli step:

 

1. Servizio angular di autenticazione chiamato
     dalle varie form di login (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L14" target="_blank">#1</a>)
2. il metodo login chiama un servizio API con
     accesso NON autenticato che verifica Username/Password. Per gestire i temi
     di sicurezza sarebbe preferibile utilizzare un protocollo HTTPS. (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L69" target="_blank">#2</a>)
3. Se i dati passano il controllo il servizio
     restituisce un token criptato, che contiene informazioni sull’account e
     sul periodo di validata del token stesso (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L93" target="_blank">#3</a>)
4. il token viene salvato nella localStorage (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L45" target="_blank">#4</a>)
5. nella callback della login viene chiamato un
     servizio API con accesso autenticato per recuperare/completare le
     informazioni sull’utente (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L95" target="_blank">#5</a>)
6. la chiamata (in realtà ogni chiamata) passa
     attraverso un interceptor che setta l’header per la gestione della
     chiamata autenticata, se presente il token di autenticazione (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L210" target="_blank">#6</a>)
7. il servizio API, se il token è valido,
     restituisce i dati richiesti, altrimenti restituisce una risposta 401
     (risorsa Non Autorizzata) ed il token viene rimosso dalla localStorage (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L157" target="_blank">#7</a>)
8. se la richiesta dà esito ok, i dati
     dell’utente sono recuperati e si aggiorna l’oggetto “user” del servizio di
     autenticazione, che è controllato nell’applicazione ovunque serva gestire
     logiche legate alla sessione autenticata (<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js#L152" target="_blank">#8</a>)

 

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

Il codice completo è su github: <a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js" target="_blank">https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/user/UserService.js</a>

 

La gestione è lineare e chiara dal mio punto di vista. L’unico aspetto che
non sono riuscito a chiarirmi in rete è quello relativo alla gestione delle
callback del servizio $http del core angular. La cosa che ho riscontrato è che
sebbene il servizio REST restituisca uno status 401, il servizio $http chiama
la success callback…mentre mi sarei aspettato avesse richiamato la error
callback. La <a href="http://docs.angularjs.org/api/ng.$http" target="_blank">documentazione ufficiale</a> mi pare mi dia ragione…ma non ho trovato grossi riscontri a
questa segnalazione in rete…qualcuno mi può illuminare?

**Update**

  
  
  

Il problema delle callback stava diventando sempre più frequente ed ho quindi dovuto affrontarlo
interrompendo il resto. Ho fatto molte ricerche per verificare se altri avessero avuto problemi simili e la
prima tappa da fare in questo genere di problemi è <a href="http://stackoverflow.com/" target="_blank">Stackoverflow</a>.

Sono stato doppiamente sfortunato, perchè ho sì trovato un <a href="http://stackoverflow.com/questions/15888162/angularjs-http-error-function-never-called" target="_blank">post che esprimeva il mio stesso identico problema</a>,
peccato che le soluzioni proposte non c'entravano niente con la mia...effetto? Quasi una settimana di 
approfondimenti ("inutili") sul funzionamento di IIS, dello standard HTTP, di .Net WebApi.

Il problema era sull'<a href="https://github.com/williamverdolini/discitur-web/blob/sprint3/app/modules/main/DisciturApp.js#L119" target="_blank">uso sbagliato che facevo in un intercpetor Angular.js</a>.

  
  
Le tecniche di Problem Solving meriterebbero un articolo a parte (o forse libri...), ma la cosa che ho imparato da quest'esperienza è quella di rimanere lucidi e critici su cosa sta realmente avvenendo
nel sistema senza lasciarsi distrarre (troppo) da post o forum. Non è facile...soprattutto per uno "Stackoverflow-addicted" come me.

Aprire e debuggare Angular.js è abbastanza formativo, ma fa venire il mal di mare...perciò ho aggiunto <a href="http://stackoverflow.com/a/22425383/3316654" target="_blank">il mio
piccolo contributo alla comunità di Stackoverflow</a>. 