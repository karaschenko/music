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