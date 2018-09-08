angular.module('starter.services', [])

// Google Maps GeoCoding API
.service('MapsService', function($http, $q, GEOCODING_API_KEY) {
    var baseGeoCodingURL = 'https://maps.googleapis.com/maps/api/geocode/json';
    var baseNearbyPlacesURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    var baseParkPolygonURL = 'https://jay-tuckey.github.io/active_cities/park_selections.json';

    _getGeoCoding = function(address) {
        return $http.get(baseGeoCodingURL + '?address=' + address + '&key=' + GEOCODING_API_KEY);
    };

    _getPlacesOfInterest = function(position, poitype) {
        return $http.get(baseNearbyPlacesURL + '?location=' + position.coords.latitude + ',' + position.coords.longitude + '&radius=1500&type='+ poitype + '&key=' + GEOCODING_API_KEY)
    }

    _getParkPolygons = function() {
      return $http.get(baseParkPolygonURL);
    }

    return {
        getGeoCoding: _getGeoCoding,
        getPlacesOfInterest: _getPlacesOfInterest,
        getParkPolygons: _getParkPolygons
    };

})

.service('WeatherService', function($http) {
  var baseWeatherURL = 'http://172.104.182.108/bom_data';

  _getWeatherFeed = function() {
    return $http.get(baseWeatherURL);
  }

  return {
    getWeatherFeed: _getWeatherFeed
  };

})

;
