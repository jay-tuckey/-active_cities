angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('PlaylistsCtrl', function($scope, WeatherService) {
  $scope.playlists = [
    { title: 'Exercise', id: 'Exercise', icon: 'trophy' },
    { title: 'Socialise', id: 'Socialise', icon: 'beer' },
    { title: 'Discover', id: 'Discover', icon: 'compass' }
  ];

  WeatherService.getWeatherFeed().then(function(wxdata) {
    $scope.wxdata = wxdata;
  });

})

.controller('PlaylistCtrl', function($scope, $stateParams, MapsService, WeatherService, $ionicLoading, $ionicPopup, $ionicHistory, $ionicModal) {
  $scope.playlistId = $stateParams.playlistId;

  $scope.optionData = {
    freeOnly: false,
    indoorActivityOnly: false,
    touristActivityOnly: false,
    feelingSocial: false,
    rainyDay: false,
    hotDay: false,
    exerciseActivity: false,
    socialiseActivity: false,
    discoverActivity: false
  }

  // Get the map POI types based on the activity
  var poiarray = [];
  var markerarray = [];
  switch ($scope.playlistId) {
    case "Exercise":
      poiarray = ['bowling_alley','gym','park'];
      $scope.optionData.exerciseActivity = true;
      break;
    case "Socialise":
      poiarray = ['bakery','cafe'];
      scope.optionData.socialiseActivity = true;
      break;
    case "Discover":
      poiarray = ['amusement_park','aquarium','art_gallery','library','museum','zoo'];
      $scope.optionData.discoverActivity = true;
      break;
  }

  // get the weather data for the options dialog
  WeatherService.getWeatherFeed().then(function(wxdata) {
    $scope.wxdata = wxdata;
    // work out weather conditions for the options dialog
    if (parseInt(wxdata.data.mini_forecast.probability_of_precipitation) > 50) {
      $scope.optionData.rainyDay = true;
    }
    if (parseInt(wxdata.data.observation.apparent_temp) > 28) {
      $scope.optionData.hotDay = true;
    }
  });

  initialiseMap();

  $scope.$on('mapInitialized', function(event, map) {
    $scope.map = map;
    $scope.openOptionsModal();
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

  function clearMap() {
    // Clear existing markers
    _.each(markerarray, function(theMarker) {
      theMarker.setMap(null);
    });
    markerarray = [];
    // And rebuild the map with new markers
    initialiseMap();
  }

  function initialiseMap() {
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
          MapsService.getPlacesOfInterest(position, thepoi, $scope.optionData.freeOnly).then(function(pois) {
            if (pois.data.status != "ZERO_RESULTS") {
              _.each(pois.data.results, function(marker) {
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
                // Add it to the marker array
                markerarray.push(mapmarker);
                // Build the info window
                var opening_hours = (marker.opening_hours === undefined || marker.opening_hours.open_now === undefined) ? "Possibly closed" : ((marker.opening_hours.open_now == true) ? "Open Now" : "Closed Now");
                var rating = (marker.rating === undefined) ? "(unknown)" : marker.rating;
                var infowindow = new google.maps.InfoWindow({
                  content:  '<h5>' + marker.name + '</h5>' +
                            '<em>' + marker.vicinity + '</em><br/>' +
                            '<span>Rating: <strong>' + rating + '</strong></span><br/>' +
                            '<span>' + opening_hours + '</span>'
                });
                // Click handler for the marker
                mapmarker.addListener('click', function() {
                  infowindow.open($scope.map, mapmarker);
                });
              });
            }
          });
        });

        // if Socialise activity - pull the local parks
        if ($scope.optionData.socialiseActivity) {
          MapsService.getParkPolygons().then(function(parkPolygons) {
            var todaysPolygons = parkPolygons.data[new Date().toISOString().split('T')[0]];
            // Create polygon object
            _.each(todaysPolygons.geometry.coordinates, function(thePolygon) {
              var polygonObject = [];
              _.each(thePolygon[0], function(theCoords) {
                polygonObject.push({lat: theCoords[0], lng: theCoords[1]});
              });
              // console.log(polygonObject);
              // Add it to the map
              var parkPolygon = new google.maps.Polygon({
                paths: polygonObject,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: $scope.map
              });
              // console.log(parkPolygon);
              // parkPolygon.setMap($scope.map);
            });
          });
        }

        // close the loading window
        $ionicLoading.hide();
    }, function(err) {
        // error
        $ionicLoading.hide();
    });
  }


  $ionicModal.fromTemplateUrl('templates/mapoptions.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openOptionsModal = function() {
    $scope.modal.show();
  };

  $scope.closeOptionsModal = function() {
    $scope.modal.hide();
  };

  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
    clearMap();
  });

  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

});
