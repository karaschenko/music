function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function getCss(elem, css, substr){
    var style = getComputedStyle(elem)[css].substr(0, getComputedStyle(elem)[css].length-substr);
    return parseInt(style);
}
var audioApp = angular.module('AudioApp', ['ngMaterial']);
audioApp.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('red');
});
audioApp
    .controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $http, $mdDialog, $q, $log) {
        var self = this;
        $scope.toggleLeft = buildToggler('left');
        $scope.AUTH_STATUS = false;
        $scope.login = authLogin();
        $scope.logout = authLogout();
        $scope.selectedIndex = 0;
        $scope.cover = {b: [], m: []};

        var originatorEv;
        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.changeTab = function(id) {
            $scope.selectedIndex = id;
        };

        $scope.go = function (url) {
            window.location.href = url;
        };
        $scope.play = function (id) {
            angular.forEach(
           angular.element(document.getElementsByTagName('audio')), function (el, i) {
               el.pause();
               document.getElementById('pause-'+angular.element(el)[0].attributes['id'].value).style.display = 'none';

           });
            document.getElementById('pause-'+id).style.display = '';
            document.getElementById('play-'+id).style.display = 'none';

            document.getElementById(id).play();
        };
        $scope.pause = function (id) {
            document.getElementById(id).pause();
            document.getElementById('play-'+id).style.display = '';
            document.getElementById('pause-'+id).style.display = 'none';
        };

        // $scope.audioInspection = function(data){
        //     $http.post('/api/test/', { audio: data }).then(function(e){
        //
        //         $scope.audioInspection
        //         console.log(e.data.response, data);
        //     });
        // };
        $scope.myAudios =
            [
                { 'title':'xyi', 'artist': 'pizda', 'url':'zhopa', 'id':'audio1'},
                { 'title':'xyi', 'artist': 'pizda', 'url':'zhopa', 'id':'audio2' },
                { 'title':'xyi', 'artist': 'pizda', 'url':'zhopa', 'id':'audio3' },
                { 'title':'xyi', 'artist': 'pizda', 'url':'zhopa', 'id':'audio4' },
                { 'title':'xyi', 'artist': 'pizda', 'url':'zhopa', 'id':'audio5'}
            ];

        // $http.get('/api/?api_key=1').then(function(response) {
        //     $scope.API_KEY = response.data;
        //     authCheck(function(){
        //         apiGetCall('/api/?api=audio.get', function(data){
        //
        //         });
        //         apiGetCall('/api/?api=audio.getRecommendations', function(data){
        //             $scope.recommendations = data.response.items;
        //         });
        //         apiGetCall('/api/?api=audio.getPopular', function(data){
        //             $scope.popular = data.response;
        //         });
        //     }, false);
        // });

        function buildToggler(componentId) {
            return function() {
                $mdSidenav(componentId).toggle();
            }
        }

        function authLogin(){
            // return function(){
            //     $http.get('/api/?get_auth_link=1').then(function(response) {
            //         window.location.href = response.data;
            //     });
            // }
        }

        function authLogout(){
            return function(){
                // $http.get('/api/?logout=1').then(function() {
                //     authCheck(false, function(){
                //         $mdSidenav('left').close();
                //     });
                // });
            }
        }

        // function authCheck(onSuccess, onError){
        //     var null_function = function(){};
        //     if (onSuccess == false) onSuccess = null_function;
        //     if (onError == false) onError = null_function;
        //
        //     $http.get('/api/?auth_status=1').then(function(response) {
        //         if (!response.data) {
        //
        //             $scope.AUTH_STATUS = false;
        //             onError();
        //
        //         } else {
        //
        //             $scope.AUTH_STATUS = true;
        //             onSuccess();
        //
        //         }
        //     });
        // }

        // function apiGetCall(url, callback) {
        //     $scope.loading = true;
        //     $http.get(url).then(function(response) {
        //         $scope.loading = false;
        //         callback(response.data);
        //     });
        // }


        $scope.genreList = {
            0:  {id: 0,     description: 'Все жанры'},
            1:  {id: 2,     description: 'Pop'},
            2:  {id: 3,     description: 'Rap & Hip-Hop'},
            3:  {id: 4,     description: 'Easy Listening'},
            4:  {id: 5,     description: 'House & Dance'},
            5:  {id: 6,     description: 'Instrumental'},
            6:  {id: 7,     description: 'Metal'},
            7:  {id: 21,    description: 'Alternative'},
            8:  {id: 8,     description: 'Dubstep'},
            9:  {id: 1001,  description: 'Jazz & Blues'},
            10: {id: 10,    description: 'Drum & Bass'},
            11: {id: 11,    description: 'Trance'},
            12: {id: 12,    description: 'Chanson'},
            13: {id: 13,    description: 'Ethnic'},
            14: {id: 14,    description: 'Acoustic & Vocal'},
            15: {id: 15,    description: 'Reggae'},
            16: {id: 16,    description: 'Classical'},
            17: {id: 17,    description: 'Indie Pop'},
            18: {id: 19,    description: 'Speech'},
            19: {id: 22,    description: 'Electropop & Disco'},
            20: {id: 1,     description: 'Rock'}
        };
        $scope.popularFilter = {
            activeGenre: $scope.genreList[0],
            eng_only: false
        };
        $scope.showAdvanced = function(ev) {
            $mdDialog.show({
                templateUrl: '../templates/dialogPopularSettings.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                scope: $scope,
                preserveScope: true,
                controller: function($scope, $mdDialog) {

                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };

                    $scope.answer = function(answer) {
                        var eng_only = 0;
                        if (answer.eng_only) eng_only = 1;

                        apiGetCall('/api/?api=audio.getPopular&eng_only=' + eng_only + '&genre=' + answer.activeGenre.id, function(data){
                            $scope.popular = data.response;
                        });

                        $scope.popularFilter = answer;
                        $mdDialog.hide();
                    };
                }
            });
        };




            $scope.simulateQuery = false;
            $scope.isDisabled    = false;

            $scope.repos         = loadAll();
            $scope.querySearch   = querySearch;
            $scope.selectedItemChange = selectedItemChange;
            $scope.searchTextChange   = searchTextChange;



            /**
             * Search for repos... use $timeout to simulate
             * remote dataservice call.
             */
            function querySearch (query) {
                console.log('yes2');
                var results = query ? $scope.repos.filter( createFilterFor(query) ) : $scope.repos,
                    deferred;
                if ($scope.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }

            function searchTextChange(text) {
                console.log('yes');
                $log.info('Text changed to ' + text);
            }

            function selectedItemChange(item) {
                $log.info('Item changed to ' + JSON.stringify(item));
            }

            /**
             * Build `components` list of key/value pairs
             */
            function loadAll() {

                var repos = [
                    {
                        'name'      : 'Angular 1',
                        'url'       : 'https://github.com/angular/angular.js',
                        'watchers'  : '3,623',
                        'forks'     : '16,175',
                    },
                    {
                        'name'      : 'Angular 2',
                        'url'       : 'https://github.com/angular/angular',
                        'watchers'  : '469',
                        'forks'     : '760',
                    },
                    {
                        'name'      : 'Angular Material',
                        'url'       : 'https://github.com/angular/material',
                        'watchers'  : '727',
                        'forks'     : '1,241',
                    },
                    {
                        'name'      : 'Bower Material',
                        'url'       : 'https://github.com/angular/bower-material',
                        'watchers'  : '42',
                        'forks'     : '84',
                    },
                    {
                        'name'      : 'Material Start',
                        'url'       : 'https://github.com/angular/material-start',
                        'watchers'  : '81',
                        'forks'     : '303',
                    }
                ];
                return repos.map( function (repo) {
                    repo.value = repo.name.toLowerCase();
                    return repo;
                });
            }

            /**
             * Create filter function for a query string
             */
            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);

                return function filterFn(item) {
                    return (item.value.indexOf(lowercaseQuery) === 0);
                };

            }

    });
audioApp
    .filter('secondsToDateTime', [function() {
        return function(seconds) {
            return new Date(1970, 0, 1).setSeconds(seconds);
        };
    }]);
audioApp
    .factory('VKAudio', ['$q', function($q){
        return function(apiId, uid, aid){
            var deferred = $q.defer();
            if (window.VK === undefined) deferred.reject("VK is undefined");

            VK.init({apiId: apiId});
            VK.api("audio.getById", {audios: uid + '_' + aid}, function(data) {
                deferred.resolve(data.response);
            });

            return deferred.promise;
        };
    }]);





