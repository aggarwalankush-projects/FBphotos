var facebookFactory = angular.module('facebookFactory', []);
facebookFactory.factory('facebook', ['$log', '$q', '$http', function($log, $q, $http) {
  var facebook = {
    loggedIn: false,
    ready: false,
    accessToken: ''
  };

  window.fbAsyncInit = function () {
    FB.init({
      appId: '439205816251471',
      xfbml: true,
      version: 'v2.3'
    });
    facebook.ready = true;
    facebook.checkStatus();

  };

  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4&appId=439205816251471";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  facebook.me = function(success, error) {
    var deferred = $q.defer();
    facebook.api('/me', {fields: 'name,link,picture'}).then(
      function(response) {
        deferred.resolve(response);
      }, function(error) {
        deferred.reject(error);
      });
    return deferred.promise;
  }

  facebook.getEvents = function(success, error) {
    var deferred = $q.defer();
    facebook.api('/me/events').then(
      function(response) {
        deferred.resolve(response);
      }, function(error) {
        deferred.reject(error);
      });
    return deferred.promise;
  }

  facebook.getEventPhotos = function(id, success, error) {
    var deferred = $q.defer();
    facebook.api('/' + id + '/photos').then(
      function(response) {
        deferred.resolve(response);
      }, function(error) {
        deferred.reject(error);
      });
    return deferred.promise;
  }

  facebook.uploadFiles = function(files, eventId) {
    var deferred = $q.defer();
    var action_url = 'https://graph.facebook.com/' + eventId
    + '/photos?access_token=' + facebook.accessToken;
    var totalFiles = files.length;
    var currentFile = 0;
    for(var i=0; i<totalFiles; i++){
      var formData = new FormData();
      formData.append('file', files[i]); 
      $http.post(action_url, formData,
                 {headers: {'Content-Type': undefined}})
        .success(function (data) {
          currentFile++;
          if (currentFile == totalFiles)
            deferred.resolve(data);
      })
        .error(function (data) {
          currentFile++;
          if (currentFile == totalFiles)
            deferred.reject(data);
      });
    };
    return deferred.promise;
  }

  facebook.api = function(keyword, params) {
    params = params || {};
    var deferred = $q.defer();
    FB.api(
      keyword,
      params,
      function(response) {
        if (response.error) {
          deferred.reject(response.error);
          $log.error(response.error);
        }
        else {
          deferred.resolve(response);
          $log.info(response);
        }
      }
    );
    return deferred.promise;
  }

  facebook.statusChangeCallback = function(response, callback) {
    facebook.loggedIn = (response.status === 'connected');
    if (facebook.loggedIn) {
      facebook.accessToken = response.authResponse.accessToken;
    }
    if(callback !== undefined) {
      callback(response);
    }
  }

  facebook.checkStatus = function(callback) {
    FB.getLoginStatus(function (response) {
      facebook.statusChangeCallback(response, callback);
    });
  }

  facebook.getLoggedIn = function() {
    return facebook.loggedIn;
  }

  facebook.printErrorFunction = function(error) {
    $log.error('error');
  }

  return facebook;
}]);
