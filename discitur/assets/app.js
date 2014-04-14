angular.module('disc.common',
    [])
.filter('beautyURL', function () {
    var encodeURL = function (title) {
        return encodeURI(title.replace(/\s/g, '-'));
    }

    return encodeURL;
});;angular.module('disc.lesson',
    [
        'disc.settings',
        'disc.user',
        'disc.common',
        'ui.router',
        'ngSanitize',
        'ui.bootstrap',
        'ui.tinymce'
    ])
    .config(
    [
        '$stateProvider',
        '$urlRouterProvider',
        '$uiViewScrollProvider',
        'DisciturSettings',
        function ($stateProvider, $urlRouterProvider, $uiViewScrollProvider, DisciturSettings) {
            // to prevent autoscroll (introduced by angular-ui-router 0.2.8 https://github.com/angular-ui/ui-router/releases/tag/0.2.8)
            // see: https://github.com/angular-ui/ui-router/issues/787
            $uiViewScrollProvider.useAnchorScroll();

            if (!DisciturSettings.isInMaintenance) {

                // provate method to load Lesson data by lessonId passed through $stateParams
                var _getLessonData = function (LessonService, $q, $stateParams, $state, DiscUtil, AuthService) {
                    // create deferring result
                    var deferred = $q.defer();

                    // During routing phase the $routeParams is not injected yet
                    var lessondId = $stateParams.lessonId //$route.current.params.lessonId;

                    // timeout only for test and study purpose (to erase)
                    //$timeout(function () {
                    LessonService.get({ id: lessondId })
                        .then(
                            // Success Callback
                            function (lesson) {
                                //var cache = $cacheFactory('disciturCache');
                                //cache.put('currentLesson', result)
                                // if lesson is private is visible only for the author
                                if (!lesson.isPublished && lesson.author.userid != AuthService.user.userid) {
                                    deferred.reject("no Lesson for id:" + lessondId);
                                }
                                DiscUtil.cache.put('lesson', lesson)
                                deferred.resolve(lesson)
                            },
                            // Error Callback
                            function () {
                                deferred.reject("no Lesson for id:" + lessondId);
                                //$state.go('404lesson')

                            });
                    //}, 2000);

                    return deferred.promise;
                }


                $stateProvider
                    .state('lessonSearch', {
                        url: 'lesson?keyword?discipline?school?classroom?rate?tags?publishedOn?publishedBy?startRow?pageSize?orderBy?orderDir',
                        parent: 'master.2cl',
                        onEnter: function () {
                            console.log("Entering Lesson Search");
                        },
                        resolve: {
                            lessonsData: ['LessonService', '$stateParams', function (LessonService, $stateParams) {
                                return LessonService.search($stateParams);
                            }],
                            lastLessonList: ['LessonService', function (LessonService) {
                                return LessonService.getLastLessons();
                            }]
                        },
                        views: {
                            'sidebar': {
                                templateUrl: 'modules/lesson/LessonListSideBar.html',
                                controller: 'LessonListSideBarCtrl'
                            },
                            'main': {
                                templateUrl: 'modules/lesson/LessonList.html',
                                controller: 'LessonListCtrl'
                            }
                        }
                    })
                    .state('lessonDetail', {
                        url: 'lesson/:lessonId/{title}',
                        parent: 'master.2cl',
                        onEnter: function () {
                            console.log("Entering Lesson Detail");
                        },
                        // resolve create service data shared by component views
                        resolve: {
                            lessonData: ['LessonService', '$q', '$stateParams', '$state', 'DiscUtil', 'AuthService', _getLessonData],
                            lastLessonList: ['LessonService', function (LessonService) {
                                return LessonService.getLastLessons();
                            }]
                        },
                        views: {
                            'sidebar': {
                                templateUrl: 'modules/lesson/LessonSideBar.html',
                                controller: 'LessonSideBarCtrl'
                            },
                            'main': {
                                templateUrl: 'modules/lesson/Lesson.html',
                                controller: 'LessonCtrl'
                            }
                        }
                    })
                    .state('lessonEdit', {
                        authorized: true,
                        url: 'edit/lesson/:lessonId',
                        parent: 'master.1cl',
                        onEnter: ['AuthService', 'lessonData', '$location', function (AuthService, lessonData, $location) {
                            console.log("Entering Lesson Edit");
                            // the controller can be accessed only if authenticated
                            if (!AuthService.user.isLogged ||
                                (lessonData.lessonId != null && lessonData.author.userid != AuthService.user.userid))
                                // use location due to $state.go land on blank page...
                                $location.path('lesson');
                        }],
                        templateUrl: 'modules/lesson/LessonEdit.html',
                        controller: 'LessonEditCtrl',
                        resolve: {
                            lessonData: ['LessonService', '$q', '$stateParams', '$state', 'DiscUtil', 'AuthService', function (LessonService, $q, $stateParams, $state, DiscUtil, AuthService) {
                                // try to get lesson from cache
                                // if not exists then load from service
                                var lessondId = $stateParams.lessonId
                                if (lessondId) {
                                    var cachedLessonData = DiscUtil.cache.get('lesson')

                                    if (!angular.isDefined(cachedLessonData) || cachedLessonData.lessonId.toString() !== lessondId)
                                        return _getLessonData(LessonService, $q, $stateParams, $state, DiscUtil, AuthService);
                                    else
                                        return cachedLessonData;
                                }
                                else
                                    return LessonService.newLesson();
                            }]
                        }

                    })
                    .state('404lesson', {
                        //authorized: true,
                        url: '404lesson',
                        parent: 'master.2cl',
                        onEnter: function () {
                            console.log("master.2cl.404lesson");
                        },
                        resolve: {
                            lastLessonList: ['LessonService', function (LessonService) {
                                return LessonService.getLastLessons();
                            }]
                        },
                        views: {
                            'sidebar': {
                                templateUrl: 'modules/lesson/LessonListSideBar.html',
                                controller: 'LessonListSideBarCtrl'
                            },
                            'main': {
                                controller: 'Lesson404Ctrl',
                                templateUrl: 'modules/lesson/Lesson404.html'
                            }
                        }
                    });
            }

        }

    ]
);angular.module('disc.user',
    [
        //'discitur',
        'disc.common',
        'ngResource',
        'ui.router',
        'ngSanitize',
        'ui.bootstrap'
    ])
    .config(
    [
        '$httpProvider',
        '$stateProvider',
        '$urlRouterProvider', 
        '$uiViewScrollProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider, $uiViewScrollProvider) {
            $httpProvider.interceptors.push('UserAuthInterceptor');

            // to prevent autoscroll (introduced by angular-ui-router 0.2.8 https://github.com/angular-ui/ui-router/releases/tag/0.2.8)
            // see: https://github.com/angular-ui/ui-router/issues/787
            $uiViewScrollProvider.useAnchorScroll();


            $stateProvider
                .state('userProfile', {
                    url: 'user/profile',
                    parent: 'master.1cl',
                    authorized: true,
                    templateUrl: 'modules/user/UserProfile.html',
                    controller: 'UserProfileCtrl',
                    resolve: {
                        user: ['AuthService',function (AuthService) {
                            return AuthService.user;
                        }]
                    }
                })
                .state('userActivation', {
                    url: 'user/activation?username?key',
                    parent: 'master.1cl',
                    onEnter: function (activation) {
                        console.log(activation);
                    },
                    onExit: function (activation) {
                        console.log(activation);
                    },
                    templateUrl: 'modules/user/UserActivation.html',
                    controller: 'UserActivationCtrl',
                    resolve: {
                        activation: function (AuthService, $stateParams) {
                            return AuthService.activate($stateParams).catch(
                                function (data) { return { notActive: true };}
                                );
                        }
                    }
                })

        }
    ]
    );;angular.module('disc.common')
.value('dictionary',
    {
        brand: "Discitur",
        appTitle: "Discitur - Insieme si migliora",
        loading: "Caricamento in corso...",
        lessonTitleHeading: "Titolo della Lezione",
        lessonTitle: "Titolo",
        notPublished: "Lezione non pubblicata",
        specifics : "Caratteristiche",
        discipline: "Disciplina",
        school: "Scuola",
        classroom: "Classe",
        tags: "Tags",
        rating: "Valutazione",
        author: "Pubblicato da",
        publishedOn: "in data",
        content: "Contenuto",
        lessonGoods: "Aspetti positivi",
        lessonBads: "Aspetti negativi",
        noLessonGoods : "Nessun aspetto positivo rilevato...",
        noLessonBads: "Nessun aspetto negativo rilevato!",
        conclusion: "Conclusioni",
        comments: "I Commenti",
        commentPlaceholder: "Inserisci il tuo commento",
        commentHelp: "Accedi ed esprimi la tua opinione!",
        commentAnswer: "Rispondi",
        commentEdit: "Edita",
        commentPreview: "Anteprima",
        commentSave: "Salva",
        commentRequired: "Inserisci almeno un carattere",
        commentNotDelete: "Il commento non può essere rimosso: altri utenti hanno linkato la tua risposta",

        ratings: "Le Valutazioni",
        ratingPlaceholder: "Se vuoi, commenta il tuo giudizio",
        ratingtHelp: "Sei un docente ed hai provato la lezione? Accedi ed esprimi il tuo giudizio ed aiuta a migliorare la lezione",
        ratingSave: "Salva",
        ratingRequired: "Scegli il valore della tua valutazione",
        ratingNotDelete: "Il commento non può essere rimosso dall'Autore della lezione.",
        ratingInput: "Il tuo giudizio: ",

        noLessonIdFound: "Oooops...la Lezione non esiste! <br>Segnalalo al <a href='mailto:support@discitur.org'>supporto tecnico</a>",
        viewMore: "Approfondisci >>",
        keywordPlaceholder: "Ricerca la lezione per titolo",
        advKeyword: "Titolo",
        disciplinePlaceholder: "Disciplina",
        schoolPlaceholder: "Scuola",
        classroomPlaceholder: "Classe",
        tag: "Caratteristica",
        searchButton: "Cerca",
        advancedSearchButton: "Ricerca Avanzata",
        buttonAdd: "+",
        addItem: "Aggiungi",
        buttonDel: "x",
        cancel: "Annulla",
        validationError: "Non Valido!",
        // User NavBar:
        userSignIn: "Accedi",
        username: "User Name",
        password: "Password",
        signInTitle: "Accedi a Discitur",
        loginButtom: "Login",
        login: "Login",
        forgottenPwdHelp: "Inserisci lo UserName associato al tuo account e ti sarà inviata una email con nuove credenziali di accesso.",
        sendMail: "Invia email",
        //usernameNotValid: "User Name NON valido: inserisci un indirizzo email corretto",
        usernameNotValid: "User Name NON valido",
        register: "Registrati",
        userProfile: "Il tuo Profilo",
        userLessons: "Le tue Lezioni",
        userSignOff: "Esci",

        editLessonButton: "Modifica",
        requiredField: "Dato obbligario",
        showHideHelp: "Mostra/Nascondi Help",

        helpTitle: "<h6>Marcando il check <b>Pubblica</b> "+
                    "la lezione sarà visibile a tutti.<br />"+
                    "Tieni la lezione privata mentre la stai preparando. "+
                    "Sarà visibile solo a te ed accessibile tramite la funzionalità di profilo <b>Le tue Lezioni</b>.</h6>",
        helpSpecifics: "<h6>Digitando sui campi il sistema ti proporrà dei valori già presenti a sistema."+
                    "<br /><br /><p>"+
                    "Se non soddisfano alle tue esigenze inserisci i dati come meglio preferisci.</p></h6>",
        helpTags: "<h6>I  <b>Tag</b> consentono di marcare e poter ricercare la lezione per caratteristiche interdisciplinari.<br />"+
                  "<br /><p>Digitando, il sistema ti proporrà dei valori già presenti,"+
                  "ma se non soddisfano alle tue esigenze, inserisci i dati come meglio preferisci.</p></h6>",
        helpContent: "<h6>Inserisci il <b>Contenuto</b> della lezione.<br /><br />"+
                     "Dettaglia i passaggi e gli strumenti utilizzati e descrivi il metodo o l'approccio utilizzato,"+
                     "in modo che altri docenti possano comprendere la lezione ed imparare.<br />"+
                     "<br /><p>Per poter inserire immagini o video utilizza le funzionalità dell'editor a fianco,"+
                     "ma ricorda, tutte le immagini devono essere caricate in un tuo spazio web ed accessibili"+
                     "attraverso un indirizzo web, da inserire nel campo <b>Source</b>.</p>"+
                     "<p>Ti suggeriamo i seguenti se non hai già un tuo spazio web:<ul>"+
                     "<li><a href=\"http://www.drive.google.com/\">Google Drive</a></li>"+
                     "<li><a href=\"https://www.dropbox.com/\">Dropbox</a></li></ul></p></h6>",
        helpFeedbacks: "<h6>I  <b>Feedback</b> sono il frutto della retrospettiva della lezione, della tua analisi, del tuo punto di vista.<br />"+
                    "<br />Cosa è andato bene? Quali gli aspetti positivi della lezione?<br /><br />"+
                    "Cosa invece non ha funzionato? Cosa poteva essere evitato? Cosa migliorato?<br /><br />"+
                    "<p>Metti la qualità dell'insegnamento sopra al resto e non temere di indicare gli aspetti negativi riscontrati."+
                    "<br />Sono principalmente questi che consentono di migliorare la tecnica, il metodo e la qualità dell'insegnamento.<br />Sbagliando si impara!</p></h6>",
        helpConclusion: "<h6>Nelle <b>Conclusioni</b> inserisci i punti salienti della lezione.<br /><br />"+
                    "Il paragrafo è utilizzato nella lista dei risultati della ricerca come <i>abstract</i> della lezione,"+
                    "perciò è importante riuscire a sintetizzare il contenuto e gli aspetti caratterizzanti.</h6>",
        editTooltip: "Modifica",
        deleteTooltip: "Elimina",
        lastLessonsTitle: "Le ultime lezioni pubblicate",
        socialTitleFBLike: "I Like it",
        socialTitleGPone: "Google +1",
        socialTitleTWShare: "Share on Twitter",
        socialTitleFBShare: "Share on Facebook",
        socialTitleGPShare: "Share on Google Plus",
        socialTitleLIShare: "Share on LinkedIn",
        // Registration Form
        name: "Nome",
        surname: "Cognome",
        email: "Email",
        confirmPassword: "Conferma Password",
        signupButton: "Registrati",
        requiredUserName: "UserName obbligatorio",
        minLengthUserName: "Inserisci uno User Name di almeno 4 caratteri",
        requiredPassword: "Password obbligatoria",
        minLengthPassword: "inserisci una Password di almeno 7 caratteri",
        requiredName: "Nome obbligatorio",
        requiredSurname: "Cognome obbligatorio",
        requiredEmail: "Email obbligatoria",
        validEmail: "Email non valida",
        requiredConfirmPassword: "Conferma Password obbligatoria",
        minLengthConfirmPassword: "inserisci una Conferma Password di almeno 7 caratteri",
        matchConfirmPassword: "Conferma Password non corretta",
        sentNewPwdEmail: "A breve riceverai via mail una nuova Password.",
        forgottenPassword: "Password dimenticata?",
        changePassword: "Modifica Password",
        currentPassword: "Password attuale",
        newPassword: "Nuova password",
        confirmPassword: "Conferma password",
        requiredNewPassword: "Nuova Password obbligatoria",
        minLengthNewPassword: "inserisci una nuova Password di almeno 7 caratteri",
        changedPassword: "Password aggiornata con successo.",
        confirm: "Conferma",
        modify: "Modifica",
        testEnv: "Ambiente di Test",
        signupSuccess: 'Registrazione avvenuta con successo. Controlla la tua email ed attiva il tuo account.',
        activationSuccess: 'Il tuo account è stato attivato. Accedi e inizia a dare il tuo contributo!',
        activationFailed: 'Il tuo account NON è stato attivato. Controlla la tua mail o contatta il supporto tecnico.'
        }
)
.value('overrides',
{
    'LessonCtrl': {
        //lessonGoods: "Cosa è andato bene",
        //lessonBads: "Cosa è andato male"
    },
    'LessonListCtrl': {
        publishedOn: "Pubblicato il",
        noLessonFound: "Nessuna Lezione trovata."
    },
    'LessonListSideBarCtrl': {
        newLessonButton: "Nuova Lezione"
    },
    'LessonEditCtrl': {
        saveLessonButton: "Salva la Lezione",
        deleteLessonButton: "Elimina la Lezione",
        cancelButton: "Annulla",
        publicLesson: "Pubblica"
    }
})
.value('errors',
{
    discerr01 : 'Username già usato da un altro account',
    discerr02: 'Email già associata ad un altro account',
    discerr03: 'Username o password non corretti'
});angular.module('disc.common')
    .factory('ErrorDTO', function () {
        function ErrorDTO() {
            this.code = null;
            this.description = null;
        }
        return (ErrorDTO);
    })
    .factory('LabelService',
    [
        'dictionary',
        'overrides',
        'errors',
        'ErrorDTO',
        function (dictionary, overrides, errors, ErrorDTO) {
            return {
                get: function (controller, label) {
                    //console.debug("LabelService.get " + controller + " - " + label)
                    // if exists the overriden label within the Controller is returned 
                    // otherwise the dictionary's label is returned
                    return (overrides[controller] && overrides[controller][label]) ?
                        overrides[controller][label] :
                        dictionary[label] || 'Label (' + label + ') not set!';

                },
                apiErrorCode: function (errorCode) {
                    var _err = new ErrorDTO();
                    _err.code = errorCode;
                    _err.description = errors[errorCode] || errorCode;
                    return _err;
                },
                apiError: function (apiError) {
                    var _errs = [];
                    if (apiError.ModelState && apiError.ModelState.discerrors) {
                        var _discerrors = apiError.ModelState.discerrors;
                        for (var i = 0; i < _discerrors.length; i++) {
                            var _err = new ErrorDTO();
                            _err.code = _discerrors[i];
                            _err.description = (errors[_discerrors[i]] ? errors[_discerrors[i]] : _discerrors[i]);
                            _errs.push(_err);
                        }
                    }
                    else {
                        var _err = new ErrorDTO();
                        _err.code = apiError;
                        _err.description = apiError;
                        _errs.push(_err);
                    }
                    return _errs;
                }
            };
        }
    ]
);

;angular.module('disc.common')
    .factory('DiscUtil', ['$cacheFactory', function ($cacheFactory) {
        var _getMessage = function (obj) {
            var _message = "";
            for (var key in obj) {
                if (obj[key].constructor === Object)
                    _message += _getMessage(obj[key])
                else
                    _message += key + ":" + obj[key] + " ";
            }
            return _message;
        }

        return {
            // validate service input
            validateInput: function (functionName, validInput, actualInput) {
                // accept only Object
                if (angular.isUndefined(actualInput) || !(Object.prototype.toString.call(actualInput) === '[object Object]'))
                    throw { code: 20001, message: 'invalid Input Type for ' + functionName + ' :' + _getMessage(actualInput) }
                if (angular.isDefined(actualInput)) {
                    // loop to check if input.properties (aka parametrs) are expected by the service validInput template
                    for (key in actualInput) {
                        // Angular private ($$) and Discitur private (_) are ignored
                        if (!(key.indexOf('$$') == 0 || key.indexOf('_') == 0) && !validInput.hasOwnProperty(key))
                            throw { code: 20002, message: 'invalid Input Parameter for ' + functionName + ' :' + _getMessage(actualInput) }
                        // If not passed in actualInput and if defined in validInput, set default value
                        //if (angular.isUndefined(actualInput[key]) && validInput[key] != null)
                        //    actualInput[key] = validInput[key];
                    }
                    // loop to set default values, if not set in actualInput
                    for (key in validInput) {
                        if ((angular.isUndefined(actualInput[key]) || actualInput[key] == null) && validInput[key] != null)
                            actualInput[key] = validInput[key];
                    }
                }

            },
            // cache manager
            cache: $cacheFactory('disciturCache')
        }

    }])
    // LoadingInterceptor Intercepor:
    // display/hide loading bar
    .factory('LoadingInterceptor', [
        '$q',
        '$rootScope',
        'DisciturSettings',
        function ($q, $rootScope, DisciturSettings) {
            return {
                request: function (config) {
                    if (config.url.indexOf(DisciturSettings.apiUrl) >= 0)
                        $rootScope.$loading = true;
                    return config || $q.when(config);
                },
                response: function (result) {
                    if (result.config.url.indexOf(DisciturSettings.apiUrl) >= 0)
                        $rootScope.$loading = false;
                    return result || $q.when(result);
                },
                responseError: function (result) {
                    if ($rootScope.$loading)
                        $rootScope.$loading = false;
                    return $q.reject(result);
                }
            }
        }
    ])

;angular.module('disc.common')
    .directive('wrInput', [
        '$rootScope',
        'LabelService',
        function ($rootScope, LabelService) {
            return {
                restrict: 'E',
                templateUrl: 'modules/common/wrInput.html',
                replace: true,
                transclude: false,
                scope: {
                    wrText: '=',
                    wrRef: '=',
                    editText : '&',
                    removeText: '&?'
                },
                link: function (scope, element, attrs) {
                    //-------- private methods-------
                    // call Label Service to get dynamic labels
                    var _getLabel = function (label) {
                        return LabelService.get('LessonRatingDrv', label);
                    }
                    var _initVal = scope.wrText;

                    //-------- private variables-------
                    //var form = element.find('form');

                    //-------- public properties-------
                    scope.local = {
                        edit: false,
                        isDeletable: angular.isDefined(attrs.removeText),
                        cssClass: angular.isDefined(attrs.wrClass) ? attrs.wrClass : '',
                        cssStyle: angular.isDefined(attrs.wrStyle) ? attrs.wrStyle : ''
                    }

                    scope.labels = {
                        editTooltip: _getLabel('editTooltip'),
                        deleteTooltip: _getLabel('deleteTooltip')
                    };

                    //-------- public methods-------
                    scope.actions = {
                        edit: function () {
                            scope.local.edit = !scope.local.edit;
                            if (_initVal != scope.wrText)
                                scope.editText({ ref: scope.wrRef })
                        },
                        remove: function () {
                            scope.removeText({ ref: scope.wrRef })
                        }
                        // Save & Update User Rating
                    }

                    //-------- Initialization -------
                    // if new Rating and the user is logged in, initialize the form


                }
            }
        }
    ]);angular.module('disc.common')
    .directive('socialBar', [
        '$rootScope',
        'DisciturBaseCtrl',
        '$injector',
        function ($rootScope, DisciturBaseCtrl, $injector) {
            return {
                restrict: 'E',
                templateUrl: 'modules/common/socialBar.html',
                replace: true,
                transclude: false,
                scope: {
                    cssClass: '@?',
                    absUrl: '@',
                    urlTitle: '@?'
                },
                link: function (scope, element, attrs) {
                    // inherit Discitur Base Controller
                    $injector.invoke(DisciturBaseCtrl, this, { $scope: scope });

                    //-------- private properties -------
                    scope._ctrl = 'socialBarDrv';

                    //-------- public properties-------
                    scope.local = {
                        cssClass: null,
                        absUrl: null,
                        urlTitle: null,
                        FBShareHref: null,
                        FBLikeHref: null,
                        TWShareHref: null,
                        GPOneHref: null,
                        GPShareHref: null,
                        LIShareHref: null                        
                    }

                    scope.labels = {
                        socialTitleFBLike: scope.getLabel('socialTitleFBLike'),
                        socialTitleGPone: scope.getLabel('socialTitleGPone'),
                        socialTitleTWShare: scope.getLabel('socialTitleTWShare'),
                        socialTitleFBShare: scope.getLabel('socialTitleFBShare'),
                        socialTitleGPShare: scope.getLabel('socialTitleGPShare'),
                        socialTitleLIShare: scope.getLabel('socialTitleLIShare')
                    };
                    
                    //---------- Initialization --------------
                    scope.local.cssClass =  scope.cssClass || 'social-bar';
                    scope.local.absUrl= encodeURIComponent(scope.absUrl);
                    scope.local.urlTitle = encodeURIComponent(scope.urlTitle);
                    scope.local.FBShareHref = "http://www.facebook.com/sharer.php?u=" + scope.local.absUrl + (scope.urlTitle ? "&t=" + scope.local.urlTitle : "");
                    scope.local.FBLikeHref= "http://www.facebook.com/plugins/like.php?href=" + scope.local.absUrl;
                    scope.local.TWShareHref = "http://twitter.com/share?url=" + scope.local.absUrl + (scope.urlTitle ? "&text=" + scope.local.urlTitle : "") + "&via=__wilver__";
                    scope.local.GPOneHref= "https://apis.google.com/_/+1/fastbutton?usegapi=1&size=large&url=" + scope.local.absUrl;
                    scope.local.GPShareHref= "https://plus.google.com/share?url=" + scope.local.absUrl;
                    scope.local.LIShareHref = "http://www.linkedin.com/shareArticle?url=" + scope.local.absUrl;                    
                }
            }
        }
    ]);angular.module('disc.common')
    .directive('pwCheck', [
        '$rootScope',
        function ($rootScope) {
        return {
            restrict: 'A',
            require: 'ngModel',            
            
            scope:{
                pwCheck: '='
            },
            
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return;
                //var scope = scope;

                var _check = function (cPwd) {
                    var isValid = ngModel.$viewValue === cPwd;
                    ngModel.$setValidity('pwmatch', isValid);
                    return;
                }
                // watch on password value
                scope.$watch(
                    function () { return scope.pwCheck },
                    function () { _check(scope.pwCheck); }
                    );
                // watch on confirmPassword value
                scope.$watch(
                    function () { return ngModel.$viewValue },
                    function () { _check(scope.pwCheck); }
                    );

            }
        }
        }
    ]);;angular.module('disc.common')
    .directive('serverValidation', [
        '$rootScope',
        function ($rootScope) {
            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    serverValidation: '&'
                },

                link: function (scope, element, attrs, ngModel) {
                    if (!ngModel) return;

                    element.blur(function () {
                        ngModel.$setValidity('serverCheck', false);
                        scope.serverValidation({ inputValue: ngModel.$viewValue }).then(
                                function (result) {
                                    ngModel.$setValidity('serverCheck', result)
                                },
                                function (error) {
                                    ngModel.$setValidity('serverCheck', false)
                                }
                            );
                    })

                }
            }
        }
    ]);;angular.module('disc.lesson')
    /*-------------------------------------------------------------------------------
    Vantaggi del DTO:
    - disaccoppiamento tra i dati restituite dal BE e quelli gestiti dal FE
    - presenza di un (Client) Object Model distinto dal (Server( Object e/o Entity Model
    - possibilità di verificare il reale contenuto delle classi a codice (non a runtime)

    riferimenti: http://www.bennadel.com/blog/2527-Defining-Instantiatable-Classes-In-The-AngularJS-Dependency-Injection-Framework.htm
    ---------------------------------------------------------------------------------*/
    .factory('LessonDTO', function () {
        function LessonDTO() {
            this.lessonId = null;
            this.title = null;
            this.discipline = null;
            this.school = null;
            this.classroom = null;
            this.rate = null;
            this.author = null;
            this.isPublished = false;
            this.publishedOn = null;
            this.content = null;
            this.conclusion = null;
            this.lastModifUser = null;
            this.version = null;
            this.goods = [];
            this.bads = [];
            this.tags = [];
            this.ratings = [];
            this.comments = [];
        }
        return (LessonDTO);
    })
    .factory('LessonSummaryDTO', function () {
        function LessonSummaryDTO() {
            this.lessonId = null;
            this.title = null;
        }
        return (LessonSummaryDTO);
    })
    .factory('CommentDTO', function () {
        function CommentDTO() {
            this.lessonId = null;
            this.id = null;
            this.content = null;
            this.date = null;
            this.parentId = null;
            this.level = 0;
            this.author = {
                userid: null,
                username: null,
                image: null
            };
            this.order = 0.0;
            this.status = 'I'; //Initialized
        }
        return (CommentDTO);
    })
    .factory('RatingDTO', function () {
        function RatingDTO() {
            this.id = null;
            this.lessonId = null;
            this.author = {
                userid: null,
                username: null,
                image: null
            };
            this.rating = null;
            this.content = null;
            this.date = null;
            this.version = null;
        }
        return (RatingDTO);
    })
    .factory('LessonService', [
        '$resource',
        '$http',
        '$q',
        'LessonDTO',
        'CommentDTO',
        'RatingDTO',
        'LessonSummaryDTO',
        'DisciturSettings',
        'DiscUtil',
        '$cacheFactory',
        function ($resource, $http, $q, LessonDTO, CommentDTO, RatingDTO, LessonSummaryDTO, DisciturSettings, DiscUtil, $cacheFactory) {
            //-------- private methods -------
            // Private methods for DTO purposes

            // Lesson Data Transfer
            var _dataTransfer = function (lessonData) {
                var lesson = new LessonDTO();
                lesson.lessonId = lessonData.LessonId;
                lesson.title = lessonData.Title;
                lesson.discipline = lessonData.Discipline;
                lesson.school = lessonData.School;
                lesson.classroom = lessonData.Classroom;
                lesson.author = {
                    name: lessonData.Author.Name,
                    surname: lessonData.Author.Surname,
                    userid: lessonData.Author.UserId,
                    username: lessonData.Author.UserName
                }
                lesson.isPublished = lessonData.Published=='1';
                lesson.publishedOn = lessonData.PublishDate;
                lesson.rate = lessonData.Rate;
                angular.forEach(lessonData.FeedBacks, function (feedBack, key) {
                    var fb = { id: feedBack.LessonFeedbackId, content: feedBack.Feedback, status: 'I' };
                    if (feedBack.Nature == 1) this.goods.push(fb)
                    if (feedBack.Nature == 2) this.bads.push(fb)
                    //if (feedBack.Nature == 1) this.goods.push(feedBack.Feedback)
                    //if (feedBack.Nature == 2) this.bads.push(feedBack.Feedback)
                    }, lesson);
                angular.forEach(lessonData.Tags, function (tag, key) {
                    this.tags.push({ content: tag.LessonTagName, status: 'I' });
                }, lesson);
                lesson.tags.status = 'I';
                lesson.content = lessonData.Content;
                lesson.conclusion = lessonData.Conclusion;
                lesson.lastModifUser = lessonData.LastModifUser;
                lesson.version = lessonData.Vers;
                return lesson;
            }
            // Lesson Array Data Transfer
            var _arrayDataTransfer = function (resultArray) {
                var lessons = [];
                for (var i = 0; i < resultArray.length; i++) {
                    lessons.push(_dataTransfer(resultArray[i]));
                }
                return lessons;
            }
            // Paged Lesson Array Data Transfer
            var _pageDataTransfer = function (resultPage) {
                var page = {
                    startRow : resultPage.StartRow,
                    count: resultPage.Count,
                    pageSize: resultPage.PageSize,
                    lessons: _arrayDataTransfer(resultPage.Records)
                }
                return page;
            }
            // Lesson Comment data Transfer
            var _commentTransfer = function (commentData) {
                var comment = new CommentDTO();
                comment.lessonId = commentData.LessonId;
                comment.id = commentData.Id;
                comment.content = commentData.Content;
                comment.date = commentData.Date;
                comment.parentId = commentData.ParentId || 0;
                comment.level = commentData.Level
                comment.author.userid = commentData.Author.UserId;
                comment.author.username = commentData.Author.UserName;
                comment.author.image = commentData.Author.Picture;
                return comment;
            }
            // Lesson Comments array data Transfer
            // The method transfer Comment ApiData and set client Comment poperties (usefuk for sorting):
            // _num: progress number of lesson comment
            // _order: string for lesson comment sorting
            var _commentsArrayTransfer = function (commentArrayData) {
                var comments = [];
                for (var i = 0; i < commentArrayData.length; i++) {
                    comments.push(_commentTransfer(commentArrayData[i]));
                }
                if (comments.length > 0) {
                    comments.sort(function (c1,c2) { return c1.id - c2.id })
                }
                for (var i = 0; i < comments.length; i++) {
                    comments[i]._num = i+1;
                    comments[i]._order = _getCommentOrderString(comments[i], comments);
                }
                return comments;
            }
            // utility method to left padding with "0"
            var lpad = function padDigits(number, digits) {
                return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
            }
            // get client property value _order: the method define the Lesson Comment sorting algorith 
            var _getCommentOrderString = function (comment, commentsArray) {
                var order = "";
                if (comment.level > 0) {
                    for (var i = 0; i < commentsArray.length; i++) {
                        if (comment.parentId == commentsArray[i].id) {
                            order += _getCommentOrderString(commentsArray[i], commentsArray);
                            order += lpad(comment._num, 3);
                        }
                    }
                }
                if (comment.level == 0) {
                    order = "0." + lpad(comment._num, 3) + order;
                }
                return order;
            }
            // Lesson Rating array data Transfer
            var _ratingsArrayTransfer = function (ratingArrayData) {
                var ratings = [];
                for (var i = 0; i < ratingArrayData.length; i++) {
                    ratings.push(_ratingTransfer(ratingArrayData[i]));
                }
                if (ratings.length > 0) {
                    ratings.sort(function (c1, c2) { return c1.date - c2.date })
                }
                return ratings;
            }
            // Lesson Summaries data transfer
            var _lessonSummariesTransfer = function(lessonsData){
                var lsa = []
                for (var i = 0; i < lessonsData.length; i++) {
                    var ls = new  LessonSummaryDTO();
                    ls.lessonId = lessonsData[i].Key;
                    ls.title = lessonsData[i].Value;
                    lsa.push(ls);
                }
                return lsa;
            }
            // Lesson Comment data Transfer
            var _ratingTransfer = function (ratingData) {
                var rating = new RatingDTO();
                rating.id = ratingData.Id;
                rating.lessonId = ratingData.LessonId;
                rating.content = ratingData.Content;
                rating.date = ratingData.CreationDate;
                rating.rating = ratingData.Rating;
                rating.author.userid = ratingData.Author.UserId;
                rating.author.username = ratingData.Author.UserName;
                rating.author.image = ratingData.Author.Picture;
                rating.version = ratingData.Vers;
                return rating;
            }
            // lesson mapping
            var _lessonMap = function (lesson) {
                var data2api = {};
                data2api.LessonId = lesson.lessonId;
                data2api.Title = lesson.title;
                data2api.Discipline = lesson.discipline;
                data2api.School = lesson.school;
                data2api.Classroom = lesson.classroom;
                data2api.Rate = null;

                data2api.Author = {
                    Name: lesson.author.name,
                    Surname: lesson.author.surname,
                    UserId: lesson.author.userid
                }
                data2api.Published = lesson.isPublished ? 1 : 0;
                data2api.PublishedOn = lesson.publishedOn;
                data2api.FeedBacks = [];
                angular.forEach(lesson.goods, function (feedBack, key) {
                    var fb = { LessonFeedbackId: feedBack.id, Feedback: feedBack.content, Nature: 1 };
                    this.FeedBacks.push(fb);
                }, data2api);
                angular.forEach(lesson.bads, function (feedBack, key) {
                    var fb = { LessonFeedbackId: feedBack.id, Feedback: feedBack.content, Nature: 2 };
                    this.FeedBacks.push(fb);
                }, data2api);

                data2api.Tags = []
                angular.forEach(lesson.tags, function (tag, key) {
                    var _tag = { LessonId: lesson.lessonId, LessonTagName: tag.content, status: tag.status };
                    this.Tags.push(_tag);
                }, data2api);

                data2api.Content = lesson.content;
                data2api.Conclusion = lesson.conclusion;
                data2api.LastModifUser = lesson.lastModifUser;
                data2api.Vers = lesson.version;

                if(lesson.status)
                    data2api.status = lesson.status;
                return data2api;
            }
            // Get Async list of values
            var _getDistinctValues= function (type, inputParams) {
                switch (type) {
                    case('discipline') :
                        DiscUtil.validateInput('LessonService.getDistinctValues.discipline', { disciplineQ: null }, inputParams);
                        break;
                    case ('school'):
                        DiscUtil.validateInput('LessonService.getDistinctValues.school', { schoolQ: null }, inputParams);
                        break;
                    case ('classroom'):
                        DiscUtil.validateInput('LessonService.getDistinctValues.classroom', { classroomQ: null }, inputParams);
                        break;
                    case ('tag'):
                        DiscUtil.validateInput('LessonService.getDistinctValues.tag', { tagQ: null }, inputParams);
                        break;
                    default:
                        throw { code: 20003, message: 'invalid type string for LessonService.getDistinctValues :' + type }
                }

                // create deferring result
                var deferred = $q.defer();

                // Retrieve Async data for lesson id in input        
                $http({ method: 'GET', url: DisciturSettings.apiUrl + 'lesson', params: inputParams, cache: true })
                    .success(
                        // Success Callback: Data Transfer Object Creation
                        function (result) {
                            deferred.resolve(result)
                        })
                    .error(
                        // Error Callback
                        function (data) {
                            deferred.reject("Error for LessonService.getDistinctValues:" + data);
                        });
                // create deferring result
                return deferred.promise;

            }


            //-------- private properties -------
            var _currentInput;
            var _currentPage;

            //-------- public methods-------
            var _lessonService =  {
                // Retrieve Async data for lesson id in input 
                // and return a LessonDTO instance
                get: function (inputParams) {
                    DiscUtil.validateInput(
                        'LessonService.get',   // function name for logging purposes
                        { id: null},              // hashmap to check inputParameters
                        inputParams            // actual input params
                    );
                    // create deferring result
                    var deferred = $q.defer();
                    // Retrieve Async data for lesson id in input        
                    // cache is enabled. Only after modification (Lessonservice.save) the chache is reloaded
                    $http.get(DisciturSettings.apiUrl + 'lesson/' + inputParams.id, {cache: true})
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (data, status, headers, config) {
                                deferred.resolve(_dataTransfer(data));
                            })
                        .error(
                            // Error Callback
                            function (data, status, headers, config) {
                                deferred.reject("no Lesson for id:" + inputParams.id);
                            });

                    return deferred.promise;
                },
                // Search Async data for lesson inputParams
                // and return a and array of LessonDTO instances
                search: function (inputParams) {
                    DiscUtil.validateInput(
                        'LessonService.search',       // function name for logging purposes
                        {                             // hashmap to check inputParameters e set default values
                            keyword: null,
                            inContent: null,
                            discipline: null,
                            school: null,
                            classroom: null,
                            rate: null,
                            tags: null,
                            publishedOn: null,
                            publishedBy: null,
                            startRow: 0,
                            pageSize: 3,
                            orderBy: "PublishDate",
                            orderDir: "DESC"
                        }, 
                        inputParams                   // actual input params
                        );
                    // create deferring result
                    var deferred = $q.defer();
                    
                    // Retrieve Async data for lesson id in input        
                    $http({ method: 'GET', url: DisciturSettings.apiUrl + 'lesson', params: inputParams })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result) {
                                // save search input e result Data for future paging
                                _currentInput = inputParams;
                                _currentPage = _pageDataTransfer(result)
                                deferred.resolve(_currentPage)
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error for search:" + data);
                            });
                    // create deferring result
                    return deferred.promise;
                },
                // Get Async page of lesson based on pageinput
                // and return a and array of LessonDTO instances
                getPage: function (pageinput) {
                    DiscUtil.validateInput(
                        'LessonService.getPage',    // function name for logging purposes
                        {                           // hashmap to check inputParameters e set default values
                            pageNum: null
                        },
                        pageinput                   // actual input params
                        );

                    _currentInput.startRow = (pageinput.pageNum - 1) * _currentInput.pageSize
                    return _currentInput;
                    //return this.search(_currentInput)
                },
                // Get Async list of unique disciplines by value
                getDisciplines : function (q) {
                    return _getDistinctValues('discipline', { disciplineQ: q });
                },
                // Async list of unique schools by value
                getSchools : function (q) {
                    return _getDistinctValues('school', { schoolQ: q });
                },
                // Async list of unique classrooms by value
                getClassRooms : function (q) {
                    return _getDistinctValues('classroom', { classroomQ: q });
                },
                // Async list of unique tags by value
                getTags: function (q) {
                    return _getDistinctValues('tag', { tagQ: q });
                },
                // Get Async list of lesson's users comments
                getComments: function (inputParams) {
                    DiscUtil.validateInput(
                        'LessonService.getComments',       // function name for logging purposes
                        {                             // hashmap to check inputParameters e set default values
                            id: null
                        },
                        inputParams                   // actual input params
                        );
                    // create deferring result
                    var deferred = $q.defer();

                    // Retrieve Async data for lesson id in input        
                    $http({ method: 'GET', url: DisciturSettings.apiUrl + 'lesson/' + inputParams.id + '/comments', cache: true })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result) {
                                deferred.resolve(_commentsArrayTransfer(result))
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error for getting comments on lesson id:'+ inputParams.id + ' -> " + data);
                            });
                    // create deferring result
                    return deferred.promise;
                },
                // Save Async User Comment
                createComment: function (comment, commentsArray) {
                    DiscUtil.validateInput(
                        'LessonService.createComment',       // function name for logging purposes
                        new CommentDTO(),                  // hashmap to check inputParameters e set default values
                        comment                            // actual input params
                        );
                    // create deferring result
                    var deferred = $q.defer();

                    // Retrieve Async data for lesson id in input        
                    $http({ method: 'POST', url: DisciturSettings.apiUrl + 'lesson/' + comment.lessonId + '/comment', data: comment })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result) {
                                // if success, clear cache of getComments
                                $cacheFactory.get('$http').remove(DisciturSettings.apiUrl + 'lesson/' + comment.lessonId + '/comments')

                                var _newComment = _commentTransfer(result);
                                // if lesson comments array is passed, the new comment is enriched with client properties
                                _newComment = _lessonService.setCommentPrivates(_newComment, commentsArray);
                                deferred.resolve(_newComment)
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error saving comment on lesson id:"+ comment.lessonId + " -> " + data);
                            });
                    // create deferring result
                    return deferred.promise;
                },
                // Save Async User Comment
                updateComment: function (comment) {
                    DiscUtil.validateInput(
                        'LessonService.updateComment',       // function name for logging purposes
                        new CommentDTO(),                  // hashmap to check inputParameters e set default values
                        comment                            // actual input params
                        );
                    // create deferring result
                    var deferred = $q.defer();

                    // Retrieve Async data for lesson id in input        
                    $http({ method: 'PUT', url: DisciturSettings.apiUrl + 'lesson/' + comment.lessonId + '/comment/' + comment.id, data: comment })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result, status) {
                                // I don't understand this...I should go on error callback...
                                //if (status >= 200 && status < 300) {
                                // if success, clear cache of getComments
                                $cacheFactory.get('$http').remove(DisciturSettings.apiUrl + 'lesson/' + comment.lessonId + '/comments')

                                var _newComment = _commentTransfer(result);
                                _newComment._num = comment._num;
                                _newComment._order = comment._order;
                                deferred.resolve(_newComment)
                                //}
                                //else
                                //    deferred.reject("Error editing comment on lesson id:" + comment.lessonId + " -> " + result);
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error editing comment on lesson id:" + comment.lessonId + " -> " + data);
                            });
                    // create deferring result
                    return deferred.promise;
                },
                // Delete Async User Comment
                deleteComment: function (comment) {
                    DiscUtil.validateInput(
                        'LessonService.deleteComment',  // function name for logging purposes
                        new CommentDTO(),               // hashmap to check inputParameters e set default values
                        comment                         // actual input params
                        );
                    // create deferring result
                    var deferred = $q.defer();

                    // execute logical delete, updating record state (Api business logic)
                    $http({ method: 'PUT', url: DisciturSettings.apiUrl + 'lesson/' + comment.lessonId + '/comment/' + comment.id + '/delete', data: comment })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result, status) {
                                deferred.resolve(comment);
                                /*
                                // I don't understand this...I should go on error callback...
                                if (status >= 200 && status < 300) {
                                    deferred.resolve(comment);
                                }
                                else
                                    deferred.reject("Error deleting comment on lesson id:" + comment.lessonId + " -> " + arguments.toString());
                                */
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error deleting comment on lesson id:" + comment.lessonId + " -> " + data);
                            });
                    // create deferring result
                    return deferred.promise;
                },
                // add local Comment properties, for comments sorting purposes
                setCommentPrivates: function (comment, commentsArray) {
                    DiscUtil.validateInput(
                        'LessonService.setCommentPrivates',  // function name for logging purposes
                        new CommentDTO(),                    // hashmap to check inputParameters e set default values
                        comment                              // actual input params
                        );
                    if (commentsArray && commentsArray.constructor == Array) {
                        comment._num = commentsArray.length + 1;
                        comment._order = _getCommentOrderString(comment, commentsArray);
                    }
                    return comment;
                },
                // Get Async list of lesson's users ratings
                getRatings: function (inputParams) {
                    DiscUtil.validateInput(
                        'LessonService.getRatings',   // function name for logging purposes
                        {                             // hashmap to check inputParameters e set default values
                            id: null
                        },
                        inputParams                   // actual input params
                        );
                    // create deferring result
                    var deferred = $q.defer();

                    // Retrieve Async data for lesson id in input        
                    $http({ method: 'GET', url: DisciturSettings.apiUrl + 'lesson/' + inputParams.id + '/ratings', cache: true })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result) {
                                deferred.resolve(_ratingsArrayTransfer(result))
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error for getting ratings on lesson id:'+ inputParams.id + ' -> " + data);
                            });
                    // create deferring result
                    return deferred.promise;
                },
                // Save Async User Rating
                createRating: function (rating) {
                    DiscUtil.validateInput(
                        'LessonService.createRating',       // function name for logging purposes
                        new RatingDTO(),                  // hashmap to check inputParameters e set default values
                        rating                            // actual input params
                        );
                    // create deferring result
                    var deferred = $q.defer();

                    // Retrieve Async data for lesson id in input        
                    $http({ method: 'POST', url: DisciturSettings.apiUrl + 'lesson/' + rating.lessonId + '/rating', data: rating })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result) {
                                // if success, clear cache of getRatings
                                $cacheFactory.get('$http').remove(DisciturSettings.apiUrl + 'lesson/' + rating.lessonId + '/ratings')

                                var _newRating = _ratingTransfer(result);
                                deferred.resolve(_newRating)
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error creating rating on lesson id:" + rating.lessonId + " -> " + data);
                            });
                    // create deferring result
                    return deferred.promise;
                },
                // Save Async User Rating
                updateRating: function (rating) {
                    DiscUtil.validateInput(
                        'LessonService.updateRating',       // function name for logging purposes
                        new RatingDTO(),                  // hashmap to check inputParameters e set default values
                        rating                            // actual input params
                        );
                    // create deferring result
                    var deferred = $q.defer();

                    // Retrieve Async data for lesson id in input        
                    $http({ method: 'PUT', url: DisciturSettings.apiUrl + 'lesson/' + rating.lessonId + '/rating/' + rating.id, data: rating })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result) {
                                // if success, clear cache of getRatings and lesson (ratings update lesson average rating)
                                $cacheFactory.get('$http').remove(DisciturSettings.apiUrl + 'lesson/' + rating.lessonId + '/ratings')
                                $cacheFactory.get('$http').remove(DisciturSettings.apiUrl + 'lesson/' + rating.lessonId)

                                var _modifiedRating = _ratingTransfer(result);
                                deferred.resolve(_modifiedRating)
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error updating rating on lesson id:" + rating.lessonId + " -> " + data);
                            });
                    // create deferring result
                    return deferred.promise;
                },
                // Delete Async User Comment
                deleteRating: function (rating) {
                    DiscUtil.validateInput(
                        'LessonService.deleteRating',  // function name for logging purposes
                        new RatingDTO(),               // hashmap to check inputParameters e set default values
                        rating                         // actual input params
                        );
                    // create deferring result
                    var deferred = $q.defer();

                    // execute logical delete, updating record state (Api business logic)
                    $http({ method: 'PUT', url: DisciturSettings.apiUrl + 'lesson/' + rating.lessonId + '/rating/' + rating.id + '/delete', data: rating })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result, status) {
                                // I don't understand this...I should go on error callback...
                                if (status >= 200 && status < 300) {
                                    deferred.resolve(rating);
                                }
                                else
                                    deferred.reject("Error deleting comment on lesson id:" + rating.lessonId + " -> " + arguments.toString());
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error deleting comment on lesson id:" + rating.lessonId + " -> " + data);
                            });
                    // create deferring result
                    return deferred.promise;
                },
                // Save Lesson
                update: function (lesson) {
                    DiscUtil.validateInput(
                        'LessonService.update',       // function name for logging purposes
                        new LessonDTO(),            // hashmap to check inputParameters e set default values
                        lesson                      // actual input params
                        );
                    // DTO mappint to API
                    var _lesson = _lessonMap(lesson);
                    // create deferring result
                    var deferred = $q.defer();
                    // Retrieve Async data for lesson id in input        
                    $http({ method: 'PUT', url: DisciturSettings.apiUrl + 'lesson/' + _lesson.LessonId, data: _lesson })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result) {
                                // if success, clear cache 
                                $cacheFactory.get('$http').remove(DisciturSettings.apiUrl + 'lesson/' + _lesson.LessonId)
                                $cacheFactory.get('$http').remove(DisciturSettings.apiUrl + 'lesson?lastNum=' + DisciturSettings.lastLessonsNum)
                                deferred.resolve(_dataTransfer(result))
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error updating lesson id:" + _lesson.lessonId + " -> " + data);
                            });
                    // create deferring result
                    return deferred.promise;
                },
                // Create new Lesson
                create: function (lesson) {
                    DiscUtil.validateInput(
                        'LessonService.create',       // function name for logging purposes
                        new LessonDTO(),            // hashmap to check inputParameters e set default values
                        lesson                      // actual input params
                        );
                    var _lesson = _lessonMap(lesson);

                    // create deferring result
                    var deferred = $q.defer();

                    // Retrieve Async data for lesson id in input        
                    $http({ method: 'POST', url: DisciturSettings.apiUrl + 'lesson', data: _lesson })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result) {
                                $cacheFactory.get('$http').remove(DisciturSettings.apiUrl + 'lesson?lastNum=' + DisciturSettings.lastLessonsNum)
                                deferred.resolve(_dataTransfer(result))
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error creating lesson id:" + _lesson.lessonId + " -> " + data);
                            });
                    // create deferring result
                    return deferred.promise;

                },
                // New LessonDto Factory
                newLesson: function () {
                    return new LessonDTO();
                },
                // get last 5 lessons (summary data)
                getLastLessons: function () {
                    // create deferring result
                    var deferred = $q.defer();

                    // Retrieve Async data for lesson id in input        
                    $http({ method: 'GET', url: DisciturSettings.apiUrl + 'lesson', params: { lastNum: DisciturSettings.lastLessonsNum }, cache: true })
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result) {
                                deferred.resolve(_lessonSummariesTransfer(result));
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error for getLastLessons:" + data);
                            });
                    // create deferring result
                    return deferred.promise;

                }

            };

            return _lessonService;
      }]);;angular.module('disc.lesson')
    .directive('lessonComment', [
        '$rootScope',
        'LabelService',
        'LessonService',
        'AuthService',
        'CommentDTO',
        '$timeout',
        function ($rootScope, LabelService, LessonService, AuthService, CommentDTO, $timeout) {
            return {
                restrict: 'E',
                templateUrl: 'modules/lesson/LessonComment.html',
                replace: true,
                transclude: false,
                scope: {
                    comment: '=?',
                    lessonId: '@',
                    addComment: '&',
                    deleteComment: '&'
                },
                link: function (scope, element, attrs) {
                    //-------- private methods-------

                    // call Label Service to get dynamic labels
                    var _getLabel = function (label) {
                        return LabelService.get('LessonCtrl', label);
                    }

                    //-------- private variables-------
                    var form = element.find('form');

                    //-------- public properties-------
                    scope.local = {
                        commentText: null,
                        commentError: null,
                        UserCommentForm: form.controller('form'),
                        base: angular.isUndefined(scope.comment),
                        isLogged: AuthService.user.isLogged,
                        sameUser: scope.comment ? (scope.comment.author.username == AuthService.user.username) : false,
                        answer: false,
                        edit: false,
                        showDeleteCommentErr: false
                    }

                    scope.labels = {
                        comments: _getLabel('comments'),
                        commentPlaceholder: _getLabel('commentPlaceholder'),
                        commentHelp: _getLabel('commentHelp'),
                        commentAnswer: _getLabel('commentAnswer'),
                        commentEdit: _getLabel('commentEdit'),
                        commentPreview: _getLabel('commentPreview'),
                        commentSave: _getLabel('commentSave'),
                        commentRequired: _getLabel('commentRequired'),
                        commentNotDelete: _getLabel('commentNotDelete'),
                        editTooltip: _getLabel('editTooltip'),
                        deleteTooltip: _getLabel('deleteTooltip')
                    };

                    //-------- public methods-------
                    scope.actions = {
                        // call Sign Modal Dialog to login
                        openSignIn: function () {
                            $rootScope.$broadcast('disc.login', scope.actions)
                        },
                        // save User Comment
                        createComment: function () {
                            // retrieve current form
                            var localForm = scope.local.UserCommentForm;
                            var localTxtArea = localForm.CommentTXT;
                            // check for validation error
                            if (localTxtArea.$valid) {
                                var _comment = new CommentDTO();
                                _comment.lessonId = scope.lessonId;
                                _comment.content = localTxtArea.$modelValue;
                                //_comment.date = new Date();
                                _comment.parentId = scope.comment ? scope.comment.id : null;
                                _comment.level = scope.comment ? scope.comment.level + 1 : 0;
                                _comment.author.userid = AuthService.user.userid;
                                LessonService.createComment(_comment)
                                    .then(function (savedComment) {
                                        //  Parent controll method to add new comment into local lesson's comment array
                                        scope.addComment({ comment: savedComment });
                                        // Reset Aswer textarea
                                        if (!scope.local.base) {
                                            scope.local.answer = false;
                                        }
                                        scope.local.commentText = "";
                                        localForm.$setPristine();
                                    })
                            }
                        },
                        // Edit User Comment
                        updateComment: function () {
                            // retrieve current form
                            var localForm = scope.local.UserEditCommentForm;
                            var localTxtArea = localForm.CommentTXT;
                            // check for validation error
                            if (localTxtArea.$valid) {
                                var _comment = new CommentDTO();
                                angular.extend(_comment, scope.comment);
                                _comment.content = localTxtArea.$modelValue

                                LessonService.updateComment(_comment)
                                    .then(function (modifiedComment) {
                                        //  Parent controll method to add new comment into local lesson's comment array
                                        scope.comment = modifiedComment;
                                        scope.local.edit = false;
                                        localForm.$setPristine();
                                    })
                            }
                        },
                        // Delete User Comment
                        deleteComment: function () {
                            LessonService.deleteComment(scope.comment)
                                .then(
                                    function (deletedComment) {
                                        //  Parent controll method to add new comment into local lesson's comment array
                                        scope.deleteComment({ comment: deletedComment });
                                    },
                                    function (errorData) {
                                        scope.local.showDeleteCommentErr = true;
                                        $timeout(function () { scope.local.showDeleteCommentErr = false }, 5000);
                                    }
                                )
                        },
                        // check for authentication and open/close user comment textarea
                        openUserComment: function () {
                            if (!scope.local.isLogged) {
                                !scope.actions.openSignIn();
                            }
                            scope.local.answer = !scope.local.answer;
                        }
                    }

                    //-------- Initialization -------
                    // Watcher for authentication depending behaviours
                    scope.$watch(function () {
                        return AuthService.user.isLogged;
                    },
                        function () {
                            scope.local.isLogged = AuthService.user.isLogged;
                            scope.local.sameUser = scope.comment ? (scope.comment.author.username == AuthService.user.username) : false;
                        }
                    );

                }
            }
        }
    ]);angular.module('disc.lesson')
    .directive('lessonRating', [
        '$rootScope',
        'LabelService',
        'LessonService',
        'AuthService',
        'RatingDTO',
        '$timeout',
        function ($rootScope, LabelService, LessonService, AuthService, RatingDTO, $timeout) {
            return {
                restrict: 'E',
                templateUrl: 'modules/lesson/LessonRating.html',
                replace: true,
                transclude: false,
                scope: {
                    userRating: '=?',
                    lessonId: '@',
                    addRating: '&',
                    deleteRating: '&'
                },
                link: function (scope, element, attrs) {
                    //-------- private methods-------

                    // call Label Service to get dynamic labels
                    var _getLabel = function (label) {
                        return LabelService.get('LessonRatingDrv', label);
                    }
                    // Initialize New User Rating
                    var setNewUserRating = function () {
                        scope.userRating = new RatingDTO();
                        scope.userRating.lessonId = scope.lessonId;
                        scope.userRating.author.userid = AuthService.user.userid
                        scope.userRating.author.username = AuthService.user.username;
                        scope.userRating.author.image = AuthService.user.image
                        scope.local.sameUser = true;
                        scope.local.edit = true;
                        //scope.local.EditText = "";
                    }

                    //-------- private variables-------
                    var form = element.find('form');

                    //-------- public properties-------
                    scope.local = {
                        ratingText: null,
                        ratingError: null,
                        UserRatingForm: form.controller('form'),
                        newRating: angular.isUndefined(scope.userRating),
                        user: AuthService.user,
                        sameUser: scope.userRating ? (scope.userRating.author.username == AuthService.user.username) : false,
                        edit: false,
                        EditText: "",
                        EditRating: null,
                        showDeleteRatingErr: false,
                        showNoRatingErr: false
                    }

                    scope.labels = {
                        ratings: _getLabel('ratings'),
                        ratingPlaceholder: _getLabel('ratingPlaceholder'),
                        ratingtHelp: _getLabel('ratingtHelp'),
                        ratingEdit: _getLabel('ratingEdit'),
                        ratingPreview: _getLabel('ratingPreview'),
                        ratingSave: _getLabel('ratingSave'),
                        ratingRequired: _getLabel('ratingRequired'),
                        ratingNotDelete: _getLabel('ratingNotDelete'),
                        ratingInput: _getLabel('ratingInput'),
                        editTooltip: _getLabel('editTooltip'),
                        deleteTooltip: _getLabel('deleteTooltip')
                    };

                    //-------- public methods-------
                    scope.actions = {
                        // Save & Update User Rating
                        saveRating: function () {
                            // retrieve current form
                            var localForm = scope.local.UserRatingForm;
                            var localTxtArea = localForm.EditText;
                            // check for validation error
                            if (scope.local.EditRating > 0) {
                                if (scope.local.newRating) {
                                    var _rating = new RatingDTO();
                                    _rating.lessonId = scope.lessonId;
                                    _rating.rating = scope.local.EditRating;
                                    _rating.content = localTxtArea.$modelValue;
                                    _rating.author.userid = AuthService.user.userid;
                                    LessonService.createRating(_rating)
                                        .then(function (savedRating) {
                                            //  Parent controll method to add new Rating into local lesson's Rating array
                                            scope.addRating({ rating: savedRating });
                                            // Reset local Form
                                            localForm.$setPristine();
                                        })
                                }
                                else {
                                    scope.userRating.rating = scope.local.EditRating;
                                    scope.userRating.content = localTxtArea.$modelValue;
                                    LessonService.updateRating(scope.userRating)
                                        .then(function (modifiedRating) {
                                            scope.userRating = modifiedRating;
                                            scope.local.edit = false;
                                            localForm.$setPristine();
                                        })

                                }
                            }
                            else {
                                scope.local.showNoRatingErr = true;
                                $timeout(function () { scope.local.showNoRatingErr = false }, 5000);
                            }
                        },
                        // Delete User Rating
                        deleteRating: function () {
                            LessonService.deleteRating(scope.userRating)
                                .then(
                                    function (deletedRating) {
                                        //  Parent controll method to add new comment into local lesson's comment array
                                        scope.deleteRating({ rating: deletedRating });
                                    },
                                    function (errorData) {
                                        scope.local.showDeleteRatingErr = true;
                                        $timeout(function () { scope.local.showDeleteRatingErr = false }, 5000);
                                    }
                                )
                        },
                        editRating: function () {
                            scope.local.edit = !scope.local.edit;
                            scope.local.EditText = scope.userRating.content;
                            scope.local.EditRating = scope.userRating.rating;
                        }
                    }

                    //-------- Initialization -------
                    // if new Rating and the user is logged in, initialize the form
                    if (scope.local.newRating && scope.local.user.isLogged) {
                        setNewUserRating();
                    }
                    // set the watcher on Authentication properties
                    scope.$watch(
                        //'local.user.isLogged',
                        function () { return scope.local.user.isLogged },
                        function () {
                            if (scope.local.newRating)
                                setNewUserRating();
                            scope.local.sameUser = scope.userRating ? (scope.userRating.author.username == scope.local.user.username) : false;
                        }
                    );
                    

                }
            }
        }
    ]);angular.module('disc.lesson')
    .controller('LessonCtrl', [
        '$scope',
        'LabelService',
        'LessonService',
        '$sce',
        'lessonData',
        '$rootScope',
        'AuthService',
        'CommentDTO',
        'DisciturBaseCtrl',
        '$injector',
        function (
            $scope,
            LabelService,
            LessonService,
            $sce,
            lessonData,
            $rootScope,
            AuthService,
            CommentDTO,
            DisciturBaseCtrl,
            $injector
            ) {
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });

            //-------- private properties -------
            $scope._ctrl = 'LessonCtrl';

            //-------- private methods-------
            /*
            var _getLabel = function (label) {
                return LabelService.get('LessonCtrl', label);
            }
            */
            //-------- public properties-------
            $scope.labels = {
                specifics: $scope.getLabel('specifics'),
                discipline: $scope.getLabel('discipline'),
                school: $scope.getLabel('school'),
                classroom: $scope.getLabel('classroom'),
                author: $scope.getLabel('author'),
                publishedOn: $scope.getLabel('publishedOn'),
                rating: $scope.getLabel('rating'),
                content: $scope.getLabel('content'),
                lessonGoods: $scope.getLabel('lessonGoods'),
                noLessonGoods: $scope.getLabel('noLessonGoods'),
                lessonBads: $scope.getLabel('lessonBads'),
                noLessonBads: $scope.getLabel('noLessonBads'),
                conclusion: $scope.getLabel('conclusion'),
                comments: $scope.getLabel('comments'),
                ratings: $scope.getLabel('ratings'),
                ratingtHelp: $scope.getLabel('ratingtHelp'),
                notPublished: $scope.getLabel('notPublished')
            };

            $scope.local = {
                commentText: null,
                commentError : null,
                commentTexts: [],
                commentErrors: [],
                user: {
                    isLogged: false,
                    userId: false
                }
            }

            //-------- public methods -------
            $scope.actions = {
                /*
                openSignIn: function () {
                    $rootScope.$broadcast('disc.login', $scope.actions)
                },
                ok: function () {
                    //$scope.local.commentText = 'Inserisci il tuo commento'
                    //$scope.local.UserCommentForm.CommentTXT.focus();
                },
                */
                // save User Comment
                saveComment: function (comment) {
                    // retrieve current form
                    var localForm = comment ? $scope.local['UserCommentFormOn' + comment.id] : $scope.local.UserCommentForm;
                    var localTxtArea = localForm.CommentTXT;
                    // check for validation error
                    if (localTxtArea.$valid) {
                        var _comment = new CommentDTO();
                        _comment.lessonId = $scope.lesson.lessonId;
                        _comment.content = localTxtArea.$modelValue;
                        //_comment.date = new Date();
                        _comment.parentId = comment ? comment.id : null;
                        _comment.level = comment ? comment.level + 1 : 0;
                        _comment.author.userid = AuthService.user.userid;
                        LessonService.saveComment(_comment, $scope.lesson.comments)
                            .then(function (savedComment) {
                                $scope.lesson.comments.push(savedComment);
                                // Reset Aswer textarea
                                if (comment) {
                                    comment.anwser = false;
                                    $scope.local.commentTexts[comment.id] = "";
                                }
                                else {
                                    $scope.local.commentText = "";
                                }
                            })
                    }
                },
                // Add the new User Comment to Lesson's Comments array
                addComment: function (comment) {
                    $scope.lesson.comments.push(
                        LessonService.setCommentPrivates(comment, $scope.lesson.comments)
                        );
                },
                // Remove the User Comment from Lesson's Comments array
                deleteComment: function (comment) {
                    var index = -1;
                    for (var i = 0; i < $scope.lesson.comments.length; i++) {
                        if ($scope.lesson.comments[i].id === comment.id)
                            index = i;
                    }
                    if(index>-1)
                        $scope.lesson.comments.splice(index, 1);
                },
                // check for authentication and open/close user comment textarea
                openUserComment: function (comment) {
                    if (!$scope.isLogged) {
                        !$scope.actions.openSignIn();
                    }
                    comment.anwser = !comment.anwser;
                },
                // check if exists user's rating
                userHasVoted : function(){
                    for (var i = 0; i < $scope.lesson.ratings.length; i++) {
                        if ($scope.lesson.ratings[i].author.userid === AuthService.user.userid)
                            return true;
                    }
                    return false;
                },
                // Add the new User Rating to Lesson's Comments array
                addRating: function (rating) {
                    $scope.lesson.ratings.push(rating);
                },
                // Remove the User Comment from Lesson's Comments array
                deleteRating: function (rating) {
                    var index = -1;
                    for (var i = 0; i < $scope.lesson.ratings.length; i++) {
                        if ($scope.lesson.ratings[i].id === rating.id)
                            index = i;
                    }
                    if (index > -1)
                        $scope.lesson.ratings.splice(index, 1);
                }
            }

            //-------- Controller Initialization -------
            $scope.isLogged = AuthService.user.isLogged
            $scope.local.user.isLogged = AuthService.user.isLogged;
            $scope.local.user.userId = AuthService.user.userid;
            $scope.$watch(function () {
                return AuthService.user.isLogged;
            },
                function () {
                    $scope.isLogged = AuthService.user.isLogged;
                    $scope.local.user.isLogged = AuthService.user.isLogged;
                    $scope.local.user.userId = AuthService.user.userid;
                }
            );

            /***** model initialization ****/
            // lesson data async
            var currentLesson = lessonData;
            $scope.lesson = currentLesson;
            //$scope.lesson.content = $sce.trustAsHtml(currentLesson.content);
            // Users Comments
            $scope.lesson.comments = [];
            LessonService.getComments({ id: $scope.lesson.lessonId })
                .then(function (comments) { $scope.lesson.comments = comments; }) // success
            // Users Ratings
            $scope.lesson.ratings = [];
            LessonService.getRatings({ id: $scope.lesson.lessonId })
                .then(function (ratings) { $scope.lesson.ratings = ratings; }) // success


            //var _watchers = null;

            /*
            var _detachStaticWatchers = $scope.$watch(function () {
                // first digest cycle: find static watchers
                if (_watchers == null) {
                    _watchers = [];
                    var _reLabels = /^{{labels\.\w+}}$/
                    for (var i = $scope.$$watchers.length - 1; i >= 0; i--) {
                        console.log($scope.$$watchers[i].exp.exp)
                        if ($scope.$$watchers[i].exp &&
                            $scope.$$watchers[i].exp.exp &&
                            _reLabels.test($scope.$$watchers[i].exp.exp)) {
                            _watchers.push(i);
                        }
                    }
                }
                    // second digest cycle: remove static watchers
                else {
                    for (var i = 0; i < _watchers.length; i++) {
                        console.log($scope.$$watchers[_watchers[i]]);
                        $scope.$$watchers.splice(_watchers[i], 1);
                    }
                    _detachStaticWatchers();
                }
                console.log($scope.$$watchers);
            })
            */


        }
    ]);
;angular.module('disc.lesson')
    .controller('LessonSideBarCtrl', [
        '$scope',
        'AuthService',
        '$state',
        'lessonData',
        'lastLessonList',
        'DisciturBaseCtrl',
        '$injector',
        function (
            $scope,
            AuthService,
            $state,
            lessonData,
            lastLessonList,
            DisciturBaseCtrl,
            $injector
             ) {
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });

            //-------- private properties -------
            $scope._ctrl = 'LessonSideBarCtrl';

            //--------- public properties ------
            $scope.labels = {
                lastLessonsTitle: $scope.getLabel('lastLessonsTitle'),
                editLessonButton: $scope.getLabel('editLessonButton')
            };

            $scope.local = {
                user: AuthService.user,
                lesson: lessonData,
                lastLessonList: lastLessonList
            }

            //-------- public method -------
            $scope.actions = {
                editLesson: function () {
                    //console.log(lessonData)
                    // set inherit option to false to avoid conflict with parameters in URL set by advancedSearch
                    $state.go('lessonEdit', { lessonId: lessonData.lessonId }, { inherit: false });
                }
            }

            //--------- Controller initialization ------            
        }
    ]);
;angular.module('disc.lesson')
    .controller('Lesson404Ctrl', [
        '$scope',
        'LabelService',
        function (
            $scope,
            LabelService) {
            /***** label initialization ****/
            _getLabel = function (label) {
                return LabelService.get('Lesson404Ctrl', label);
            }

            $scope.labels = {
                noLessonIdFound: _getLabel('noLessonIdFound')
            };
            
            console.log('404 Controller')
        }
    ]);;angular.module('disc.lesson')
    .controller('LessonListCtrl', [
        '$scope',
        'LabelService',
        'lessonsData',
        'LessonService',
        '$state',
        function (
            $scope,
            LabelService,
            lessonsData,
            LessonService,
            $state
            ) {
            //-------- $scope properties ----
            $scope.labels;
            $scope.lessons;
            $scope.totalLessons;
            $scope.currentPage;
            $scope.pageSize;

            //-------- private method -------
            var _getLabel = function (label) {
                return LabelService.get('LessonListCtrl', label);
            }
            var _setPageData = function (lessonsPage) {
                $scope.lessons = lessonsPage.lessons;
                $scope.totalLessons = lessonsPage.count
                $scope.currentPage = (lessonsPage.startRow - lessonsPage.startRow % lessonsPage.pageSize) / lessonsPage.pageSize + 1
                $scope.pageSize = lessonsPage.pageSize
            }
            //-------- public method -------
            // Invoke search service for paging through state transition to preserve paging history
            // the state transition is forced cause the same params could be used in previous navigations
            $scope.getPage = function (pager) {
                $state.go('lessonSearch', LessonService.getPage(pager), { reload: true })               
            }

            //--------- model initialization ------
            $scope.labels = {
                publishedOn: _getLabel('publishedOn'),
                viewMore: _getLabel('viewMore'),
                noLessonFound: _getLabel('noLessonFound'),
                notPublished: _getLabel('notPublished')
            };

            _setPageData(lessonsData)
        }
    ]);
;angular.module('disc.lesson')
    .controller('LessonSearchCtrl', [
        '$scope',
        'LabelService',
        '$state',
        '$modal',
        function (
            $scope,
            LabelService,
            $state,
            $modal
            ) {
            //--------- Controller private methods ------
            _getLabel = function (label) {
                return LabelService.get('LessonSearchCtrl', label);
            }
            //--------- Controller public methods ------
            ///search
            ///@desc: change state to lessonSearch with keyword param (to preserve navigation history)
            ///old
            ///@desc: broadcast globally LessonSearchEvent with keyword in form input in 'lessonNews' or 'lessonSearch' state, 
            ///        otherwise change state to lessonSearch with keyword param
            $scope.search = function () {
                // set inherit option to false to avoid conflict with parameters in URL set by advancedSearch
                $state.go('lessonSearch', { keyword: $scope.keyword }, { inherit: false });
                //$scope.viewAdvSearch = false;
                $scope.keyword = null;
                // If I don't want to preserve search/paging history navigation when the landing state is lessonSearch
                // I could use the following code, which doesn't change state transition (just event global broadcasting)
                /*
                if ($state.is('lessonNews') || $state.is('lessonSearch'))
                    $rootScope.$broadcast('LessonSearchEvent', { keyword: $scope.keyword })
                else
                    $state.go('lessonSearch', { keyword: $scope.keyword })
                */
            };


            $scope.openAdvSearch = function () {
                var modalInstance = $modal.open({
                    backdrop: true,
                    windowClass: 'modal',
                    templateUrl: 'LessonAdvSearch',
                    controller: 'LessonAdvSearchCtrl'
                });

                modalInstance.result.then(function (selectedItem) {
                    //$scope.selected = selectedItem;
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            }

            //--------- model initialization ------
            $scope.labels = {
                keywordPlaceholder: _getLabel('keywordPlaceholder'),
                searchButton: _getLabel('searchButton'),
                advancedSearchButton: _getLabel('advancedSearchButton')
            };
            $scope.keyword;
        }
    ]);;angular.module('disc.lesson')
    .controller('LessonAdvSearchCtrl', [
        '$scope',
        '$modalInstance',
        'LabelService',
        'LessonService',
        '$state',
        function (
            $scope,
            $modalInstance,
            LabelService,
            LessonService,
            $state
            ) {
            //--------- Controller private methods ------
            _getLabel = function (label) {
                return LabelService.get('LessonAdvSearchCtrl', label);
            }
            //--------- Controller public methods ------   
            $scope.getDisciplines = function (q) {
                return LessonService.getDisciplines(q);
                //return LessonService.getDistinctValues('discipline', { disciplineQ: q });
            }

            $scope.getSchools = function (q) {
                return LessonService.getSchools(q);
                //return LessonService.getDistinctValues('school', { schoolQ: q });
            }

            $scope.getClassRooms = function (q) {
                return LessonService.getClassRooms(q);
                //return LessonService.getDistinctValues('classroom', { classroomQ: q });
            }

            $scope.getTags = function (q) {
                return LessonService.getTags(q);
                //return LessonService.getDistinctValues('tag', { tagQ: q });
            }

            $scope.addSearchedTag = function () {
                $scope.local.searchedTags.push($scope.local.tag);
                $scope.local.tag = null
            }

            $scope.selectTag = function () {
                $scope.addSearchedTag();
            }

            $scope.select = function (err) {
                $scope.local.errors[err] = false;
            }

            $scope.hoveringOver = function (value) {
                $scope.local.overStar = value;
            };

            $scope.ok = function () {
                $modalInstance.close(0);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };            

            $scope.advSearch = function () {
                if ($scope.local.searchForm.$valid) {
                    $state.go('lessonSearch',
                        {
                            keyword: $scope.local.keyword,
                            discipline: $scope.local.discipline,
                            school: $scope.local.school,
                            classroom: $scope.local.classroom,
                            rate: $scope.local.rate > 0 ? $scope.local.rate : null,
                            tags: $scope.local.searchedTags.length == 0 ? null : $scope.local.searchedTags.join()
                        },
                        {inherit : false});
                    $scope.local.keyword = null;
                    $scope.local.discipline = null;
                    $scope.local.school = null
                    $scope.local.classroom = null;
                    $scope.ok();
                }
                else {
                    if ($scope.local.searchForm.discipline.$invalid)
                        $scope.local.errors.discipline = true;
                    if ($scope.local.searchForm.school.$invalid)
                        $scope.local.errors.school = true;
                    if ($scope.local.searchForm.classroom.$invalid)
                        $scope.local.errors.classroom = true;
                }
            };

            //--------- model initialization ------
            // Modal Dialog is inherited scope, so it's important to set internal object, 
            // otherwhise Javascript search properties in parent scope if not exists in this scope
            // very very very important for form validation!! (https://github.com/angular-ui/bootstrap/issues/969)
            $scope.local = {
                keyword: null,
                discipline: null,
                school: null,
                classroom: null,
                rate: 0,
                searchedTags: [],
                tag: null,
                searchForm: {},
                showErrors: false,
                errors: {
                    discipline: false,
                    school: false,
                    classroom: false
                }
            };

            $scope.labels = {
                advKeyword: _getLabel('advKeyword'),
                discipline: _getLabel('discipline'),
                school: _getLabel('school'),
                classroom: _getLabel('classroom'),
                rating: _getLabel('rating'),
                tag: _getLabel('tag'),
                cancel: _getLabel('cancel'),
                buttonAdd: _getLabel('buttonAdd'),
                buttonDel: _getLabel('buttonDel'),
                searchButton: _getLabel('searchButton'),
                advancedSearchButton: _getLabel('advancedSearchButton'),
                validationError: _getLabel('validationError')
            };
        }
    ]);

;angular.module('disc.lesson')
    .controller('LessonListSideBarCtrl', [
        '$scope',
        'DisciturBaseCtrl',
        '$injector',
        'AuthService',
        '$state',
        'lastLessonList',
        function (
            $scope,
            DisciturBaseCtrl,
            $injector,
            AuthService,
            $state,
            lastLessonList
            ) {
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });

            //-------- private properties -------
            $scope._ctrl = 'LessonListSideBarCtrl';
            //-------- private method -------

            //--------- public properties ------
            $scope.labels = {
                lastLessonsTitle: $scope.getLabel('lastLessonsTitle'),
                newLessonButton: $scope.getLabel('newLessonButton')
            };

            $scope.local = {
                user: AuthService.user,
                lastLessonList: lastLessonList
            }
            //-------- public method -------
            $scope.actions = {
                newLesson: function () {
                    // set inherit option to false to avoid conflict with parameters in URL set by advancedSearch
                    $state.go('lessonEdit');                    
                }
            }
        }
    ]);
;angular.module('disc.lesson')
    .controller('LessonEditCtrl', [
        '$scope',
        //'LabelService',
        'AuthService',
        'lessonData',
        'LessonService',
        '$state',
        'DisciturBaseCtrl',
        '$injector',
        'DisciturSettings',
        function (
            $scope,
            //LabelService,
            AuthService,
            lessonData,
            LessonService,
            $state,
            DisciturBaseCtrl,
            $injector,
            DisciturSettings
            ) {
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });

            //-------- private properties -------
            $scope._ctrl = 'LessonEditCtrl';

            //-------- private methods -------
            var _initViewHelp = function () {
                // get viewHelp setting from localStorage
                // otherwise set initial viewHelp setting to default value (true).
                var _viewHelp = localStorage.getItem(DisciturSettings.viewHelp);
                if(_viewHelp !== null)
                    $scope.local.viewHelp = $scope.$eval(_viewHelp);
                else
                    localStorage.setItem(DisciturSettings.viewHelp, $scope.local.viewHelp);
            }

            //--------- public properties ------
            $scope.labels = {
                lessonTitleHeading: $scope.getLabel('lessonTitleHeading'),
                lessonTitle: $scope.getLabel('lessonTitle'),
                specifics: $scope.getLabel('specifics'),
                discipline: $scope.getLabel('discipline'),
                school: $scope.getLabel('school'),
                classroom: $scope.getLabel('classroom'),
                tags: $scope.getLabel('tags'),
                author: $scope.getLabel('author'),
                publishedOn: $scope.getLabel('publishedOn'),
                rating: $scope.getLabel('rating'),
                content: $scope.getLabel('content'),
                lessonGoods: $scope.getLabel('lessonGoods'),
                noLessonGoods: $scope.getLabel('noLessonGoods'),
                lessonBads: $scope.getLabel('lessonBads'),
                noLessonBads: $scope.getLabel('noLessonBads'),
                conclusion: $scope.getLabel('conclusion'),
                comments: $scope.getLabel('comments'),
                ratings: $scope.getLabel('ratings'),
                ratingtHelp: $scope.getLabel('ratingtHelp'),
                saveLessonButton: $scope.getLabel('saveLessonButton'),
                cancelButton: $scope.getLabel('cancelButton'),
                publicLesson: $scope.getLabel('publicLesson'),
                buttonAdd: $scope.getLabel('buttonAdd'),
                buttonDel: $scope.getLabel('buttonDel'),
                requiredField: $scope.getLabel('requiredField'),
                showHideHelp: $scope.getLabel('showHideHelp'),
                helpTitle: $scope.getLabel('helpTitle'),
                helpSpecifics: $scope.getLabel('helpSpecifics'),
                helpTags: $scope.getLabel('helpTags'),
                helpContent: $scope.getLabel('helpContent'),
                helpFeedbacks: $scope.getLabel('helpFeedbacks'),
                helpConclusion: $scope.getLabel('helpConclusion'),
                addItem: $scope.getLabel('addItem')
            };

            $scope.model = {
                content: null,
                tinymceoptions: {
                    plugins: [
                        "advlist autolink lists link image charmap print preview anchor",
                        "searchreplace visualblocks code fullscreen",
                        "insertdatetime media table contextmenu paste image"
                    ],
                    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
                }
            }

            $scope.local = {
                lesson: lessonData,
                user: AuthService.user,
                tag: null,
                lessonGood: null,
                lessonBad: null,
                searchedTags: [],
                editForm: {},
                isToolBarVisible: function () {
                    if ($scope.local.user.isLogged) {
                        return $scope.local.lesson.lessonId ? $scope.local.user.username == $scope.local.lesson.author.username : true;
                    }
                    else
                        return false;
                },
                isFieldRequired : function(fieldName){
                    return $scope.local.editForm[fieldName].$invalid && ($scope.local.editForm[fieldName].$dirty || $scope.local.editForm.submitted)
                },
                viewHelp: true
            }


            //-------- public methods -------

            $scope.actions = {
                // custom filter to select object with status prop != 'C' (Not Canceled)
                filterByActiveStatus: function (feedback) {
                    return feedback.status != 'C';
                },
                // get existant tags value searched by input
                getTags: function (q) {
                    return LessonService.getTags(q);
                },
                // get existant Disciplines value searched by input
                getDisciplines: function (q) {
                    return LessonService.getDisciplines(q);
                },
                // get existant schools value searched by input
                getSchools: function (q) {
                    return LessonService.getSchools(q);
                },
                // get existant classroom value searched by input
                getClassRooms: function (q) {
                    return LessonService.getClassRooms(q);
                },
                // Select and add new Tag to the Lesson
                selectTag: function () {
                    //$scope.actions.addSearchedTag();
                    if ($scope.local.tag != null && $scope.local.tag != "") {
                        // Tag Array not modified if tag already exists
                        for (var i = 0; i < $scope.local.lesson.tags.length; i++)
                            if ($scope.local.lesson.tags[i] === $scope.local.tag)
                                return;
                        // add new tag
                        $scope.local.lesson.tags.push({lessonId:$scope.local.lesson.lessonId, content:$scope.local.tag, status:'A'});
                        $scope.local.lesson.tags.status = 'M'; // Modified
                        $scope.local.tag = null;
                    }

                },
                // Remove Tag
                removeTag: function (ref) {
                    $scope.local.lesson.tags[ref].status = 'C'; // bad feedback Canceled
                },
                // Add new Good Feedback
                addGood: function () {
                    if ($scope.local.lessonGood != "" && $scope.local.lessonGood != null) {
                        // lessonGood Array is not modified if lessonGood already exists
                        for (var i = 0; i < $scope.local.lesson.goods.length; i++)
                            if ($scope.local.lesson.goods[i].content === $scope.local.lessonGood)
                                return;
                        $scope.local.lesson.goods.push({ id: null, content: $scope.local.lessonGood, status: 'A' }); // Added
                        $scope.local.lessonGood = null;
                    }
                },
                // Edit Good Feedback
                editGood: function (ref) {
                    if($scope.local.lesson.goods[ref].status == 'I')
                       $scope.local.lesson.goods[ref].status = 'M'; // good feedback Modified
                },
                // Remove Good Feedback
                removeGood: function (ref) {
                    $scope.local.lesson.goods[ref].status = 'C'; // good feedback Canceled
                    //$scope.local.lesson.goods.splice(ref, 1)
                },
                // Add new Bad Feedback
                addBad: function () {
                    if ($scope.local.lessonBad != "" && $scope.local.lessonBad != null) {
                        // lessonBad Array is not modified if lessonBad already exists
                        for (var i = 0; i < $scope.local.lesson.bads.length; i++)
                            if ($scope.local.lesson.bads[i].content === $scope.local.lessonBad)
                                return;
                        //$scope.local.lesson.bads.push($scope.local.lessonBad);
                        $scope.local.lesson.bads.push({ id: null, content: $scope.local.lessonBad, status: 'A' }); // Added
                        $scope.local.lessonBad = null;
                    }
                },
                // Edit Bad Feedback
                editBad: function (ref) {
                    if ($scope.local.lesson.bads[ref].status == 'I')
                        $scope.local.lesson.bads[ref].status = 'M'; // bad feedback Modified
                },
                // Remove Bad Feedback
                removeBad: function (ref) {
                    $scope.local.lesson.bads[ref].status = 'C'; // bad feedback Canceled
                    //$scope.local.lesson.bads.splice(ref, 1)
                },
                // Save Lesson
                saveLesson: function () {
                    $scope.local.editForm.submitted = true;
                    if ($scope.local.editForm.$valid) {
                        //console.log($scope.local.lesson);
                        $scope.local.lesson.author = $scope.local.user;
                        $scope.local.lesson.lastModifUser = $scope.local.user.username;

                        if (!$scope.local.lesson.lessonId){
                            $scope.local.lesson.lessonId = 0;
                            LessonService.create($scope.local.lesson)
                                .then(function (data) {// success
                                    $state.go('lessonDetail', { lessonId: data.lessonId }, { inherit: false });
                                })
                        }
                        else {
                            LessonService.update($scope.local.lesson)
                                .then(function (data) {// success
                                    $state.go('lessonDetail', { lessonId: data.lessonId }, { inherit: false });
                                })
                        }

                    }
                },
                // Cancel editing operation
                cancelEditing: function () {
                    // set inherit option to false to avoid conflict with parameters in URL set by advancedSearch
                    if ($scope.local.lesson.lessonId > 0)
                        $state.go('lessonDetail', { lessonId: lessonData.lessonId }, { inherit: false });
                    else
                        $state.go('lessonSearch', { keywod: ''}, { inherit: false });
                },
                // Show/Hide View Help setting
                showHideHelp: function () {
                    //localStorage.removeItem(DisciturSettings.viewHelp);
                    $scope.local.viewHelp = !$scope.local.viewHelp;
                    localStorage.setItem(DisciturSettings.viewHelp, $scope.local.viewHelp);
                }

            }

            //--------- Controller initialization ------
            _initViewHelp();

            $scope.$watch(function () {
                return AuthService.user.isLogged;
            },
                function (isLogged) {
                    if (!isLogged)
                        $state.go('lessonSearch', { keyword: '' }, { inherit: false });
                }
            );

        }
    ]);
;angular.module('disc.user')
    // Constructor to create User Object
    .factory('UserDTO', function () {
        function UserDTO() {
            this.userid = null;
            this.name = null;
            this.surname = null;
            this.username = null;
            this.image = null;
            this.email = null;
            this.roles = [];
            this.isLogged = null;
        }
        return (UserDTO);
    })
    // User Authentication Service
    .factory('AuthService', [
        '$http',
        '$q',
        'DiscUtil',
        'DisciturSettings',
        'UserDTO',
        'LabelService',
        function ($http, $q, DiscUtil, DisciturSettings, UserDTO, LabelService) {
            //-------- private methods -------

            // encode message with CriptoJS
            var _encode = function (message) {
                var key = CryptoJS.enc.Utf8.parse(DisciturSettings.criptoKey);
                var iv = CryptoJS.enc.Utf8.parse(DisciturSettings.criptoKey);
                var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(message), key,
                    {
                        keySize: 128 / 8,
                        iv: iv,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    });

                return String(encrypted);
            }
            // decode message with CriptoJS
            var _decode = function (encryptedMessage) {
                //var key = CryptoJS.enc.Utf8.parse('7061737323313233');
                //var iv = CryptoJS.enc.Utf8.parse('7061737323313233');
                var key = CryptoJS.enc.Utf8.parse(DisciturSettings.criptoKey);
                var iv = CryptoJS.enc.Utf8.parse(DisciturSettings.criptoKey);

                var decrypted = CryptoJS.AES.decrypt(encryptedMessage, key, {
                    keySize: 128 / 8,
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });
                
                return String(decrypted);
            }
            // User data transfer from API
            var _setUserData = function (apiData) {
                var _user = new UserDTO();
                _user.userid = apiData.UserId;
                _user.name = apiData.Name;
                _user.surname = apiData.Surname;
                _user.username = apiData.UserName || apiData.userName;
                _user.image = apiData.Picture;
                _user.email = apiData.Email;
                _user.isLogged = true;
                return _user;
            }
            // clear User information after Logout
            var _setUserLoginOutData = function () {
                var _user = new UserDTO();
                angular.extend(_user, { isLogged: false })
                return _user;
            }
            // store token in localStorage if passed, otherwise clear localStorage
            var _setToken = function (token) {
                if (!token) {
                    localStorage.removeItem(DisciturSettings.authToken);
                } else {
                    localStorage.setItem(DisciturSettings.authToken, token);
                }
            };
            // get token from server
            var _loadToken = function (inputParams) {
                DiscUtil.validateInput(
                    'UserService._loadToken',   // function name for logging purposes
                    {                          // hashmap to check inputParameters
                        username: null,
                        password: null
                    },
                    inputParams                 // actual input params
                );

                var encodedData = {
                    username: inputParams.username,
                    password: _encode(inputParams.password),
                    grant_type: 'password'
                }

                // create deferring result
                var deferred = $q.defer();

                $http.post(DisciturSettings.apiUrl + 'Token', $.param(encodedData))
                    .success(function (result) {
                        // Set Auth Token to send to server requests
                        if (result.access_token) {
                            _setToken(result.access_token);
                            deferred.resolve(result);
                        }
                        else {
                            var _authErr = {
                                code: result.error,
                                description: result.error_description,
                                status: status
                            }
                            deferred.reject(_authErr);
                        }
                    })
                    .error(function (error, status) {
                        var _authErr = LabelService.apiErrorCode(error.error);
                        /*
                        var _authErr = {
                            code: error.error || "invalid_grant",
                            description: error.error_description || "The user name or password is incorrect.",
                            status: status
                        }
                        */
                        deferred.reject(_authErr);
                    });


                return deferred.promise;

            };
            // mapping user to api
            var _userMap = function (user) {
                var data2api = {};
                data2api.UserId = user.userid;
                data2api.Name = user.name;
                data2api.Surname = user.surname;
                data2api.UserName = user.username;
                data2api.Email = user.email;
                return data2api;
            }

            var _authService = {
                //-------- public properties-------
                // User Object: injected in every controller needing authentication features
                user: angular.extend(new UserDTO(), { isLogged: false }),
                //-------- public methods-------
                // do Authentication and loads User information
                login: function (inputParams) {
                    DiscUtil.validateInput(
                        'UserService.login',   // function name for logging purposes
                        {                      // hashmap to check inputParameters
                            username: null,
                            password: null
                        },
                        inputParams            // actual input params
                    );

                    // create deferring result
                    var deferred = $q.defer();
                    // do server-side login and get authorization token
                    _loadToken(inputParams).then(
                        function () { //success
                            // get user Info to populate user object client-side
                            _authService.getUserInfo().then( 
                                            function (successData) {
                                                deferred.resolve(successData);
                                            },
                                            function (errorData) {
                                                deferred.reject(errorData);
                                            })
                        },
                        function (error, status) {
                            deferred.reject(error);
                        });

                    return deferred.promise;
                },
                // unload user information and become Anonymous
                logout: function () {
                    // No input validation needed
                    //DiscUtil.validateInput('UserService.logout', {}, {});
                    // create deferring result
                    var deferred = $q.defer();
                    // remove Auth Token
                    _setToken(null);
                    // unload current user data
                    var _user = _setUserLoginOutData();
                    //angular.extend(_authService.user, _user);
                    //angular.copy(_authService.user, {});
                    //angular.extend(_authService.user, _user);

                    angular.copy(_user, _authService.user);
                    deferred.resolve(_authService.user)
                    return deferred.promise;
                },
                // read and set user information on User Object
                getUserInfo: function () {
                    // No input validation needed
                    //DiscUtil.validateInput('UserService.getUserInfo', {}, {});
                    // create deferring result
                    var deferred = $q.defer();

                    // Retrieve Async data CurrentUser        
                    // For actual implementation of OAuth Middleware Provider, the parameters must be passed in querystring format
                    // http://stackoverflow.com/questions/19645171/how-do-you-set-katana-project-to-allow-token-requests-in-json-format
                    $http.get(DisciturSettings.apiUrl + 'Account/UserInfo')
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result, status) {
                                var _user = _setUserData(result);
                                //angular.extend(_authService.user, _user);
                                angular.copy(_user, _authService.user);

                                deferred.resolve(_authService.user);
                            })
                        .error(
                            // Error Callback
                            function (error, status) {
                                // remove Auth Token
                                _setToken(null);
                                // unload current user data
                                var _user = _setUserLoginOutData();
                                //angular.extend(_authService.user, _user);
                                angular.copy(_user, _authService.user);

                                var _authErr = {
                                    code: status,
                                    description: error.Message ? error.Message : error,
                                    status: status
                                }
                                deferred.reject(_authErr);
                            });
                    return deferred.promise;
                },
                // register user and get authorization token
                signup: function (inputParams) {
                    DiscUtil.validateInput(
                        'UserService.signup',   // function name for logging purposes
                        {                      // hashmap to check inputParameters
                            name: null,
                            surname: null,
                            email: null,
                            username:null,
                            password: null
                        },
                        inputParams            // actual input params
                    );

                    var deferred = $q.defer();
                    // encode password before sending to web api
                    var encodedInput = {};
                    angular.copy(inputParams, encodedInput);
                    encodedInput.password = _encode(inputParams.password);

                    $http.post(DisciturSettings.apiUrl + 'Account/Register', encodedInput)
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result) {
                                // server-2-client mapping
                                var _user = _setUserData(result);
                                angular.copy(_user, _authService.user);
                                deferred.resolve(_authService.user);
                            })
                        .error(
                            // Error Callback
                            function (error, status) {
                                var _authErr = LabelService.apiError(error);
                                deferred.reject(_authErr);
                            });
                    return deferred.promise;
                },
                // initialize Authentication data
                resolveAuth: function () {
                    // create deferring result
                    var deferred = $q.defer();
                    // get security token from local storage
                    var _token = localStorage.getItem(DisciturSettings.authToken);
                    if (_token) {
                        _authService.getUserInfo().then(
                            function (user) { deferred.resolve(user); },
                            function (data) { deferred.reject(data); }
                            )
                    }
                    else
                        deferred.resolve(_authService.user);

                    return deferred.promise;
                },
                // retrieve password by Username
                retrievePassword: function (inputParams) {
                    DiscUtil.validateInput(
                        'UserService.retrievePassword', // function name for logging purposes
                        {                               // hashmap to check inputParameters
                            username: null
                        },
                        inputParams                     // actual input params
                    );

                    var deferred = $q.defer();
                    $http.get(DisciturSettings.apiUrl + 'Account/ResetPassword', { params: { UserName: inputParams.username } })
                        .success(
                            function (result, status) {
                                deferred.resolve(result);
                            })
                        .error(
                            function (error, status) {
                                var _authErr = {
                                    code: error.Message,
                                    description: error.ModelState[""][0],
                                    status: status
                                }
                                deferred.reject(_authErr);
                            });
                    return deferred.promise;
                },
                // changePassword
                changePassword: function (inputParams) {
                    DiscUtil.validateInput(
                        'UserService.changePassword',   // function name for logging purposes
                        {                               // hashmap to check inputParameters
                            password: null,
                            newPassword: null,
                            confirmPassword: null
                        },
                        inputParams                     // actual input params
                    );
                    // encode passwords before sending to web api
                    var encodedInput = {
                        OldPassword: _encode(inputParams.password),
                        NewPassword: _encode(inputParams.newPassword),
                        ConfirmPassword: _encode(inputParams.confirmPassword)
                    };

                    var deferred = $q.defer();
                    $http.post(DisciturSettings.apiUrl + 'Account/ChangePassword', encodedInput)
                        .success(
                            function (result, status) {
                                deferred.resolve(result);
                            })
                        .error(
                            function (error, status) {
                                var _authErr = {
                                    code: error.Message,
                                    description: error.ModelState[""][0],
                                    status: status
                                }
                                deferred.reject(_authErr);
                            });
                    return deferred.promise;

                },
                // Update user data
                update: function (user) {
                    DiscUtil.validateInput(
                        'UserService.update',       // function name for logging purposes
                        new UserDTO(),              // hashmap to check inputParameters e set default values
                        user                      // actual input params
                        );
                    // DTO mappint to API
                    var _user = _userMap(user);
                    // create deferring result
                    var deferred = $q.defer();
                    // Retrieve Async data for lesson id in input        
                    $http.put(DisciturSettings.apiUrl + 'User', _user)
                        .success(
                            // Success Callback: Data Transfer Object Creation
                            function (result) {
                                var _user = _setUserData(result);
                                //angular.extend(_authService.user, _user);
                                angular.copy(_user, _authService.user);
                                deferred.resolve(_authService.user);
                            })
                        .error(
                            // Error Callback
                            function (data) {
                                deferred.reject("Error updating user id:" + user.id + " -> " + data);
                            });
                    // create deferring result
                    return deferred.promise;

                },
                // Activate user account
                activate: function (inputParams) {
                    DiscUtil.validateInput(
                        'UserService.activate',   // function name for logging purposes
                        {                         // hashmap to check inputParameters
                            username: null,
                            key: null
                        },
                        inputParams               // actual input params
                    );

                    var deferred = $q.defer();
                    $http.post(DisciturSettings.apiUrl + 'Account/Activate', inputParams)
                        .success(
                            function (result, status) {
                                deferred.resolve(result);
                            })
                        .error(
                            function (error, status) {
                                var _authErr = {
                                    code: error.Message,
                                    //description: error.ModelState[""][0],
                                    status: status
                                }
                                deferred.reject(_authErr);
                            });
                    return deferred.promise;

                },
                // check fo email existance (NOT USED)
                checkEmail: function (inputParams) {
                    DiscUtil.validateInput(
                        'UserService.checkEmail', // function name for logging purposes
                        {                         // hashmap to check inputParameters
                            email: null
                        },
                        inputParams               // actual input params
                    );

                    var deferred = $q.defer();
                    $http.get(DisciturSettings.apiUrl + 'User/anyEmail', { params: inputParams })
                        .success(
                            function (result, status) {
                                deferred.resolve(!(result=='true'));
                            })
                        .error(
                            function (error, status) {
                                deferred.resolve(false);
                            });
                    return deferred.promise;
                }
            }

            //-------- Singleton Initialization -------
            // get security token from local storage
            var _token = localStorage.getItem(DisciturSettings.authToken);
            if (_token) {
                _authService.getUserInfo();
            }


            return _authService;
        }
    ])
    // Authentication Intercepor:
    // set Header Authorization Token (if exists)
    .factory('UserAuthInterceptor', [
        '$q',
        'DisciturSettings',
        function ($q, DisciturSettings) {
            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    var _token = localStorage.getItem(DisciturSettings.authToken)
                    if (_token) {
                        config.headers.Authorization = 'Bearer ' + _token;
                        //config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                    }
                    return config || $q.when(config);
                }
            }
        }
    ]);
;angular.module('disc.user')
    .controller('UserNavBar', [
        '$scope',
        '$state',
        '$modal',
        'AuthService',
        'DisciturBaseCtrl',
        '$injector',
        function ($scope, $state, $modal, AuthService, DisciturBaseCtrl, $injector) {
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });

            //-------- private properties -------
            $scope._ctrl = 'UserNavBar';
            var modalInstance;
            //-------- private methods -------

            //-------- public properties ----
            $scope.labels;
            $scope.actions;
            //-------- public methods -------
            $scope.actions = {
                openSignIn: function (actions) {
                    modalInstance = $modal.open({
                        backdrop: true,
                        windowClass: 'modal-signin',
                        templateUrl: 'UserSignIn',
                        controller: 'UserSignInCtrl'
                    });

                    modalInstance.result.then(function (selectedItem) {
                        // login caller callback
                        if (actions && actions.ok)
                            actions.ok();
                    }, function () {
                        console.log('Modal dismissed at: ' + new Date());
                    });
                },
                signOff: function () {
                    AuthService.logout();
                },
                // search Lessons published by the User (for editing purposes)
                searchUserLessons: function () {
                    // set inherit option to false to avoid conflict with parameters in URL set by advancedSearch
                    $state.go('lessonSearch', { publishedBy: $scope.model.username }, { inherit: false });
                },
                userProfile: function () {
                    $state.go('userProfile', null, { inherit: false });
                }
            }
            // Login Event management
            $scope.$on('disc.login', function (event, actions) {
                $scope.actions.openSignIn(actions);
            })

            //--------- model initialization ------
            $scope.labels = {
                userSignIn: $scope.getLabel('userSignIn'),
                userSignOff: $scope.getLabel('userSignOff'),
                userProfile: $scope.getLabel('userProfile'),
                userLessons: $scope.getLabel('userLessons')
            };
            // Authentication user data
            $scope.model = {
                username: AuthService.user.username,
                isLogged: AuthService.user.isLogged
            }
            $scope.$watch(function () { return AuthService.user.isLogged; },
                function () {
                    $scope.model.username = AuthService.user.username;
                    $scope.model.isLogged = AuthService.user.isLogged;
                }
            );
        }
    ]);
;angular.module('disc.user')
    .controller('UserSignInCtrl', [
        '$scope',
        '$modalInstance',
        'AuthService',
        'DisciturBaseCtrl',
        '$injector',
        function (
            $scope,
            $modalInstance,
            AuthService,
            DisciturBaseCtrl,
            $injector
            ) {
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });

            //-------- private properties -------
            $scope._ctrl = 'UserSignInCtrl';

            var _validationErrors = {
                message: '',
                init: function () { this.message = ''; },
                addMessage : function(message){
                    if (this.message != '') {
                        this.message += '<br\>';
                    }
                    this.message += message;
                }
            }

            //-------- public properties ----
            
            // Modal Dialog is inherited scope, so it's important to set internal object, 
            // otherwhise Javascript search properties in parent scope if not exists in this scope
            // very very very important for form validation!! (https://github.com/angular-ui/bootstrap/issues/969)
            $scope.local = {
                username: null,
                password: null,
                user: null,
                SUname: null,
                SUsurname: null,
                SUemail: null,
                SUusername: null,
                SUpassword: null,
                SUconfirmpassword: null,
                errors: {
                    show: false,
                    message: ''
                },
                SUerrors: {
                    show: false,
                    message: ''
                },
                showForgottedPwd: false,
                isCollapsed: true,
                usernamePwd: null,
                errorsPwd: {
                    show: false,
                    message: ''
                },
                sentNewPwd: {
                    show: false,
                    message: ''
                },
                SUSuccess: {
                    show: false
                }

            };

            $scope.labels = {
                username: $scope.getLabel('username'),
                password: $scope.getLabel('password'),
                forgottenPwdHelp: $scope.getLabel('forgottenPwdHelp'),
                sendMail: $scope.getLabel('sendMail'),
                signInTitle: $scope.getLabel('signInTitle'),
                login: $scope.getLabel('login'),
                register: $scope.getLabel('register'),
                loginButtom: $scope.getLabel('loginButtom'),
                passwordNotValid: $scope.getLabel('passwordNotValid'),
                name: $scope.getLabel('name'),
                surname: $scope.getLabel('surname'),
                email: $scope.getLabel('email'),
                confirmPassword: $scope.getLabel('confirmPassword'),
                signupButton: $scope.getLabel('signupButton'),
                requiredUserName: $scope.getLabel('requiredUserName'),
                minLengthUserName: $scope.getLabel('minLengthUserName'),
                requiredPassword: $scope.getLabel('requiredPassword'),
                minLengthPassword: $scope.getLabel('minLengthPassword'),
                requiredName: $scope.getLabel('requiredName'),
                requiredSurname: $scope.getLabel('requiredSurname'),
                requiredEmail: $scope.getLabel('requiredEmail'),
                validEmail: $scope.getLabel('validEmail'),
                serverValidationEmail: 'Esiste già un account associato a questo indirizzo email',
                requiredConfirmPassword: $scope.getLabel('requiredConfirmPassword'),
                minLengthConfirmPassword: $scope.getLabel('minLengthConfirmPassword'),
                matchConfirmPassword: $scope.getLabel('matchConfirmPassword'),
                forgottenPassword: $scope.getLabel('forgottenPassword'),
                signupSuccess: $scope.getLabel('signupSuccess'),
                sentNewPwdEmail: $scope.getLabel('sentNewPwdEmail')
            };

            //-------- private methods -------
            var _validLoginCB = function (data) {
                $scope.local.user = data;
                $scope.actions.ok();
            };
            var _invalidLoginCB = function (error) {
                $scope.local.errors.message = error.description;
                $scope.local.errors.show = true;
            };

            //--------- public methods ------   
            $scope.actions = {
                ok: function () {
                    $modalInstance.close(0);
                },
                cancel: function () {
                    $modalInstance.dismiss('cancel');
                },
                doLogin: function () {
                    if ($scope.local.LoginForm.$valid) {
                        $scope.local.errors.show = false;
                        AuthService.login(
                            {
                                username: $scope.local.username,
                                password: $scope.local.password
                            })
                        .then(_validLoginCB, _invalidLoginCB);
                    }
                    else {
                        if ($scope.local.LoginForm.username.$invalid) {
                            $scope.local.errors.message = ""
                            $scope.local.errors.message += $scope.local.LoginForm.username.$error.required ? $scope.labels.requiredUserName : "";
                            $scope.local.errors.message += $scope.local.LoginForm.username.$error.minlength ? $scope.labels.minLengthUserName : "";
                            $scope.local.errors.show = true;
                        }
                        if ($scope.local.LoginForm.password.$invalid) {
                            $scope.local.errors.message = $scope.labels.minLengthPassword;
                            $scope.local.errors.show = true;
                        }

                    }
                },
                doLogout: function () {
                    AuthService.logout();
                },
                doSignup: function () {
                    if ($scope.local.SignupForm.$valid) {
                        $scope.local.SUerrors.show = false;
                        AuthService.signup(
                            {
                                name: $scope.local.SUname,
                                surname: $scope.local.SUsurname,
                                email: $scope.local.SUemail,
                                username: $scope.local.SUusername,
                                password: $scope.local.SUpassword
                            })
                        .then(
                            function (user) {
                                $scope.local.SUSuccess.show = true;
                            },
                            function (errors) {
                                _validationErrors.init();
                                for (var i = 0; i < errors.length; i++) {
                                    _validationErrors.addMessage(errors[i].description);
                                }
                                $scope.local.SUerrors.message = _validationErrors.message;
                                $scope.local.SUerrors.show = true;
                            }
                        );
                    }
                    else {
                        _validationErrors.init();
                        //_messages = '';
                        if ($scope.local.SignupForm.$invalid) {
                            if ($scope.local.SignupForm.name.$error.required)
                                _validationErrors.addMessage($scope.labels.requiredName);
                            if ($scope.local.SignupForm.surname.$error.required)
                                _validationErrors.addMessage($scope.labels.requiredSurname);
                            if ($scope.local.SignupForm.email.$error.required)
                                _validationErrors.addMessage($scope.labels.requiredEmail);
                            else if ($scope.local.SignupForm.email.$error.email)
                                _validationErrors.addMessage($scope.labels.validEmail);
                            //else if ($scope.local.SignupForm.email.$error.serverCheck)
                            //    _validationErrors.addMessage($scope.labels.serverValidationEmail);
                            if ($scope.local.SignupForm.username.$error.required)
                                _validationErrors.addMessage($scope.labels.requiredUserName);
                            else if ($scope.local.SignupForm.username.$error.minlength)
                                _validationErrors.addMessage($scope.labels.minLengthUserName);
                            if ($scope.local.SignupForm.password.$error.required)
                                _validationErrors.addMessage($scope.labels.requiredPassword);
                            else if ($scope.local.SignupForm.password.$error.minlength)
                                _validationErrors.addMessage($scope.labels.minLengthPassword);
                            if ($scope.local.SignupForm.confirmPassword.$error.required)
                                _validationErrors.addMessage($scope.labels.requiredConfirmPassword);
                            else if ($scope.local.SignupForm.confirmPassword.$error.minlength)
                                _validationErrors.addMessage($scope.labels.minLengthConfirmPassword);
                            else if ($scope.local.SignupForm.confirmPassword.$error.pwmatch)
                                _validationErrors.addMessage($scope.labels.matchConfirmPassword);
                            //TODO: sistemare ed inserire direttive per robustezza pwd e conferma password, univocità username
                            // http://blog.brunoscopelliti.com/angularjs-directive-to-test-the-strength-of-a-password

                            $scope.local.SUerrors.message = _validationErrors.message;
                            $scope.local.SUerrors.show = true;
                        }

                    }
                },
                showRetrievePwd: function () {
                    $scope.local.showForgottedPwd = !$scope.local.showForgottedPwd;
                },
                retrievePassword: function () {
                    $scope.local.errorsPwd.show = false;
                    if ($scope.local.ForgottenPwd.$valid) {
                        AuthService.retrievePassword({ username: $scope.local.usernamePwd }).then(
                            function () {
                                $scope.local.sentNewPwd.message = ""
                                $scope.local.sentNewPwd.message += $scope.labels.sentNewPwdEmail;
                                $scope.local.sentNewPwd.show = true;
                            },
                            function (error) {
                                $scope.local.errorsPwd.message = ""
                                $scope.local.errorsPwd.message += error.description;
                                $scope.local.errorsPwd.show = true;
                            }
                            )
                    }
                    else {
                        $scope.local.errorsPwd.message = ""
                        $scope.local.errorsPwd.message += $scope.local.ForgottenPwd.username.$error.required ? $scope.labels.requiredUserName : "";
                        $scope.local.errorsPwd.message += $scope.local.ForgottenPwd.username.$error.minlength ? $scope.labels.minLengthUserName : "";
                        $scope.local.errorsPwd.show = true;
                    }
                },
                checkEmail: function (email) {
                    console.log("Controlla a server il valore:" + email);
                    return AuthService.checkEmail({ email: email });
                }
            }

        }
    ]);

;angular.module('disc.user')
    .controller('UserProfileCtrl', [
        '$scope',
        'DisciturBaseCtrl',
        '$injector',
        'user',
        'AuthService',
        '$state',
        function (
            $scope,
            DisciturBaseCtrl,
            $injector,
            user,
            AuthService,
            $state
            ) {
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });

            //-------- private properties -------
            $scope._ctrl = 'UserProfileCtrl';
            //-------- private methods -------
            var _validationErrors = {
                message: '',
                init: function () { this.message = ''; },
                addMessage: function (message) {
                    if (this.message != '') {
                        this.message += '<br\>';
                    }
                    this.message += message;
                }
            }

            //--------- public properties ------
            $scope.labels = {
                //userName: $scope.getLabel('userName')
                email: $scope.getLabel('email'),
                changePassword: $scope.getLabel('changePassword'),
                currentPassword: $scope.getLabel('currentPassword'),
                newPassword: $scope.getLabel('newPassword'),
                confirmPassword: $scope.getLabel('confirmPassword'),
                requiredPassword: $scope.getLabel('requiredPassword'),
                minLengthPassword: $scope.getLabel('minLengthPassword'),
                requiredNewPassword: $scope.getLabel('requiredNewPassword'),
                minLengthNewPassword: $scope.getLabel('minLengthNewPassword'),
                requiredConfirmPassword: $scope.getLabel('requiredConfirmPassword'),
                minLengthConfirmPassword: $scope.getLabel('minLengthConfirmPassword'),
                matchConfirmPassword: $scope.getLabel('matchConfirmPassword'),
                changedPassword: $scope.getLabel('changedPassword'),
                confirm: $scope.getLabel('confirm'),
                modify: $scope.getLabel('modify')
            };

            $scope.local = {
                user: user,
                viewedUser : {
                    email : user.email
                },
                errors: {
                    show: false,
                    message:''
                },
                success: {
                    show: false,
                    message: ''
                },
                UpdateUser: {
                    errors: {
                        show: false,
                        message: ''
                    },
                    success: {
                        show: false,
                        message: ''
                    }
                }
            }
            //-------- public methods -------
            $scope.actions = {
                changePassword: function () {
                    if ($scope.local.ChangePwdForm.$valid) {
                        $scope.local.errors.show = false;
                        $scope.local.success.show = false;
                        AuthService.changePassword(
                            {
                                password: $scope.local.currentPassword,
                                newPassword: $scope.local.newPassword,
                                confirmPassword: $scope.local.confirmPassword
                            })
                        .then(
                            function () {
                                _validationErrors.init();
                                $scope.local.currentPassword = "";
                                $scope.local.newPassword = "";
                                $scope.local.confirmPassword = "";
                                $scope.local.success.message = $scope.labels.changedPassword;
                                $scope.local.success.show = true;
                            },
                            function (error) {
                                _validationErrors.init();
                                _validationErrors.addMessage(error.description);
                                $scope.local.errors.message = _validationErrors.message;
                                $scope.local.errors.show = true;
                            }
                        );
                    }
                    else {
                        _validationErrors.init();
                        if ($scope.local.ChangePwdForm.$invalid) {
                            if ($scope.local.ChangePwdForm.password.$error.required)
                                _validationErrors.addMessage($scope.labels.requiredPassword);
                            else if ($scope.local.ChangePwdForm.password.$error.minlength)
                                _validationErrors.addMessage($scope.labels.minLengthPassword);
                            if ($scope.local.ChangePwdForm.newPassword.$error.required)
                                _validationErrors.addMessage($scope.labels.requiredNewPassword);
                            else if ($scope.local.ChangePwdForm.newPassword.$error.minlength)
                                _validationErrors.addMessage($scope.labels.minLengthNewPassword);
                            if ($scope.local.ChangePwdForm.confirmPassword.$error.required)
                                _validationErrors.addMessage($scope.labels.requiredConfirmPassword);
                            else if ($scope.local.ChangePwdForm.confirmPassword.$error.minlength)
                                _validationErrors.addMessage($scope.labels.minLengthConfirmPassword);
                            else if ($scope.local.ChangePwdForm.confirmPassword.$error.pwmatch)
                                _validationErrors.addMessage($scope.labels.matchConfirmPassword);
                            $scope.local.errors.message = _validationErrors.message;
                            $scope.local.errors.show = true;
                        }
                    }

                },
                updateUser: function () {
                    if ($scope.local.UpdateUserForm.$valid) {
                        var updatedUser = {}
                        angular.copy(AuthService.user, updatedUser);
                        updatedUser.email = $scope.local.viewedUser.email;
                        AuthService.update(updatedUser).then(
                            function () {
                                $scope.local.UpdateUser.success.message = "Dati aggiornati con successo.";
                                $scope.local.UpdateUser.success.show = true;
                            },
                            function (error) {
                                $scope.local.UpdateUser.errors.message = error;
                                $scope.local.UpdateUser.errors.show = true;
                            });
                    }
                    else
                        alert("NON VALIDO")
                }
            }

            //--------- Controller initialization ------
            $scope.$watch(function () {
                return $scope.local.user.isLogged;
            },
                function (isLogged) {
                    if (!isLogged)
                        $state.go('lessonSearch', {}, { inherit: false });
                }
            );


        }
    ]);
;angular.module('disc.user')
    .controller('UserActivationCtrl', [
        '$scope',
        'DisciturBaseCtrl',
        '$injector',
        'activation',
        '$state',
        function (
            $scope,
            DisciturBaseCtrl,
            $injector,
            activation,
            $state
            ) {
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });

            //-------- private properties -------
            $scope._ctrl = 'UserActivationCtrl';
            //-------- private methods -------

            //--------- public properties ------
            $scope.labels = {
                activationSuccess: $scope.getLabel('activationSuccess'),
                activationFailed: $scope.getLabel('activationFailed')
            };

            $scope.local = {
                activated : activation.notActive ? false : true
            }
            //-------- public methods -------
            $scope.actions = {
                ok: function () {
                    $state.go('lessonSearch', {}, { inherit: false });
                }
            }


        }
    ]);
;angular.module("discitur",
    [
        'ui.router',
        'ui.bootstrap',
        'disc.settings',
        'disc.common',
        'disc.lesson',
        'disc.user'
    ])
    .config(
    [
        '$stateProvider',
        '$urlRouterProvider',
        '$httpProvider',
        'DisciturSettings',
        function ($stateProvider, $urlRouterProvider, $httpProvider, DisciturSettings) {
            $httpProvider.interceptors.push('LoadingInterceptor');

            $stateProvider
                //MasterPages (Abstract States)
                .state('master', {
                    url: '/',
                    abstract: true,
                    templateUrl: 'masterpages/master.html'
                })
                // One Column Layout (Abstract States)
                .state('master.1cl', {
                    url: '',
                    abstract: true,
                    parent: 'master',
                    templateUrl: 'masterpages/1cl.html'
                })
                // Two Columns Layout (Abstract States)
                .state('master.2cl', {
                    url: '',
                    abstract: true,
                    parent: 'master',
                    templateUrl: 'masterpages/2cl.html'
                })

            if (DisciturSettings.isInMaintenance) {
                $urlRouterProvider.otherwise('/project/maintenance');
                $stateProvider
                // Web Site (Content States)
                .state('master.1cl.home', {
                    url: 'project/maintenance',
                    parent: 'master.1cl',
                    templateUrl: 'modules/main/site/Maintenance.html'
                })
            }
            else {
                // For any unmatched url, redirect to HomePage
                $urlRouterProvider.otherwise('/project/home');

                $stateProvider
                // Web Site (Content States)
                .state('master.1cl.home', {
                    url: 'project/home',
                    parent: 'master.1cl',
                    templateUrl: 'modules/main/site/HomePage.html'
                })
                .state('master.1cl.mission', {
                    url: 'project/mission',
                    parent: 'master.1cl',
                    templateUrl: 'modules/main/site/Project.html'
                })
                .state('master.1cl.about', {
                    url: 'project/About',
                    parent: 'master.1cl',
                    templateUrl: 'modules/main/site/About.html'
                })
                .state('master.1cl.backstage', {
                    url: 'project/backstage',
                    parent: 'master.1cl',
                    templateUrl: 'modules/main/site/BackStage.html'
                })
                .state('master.1cl.contribute', {
                    url: 'project/contribute',
                    parent: 'master.1cl',
                    templateUrl: 'modules/main/site/Contribute.html'
                })

            }

    }
    ])
    .run([
        'DisciturSettings',
        '$rootScope',
        function (DisciturSettings, $rootScope) {
            $rootScope.testEnv = DisciturSettings.testEnv;
        }
    ])
;angular.module('discitur')
    .directive('doSignIn', [
        '$rootScope',
        'AuthService',
        function ($rootScope, AuthService) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.addClass('pointer');
                    element.click(function () {
                        if (!AuthService.user.isLogged)
                            $rootScope.$broadcast('disc.login', scope.actions);
                    })
                }
            }
        }
    ]);angular.module('discitur')
    .factory('DisciturBaseCtrl',
    [
        //'LabelService',
        function () {
            function DisciturBaseCtrl($scope, LabelService,$location) {
                //-------- public methods-------
                $scope.absUrl = $location.absUrl();
                $scope.absUrlComponent = encodeURIComponent($scope.absUrl);
                //-------- public methods-------
                $scope.getLabel = function (label) {
                    return LabelService.get($scope._ctrl, label);
                };


                //--------- Controller initialization ------
                // detach static bindings (labels)
                var _watching = false;
                var _detachStaticWatchers = $scope.$watch(function () {
                    // first digest cycle: do nothing to populate view
                    if (!_watching) {
                        _watching = true;
                    }
                        // second digest cycle: remove static watchers
                    else {
                        var _reLabels = /^{{labels\..*}}/
                        for (var i = $scope.$$watchers.length - 1; i >= 0; i--) {
                            if ($scope.$$watchers[i].exp &&
                                $scope.$$watchers[i].exp.exp &&
                                _reLabels.test($scope.$$watchers[i].exp.exp)) {
                                $scope.$$watchers.splice(i, 1);
                            }
                        }
                        // detach this watch
                        _detachStaticWatchers();
                    }
                })


            }
            DisciturBaseCtrl.$inject = ['$scope', 'LabelService', '$location'];
            return (DisciturBaseCtrl);

        }
    ]);

;angular.module("discitur")
    .controller('DisciturRootCtrl', [
        '$scope',
        '$rootScope',
        'DisciturBaseCtrl',
        '$injector',
        'AuthService',
        '$state',
        '$urlRouter',
        function ($scope, $rootScope, DisciturBaseCtrl, $injector, AuthService, $state, $urlRouter) {
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });

            //-------- private properties -------
            $scope._ctrl = 'DisciturMasterCtrl';

            //------- private methods -------//
            var _getMessage = function (obj) {
                var _message = "";
                for (var key in obj) {
                    var _myKey = key;
                    if (obj[key].constructor === Object)
                        _message += _getMessage(obj[key])
                    else
                        _message += key + ":" + obj[key] + " ";
                }
                return _message;
            }

            // dynamic callback for change start event
            var changeStartCallbacks = [
                // 1. Initialize Authentication Data e delete itself
                function (event) {
                    event.preventDefault();
                    AuthService.resolveAuth()['finally'](function () {
                        // http://angular-ui.github.io/ui-router/site/#/api/ui.router.router.$urlRouter
                        // Continue with the update and state transition if logic allows
                        $urlRouter.sync();
                    });
                    changeStartCallbacks.splice(0, 1);

                },
                // 2. Manage authorized states
                function (event, toState, toParams, fromState, fromParams) {
                    if (toState.authorized && !AuthService.user.isLogged) {
                        // event preventDefault to stop the flow and redirect
                        event.preventDefault();
                        $state.go('lessonSearch');
                    }
                }
            ]

            //-------- public properties -------
            $scope.labels = {
                appTitle: $scope.getLabel('appTitle'),
                loading: $scope.getLabel('loading'),
                testEnv: $scope.getLabel('testEnv')
            };

            //------- Global Event Management -------//
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                //console.log("$stateChangeStart")
                changeStartCallbacks[0](event, toState, toParams, fromState, fromParams);
            });
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                //console.log("$stateChangeSuccess")
            });
            $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                //console.error('$stateChangeError: ' + error)
                if (toState.name === 'lessonDetail') {
                    // event preventDefault to stop the flow and redirect
                    //event.preventDefault();
                    return $state.go('404lesson');
                }
                return error;
                //else
                //    return $state.go(toState);
            });
        }
    ])



;angular.module("discitur")
    .controller('NavCtrl', [
        '$scope',
        '$rootScope',
        '$location',
        'DisciturBaseCtrl',
        '$injector',
        'DisciturSettings',
        function ($scope, $rootScope, $location, DisciturBaseCtrl, $injector, DisciturSettings) {
            // inherit Discitur Base Controller
            $injector.invoke(DisciturBaseCtrl, this, { $scope: $scope });

            //-------- private properties -------
            $scope._ctrl = 'NavCtrl';

            $scope.labels = {
                brand: $scope.getLabel('brand')
            };
            
            $scope.local = {
                isInMaintenance: DisciturSettings.isInMaintenance
            }
            $scope.menu = [
                { id: 1, title: "Lezioni", route: "/lesson" },
                {
                    id: 2, title: "Il Progetto", route: "/project", subMenu: [
                        { id: 21, title: "Il Manifesto", route: "/project/mission" },
                        { id: 22, title: "Chi siamo", route: "/project/About" },
                        { id: 23, title: "Contribuisci", route: "/project/contribute" },
                        { id: 24, title: "BackStage", route: "/project/backstage" }
                    ]
                }/*,
                { id: 3, title: "Contatti", route: "/project/contact" }*/
            ]

            $scope.isActiveMenu = function(index){
                return ($location.path().indexOf($scope.menu[index].route) >= 0);
            }
            $scope.hasSubMenu = function (index) {
                return ($scope.menu[index].subMenu !== undefined && $scope.menu[index].subMenu.length>0);
            }

        }
    ]);
