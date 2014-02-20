---
layout: wvpost
title: "Il Progetto Discitur"
tagline: Backlog
header: Backlog
description: Progetto Discitur, Backlog, Metodologia, Scrum, Agile
group: Discitur
tags: [Agile]
---
{% include JB/setup %}

Il product Backlog
utilizzato ha diversi campi. Questi quelli che ritengo più utili (con un
esempio, che parla più di tante parole):

<h6>
<table class="table">
  <thead>
    <tr>
      <th><b>ID</b></th>
      <th><b>Titolo</b></th>
      <th><b>User Story</b></th>
      <th><b>Descrizione<br>(Tasks)</b></th>
      <th><b>Imp.</b></th>
      <th><b>Stima<br>s.p.</b></th>
      <th><b>Come Testare</b></th>
      <th><b>Note</b></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td><b>Login</b></td>
      <td>Come docente vorrei
  autenticarmi in modo da non dover reinserire ogni volta i dati del mio
  profilo (materie, tipo scuola)</td>
      <td>1) Funzionalità per
  l'inserimento di username/password   
       <br>
  2) Servizio per la verifica su DB   
       <br>
  3) inserimento in memoria di sessione del flag di autenticazione
</td>
      <td>5</td>
      <td>2</td>
      <td>Si inseriscono dati
        sbagliati e si verifica che il istema non consente l'accesso all'area dati
        personali  
      
        Si inseriscono dati corretti e si accede all'area Dati personali, in cui sono
        riportati i dati personali raccolti in registrazione</td>
            <td>Serve verificare la
        crittografia dei dati della password  
        
      
        gestire navigazione sicura successivamente
      </td>
    </tr>

    <tr>
      <td>2</td>
      <td><b>Gestisci Dati personali</b></td>
      <td>Come docente vorrei poter
  modificare i miei dati personali in modo da aggiornare le materie e per
  questioni di sicurezza aggiornare la password</td>
      <td>possibilità di
  visualizzare i dati raccolti in registrazione e possibilità di modificare:  

  - password  

  - discipline insegnate</td>
      <td>2</td>
      <td>2</td>
      <td>Fare Login, accedere
  all'area dati personale, verificare che i dati siano quelli previsti (da db o
  da registrazione), modificare i dati possibili e salvare</td>
      <td>gestire navigazione sicura successivamente</td>
    </tr>

    <tr>
      <td>3</td>
      <td><b>Regis- trazione</b></td>
      <td>come docente vorrei
  registrarmi in modo da non dover ripetere i miei dati continuamente e
  ricevere gli aggiornamenti via mail per nuove lezioni inserite</td>
      <td>1) UI per l’inserimento delle credenziali, 
      con verifica robustezza della password (con conferma),
      email (== username), nome, cognome, ruolo nella scuola, 
      discipline di insegnamento, flag per feedback nuove storie.
      <br>
  2) servizio e DB per persistenza dati. Verifica univocità dell’account  
    <br>
  3) prevedere di tabellare/taggare le discipline insegnate fino ad un massimo
  di 20</td>
      <td>3</td>
      <td>4</td>
      <td></td>
      <td>Inizialmente possono essere
  inseriti a mano gli account</td>
    </tr>




  </tbody>
</table> 
</h6>

- **ID**: identificativo univoco. Nelle condivisioni,
     via mail, sempre meglio riferirsi a riferimenti non interpretabili
- **Titolo**: il nome della funzionalità, della user
     story
- **User Story**: tipica dello SCRUM. Va espressa nella forma
     canonica “come &lt;utente&gt; voglio poter &lt;funzionalità&gt; per ottenere &lt;valore&gt;”. Può sembrare
     ridondante (e a volte lo è), ma mai sottovalutarne l’importanza: è
     fondamentale riuscire a ragionare in termini di valore per l’utente
     finale, è importante per capire se è proprio quello il valore che porta
     all’utente, è importante per capirne la priorità, è importante per
     migliorarne la comprensione anche in termini di dettaglio funzionale. si
     pensi ad es. alla Registrazione dell’esempio precedente, sicuramente la
     task-list estratta non sarebbe stata la stessa in assenza della user story
- **Descrizione (Tasks)**: la suddivisione in task  e componenti da realizzare della user
     story. E’ pane per sviluppatori, è redatto dal reparto tecnico a seguito
     di approfondimenti con il Product Owner. 
- **Importanza**: due le caratteristiche fondamentali:
    - più il numero è alto, più la user story è importante per l’utente
    - non ci possono essere due user story con la stessa importanza. Anche
      quando le user story sembrano simili occorre approfondire quale tra le
      due sia più importante, eventualmente ponendo al product owner domande
      come: se dovessi rinunciare ad una delle due a quale rinunceresti? Se non
      avessi la funzionalità come aggireresti il problema? Il Product Owner
      (anche aldilà delle metodologie agili) tenderanno a dirvi è tutto
      fondamentale e tutto importante. La realtà è che non è così, ma per
      questo occorre parlarci e convincerlo. La tecnica che uso (e che funziona) è
      quella di dire: se tutto è importante, niente lo è…funziona anche con
      l’ER dell’helpdesk. Riuscire a trovare la giusta armonia e frequenza
      d’onda di pensiero sul concetto di importanza è vitale in questa
      metodologia

- **Stima (Story point)**:
     la stima in story point. Per
     story point assumo un giorno/uomo (ovvero 8 ore pienamente dedicate all’attività).
     Trovo efficace spaccare la stima in sottostime dedicate a UI, servizi,
     strutture dati, test, refactoring. Mi manca un team per fare del
     poker planning...
- **Come Testare**: per il mio desiderio di TDD è molto importante;
     in generale è un modo per focalizzare in anticipo aspetti che servono per
     dettagliare meglio i requisiti funzionali. 
- **Note**: di qualunque genere, soprattutto tecnico.
     Anche in questo caso serve per chiarire meglio il perimetro delle attività

 

A questi campi aggiungo
campi legati allo stato, allo sprint che li accomuna ed, in genere, qualunque
altro campo mi semplifichi un raggruppamento delle user stories.