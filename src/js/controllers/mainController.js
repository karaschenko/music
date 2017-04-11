audioApp
    .controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $http, $mdDialog) {
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

        $scope.audioInspection = function(data){
            $http.post('/api/test/', { audio: data }).then(function(e){
                
                $scope.audioInspection
                console.log(e.data.response, data);
            });
        };
        $scope.myAudios =
            [
                { 'title':'xyi', 'artist': 'pizda'},
                { 'title':'xyi', 'artist': 'pizda'},
                { 'title':'xyi', 'artist': 'pizda'},
                { 'title':'xyi', 'artist': 'pizda'},
                { 'title':'xyi', 'artist': 'pizda'}
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
            return function(){
                $http.get('/api/?get_auth_link=1').then(function(response) {
                    window.location.href = response.data;
                });
            }
        }

        function authLogout(){
            return function(){
                $http.get('/api/?logout=1').then(function() {
                    authCheck(false, function(){
                        $mdSidenav('left').close();
                    });
                });
            }
        }

        function authCheck(onSuccess, onError){
            var null_function = function(){};
            if (onSuccess == false) onSuccess = null_function;
            if (onError == false) onError = null_function;

            $http.get('/api/?auth_status=1').then(function(response) {
                if (!response.data) {

                    $scope.AUTH_STATUS = false;
                    onError();

                } else {

                    $scope.AUTH_STATUS = true;
                    onSuccess();

                }
            });
        }

        function apiGetCall(url, callback) {
            $scope.loading = true;
            $http.get(url).then(function(response) {
                $scope.loading = false;
                callback(response.data);
            });
        }


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


    });