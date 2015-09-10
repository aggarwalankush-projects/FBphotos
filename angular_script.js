var app = angular.module('photoUploader', ['facebookFactory']);

app.controller('MainController', ['$scope', '$log', '$interval', 'facebook',
  function($scope, $log, $interval, facebook) {
    $scope.resetAll = function() {
      $scope.loggedIn = false;
      $scope.status = "Loading";
      $scope.eventImages = [];
      $scope.events = [];
      $scope.link = "";
      $scope.picture = "";
      $scope.currentEventId = 0;
      $scope.currentEventName = "";
      $scope.accessToken = "";
      $scope.submitting = false;
      $scope.currentImage = "";
      $scope.comments = 
        [{
          comment: 'Comment 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit, \
                  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          user: 'Jane Doe'
        }, {
          comment: 'Comment 2: Lorem ipsum dolor sit amet, consectetur adipiscing elit, \
                  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          user: 'John Doe'
        }];
    }
    $scope.resetAll();

    $scope.loggedInCallBack = function() {
      $scope.loggedIn = facebook.loggedIn;
      $scope.accessToken = facebook.accessToken;
      var myDetails = facebook.me();
      myDetails.then(function(response) {
        $scope.status = response.name;
        $scope.link = response.link;
        $scope.picture = response.picture.data.url;
      }, function(response){
        $scope.resetAll();
        $scope.status = "";
      });
    }

    $scope.checkLogin = function() {
      facebook.checkStatus($scope.loggedInCallBack);
    }
    
    $scope.getEvents = function() {
      var eventPromise = facebook.getEvents();
      eventPromise.then(function(response) {
        $scope.events = response.data;
      })
    }

    $scope.getEventPhotos = function(id, name){
      $scope.currentEventId = id;
      $scope.currentEventName = name;
      var eventPhotosPromise = facebook.getEventPhotos(id);
      eventPhotosPromise.then(function(response) {
        $scope.eventImages = response.data;
      });
    }
    
    $scope.uploadFiles = function() {
      $scope.submitting = true;
      var files = document.getElementById('upload_photo').files;
      var fileUploadPromise = facebook.uploadFiles(files, $scope.currentEventId);
      fileUploadPromise.then(function() {
        $scope.getEventPhotos($scope.currentEventId, $scope.currentEventName);
        document.getElementById('upload_photo').value = "";
        $scope.submitting = false;
      });
    }

    $scope.selectImage = function(source) {
      $scope.currentImage = source;
    }
    
    var interval = $interval(function() {
      if (facebook.ready){
        $scope.checkLogin();
        $interval.cancel(interval);
      }
    }, 1000);
  }]);
