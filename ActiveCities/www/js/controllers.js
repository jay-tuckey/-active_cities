angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Exercise', id: 'Exercise' },
    { title: 'Socialise', id: 'Socialise' },
    { title: 'Discover', id: 'Discover' }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams, MapsService, $ionicLoading, $ionicPopup, $ionicHistory) {
  $scope.playlistId = $stateParams.playlistId;

  // Get the map POI types based on the activity
  var poiarray = [];
  switch ($scope.playlistId) {
    case "Exercise":
      poiarray = ['bowling_alley','gym','park'];
      break;
    case "Socialise":
      poiarray = ['bakery','cafe'];
      break;
    case "Discover":
      poiarray = ['amusement_park','aquarium','art_gallery','library','museum','zoo'];
      break;
  }

  $scope.$on('mapInitialized', function(event, map) {
    $scope.map = map;
  });

  // Setup the loader
  $ionicLoading.show({
      template: 'Loading Map...',
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
  });

  $scope.positions = [];

  $ionicLoading.show({
      template: 'Loading...'
  });

  // with this function you can get the user’s current position
  // we use this plugin: https://github.com/apache/cordova-plugin-geolocation/
  navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      $scope.current_position = { lat: position.coords.latitude, lng: position.coords.longitude };
      $scope.center_position = { lat: position.coords.latitude, lng: position.coords.longitude };
      $scope.my_location = position.coords.latitude + ", " + position.coords.longitude;
      $scope.map.setCenter(pos);

      // pull nearby places of interest
      _.each(poiarray, function(thepoi) {
        MapsService.getPlacesOfInterest(position, thepoi).then(function(pois) {
          if (pois.data.status != "ZERO_RESULTS") {
            _.each(pois.data.results, function(marker) {
              console.log(marker.name);
              // Add the marker to the map
              var mapmarker = new google.maps.Marker({
                position: marker.geometry.location,
                map: $scope.map,
                title: marker.name,
                icon: {
                  url: marker.icon,
                  scaledSize: new google.maps.Size(20, 20)
                }
              });
              // Build the info window
              var infowindow = new google.maps.InfoWindow({
                content:  '<h5>' + marker.name + '</h5>' +
                          '<em>' + marker.vicinity + '</em>'
              });
              // Click handler for the marker
              mapmarker.addListener('click', function() {
                infowindow.open($scope.map, mapmarker);
              });
            });
            console.log(pois);
          }
        });
      });

      // close the loading window
      $ionicLoading.hide();
  }, function(err) {
      // error
      $ionicLoading.hide();
  });

});
