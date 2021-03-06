angular.module('starter.services', [])

// Google Maps GeoCoding API
.service('MapsService', function($http, $q, GEOCODING_API_KEY) {
    var baseGeoCodingURL = 'https://bom.jaytuckey.name/geocode';
    var baseNearbyPlacesURL = 'https://bom.jaytuckey.name/nearby_search';
    var baseParkPolygonURL = 'https://jay-tuckey.github.io/active_cities/park_selections.json';

    _getGeoCoding = function(address) {
        return $http.get(baseGeoCodingURL + '?address=' + address + '&key=' + GEOCODING_API_KEY);
    };

    _getPlacesOfInterest = function(position, poitype, freeonly) {
        var pricequery;
        (freeonly) ? pricequery = '&maxprice=0' : pricequery = '';
        return $http.get(baseNearbyPlacesURL + '?location=' + position.coords.latitude + ',' + position.coords.longitude + '&radius=5000&type='+ poitype + pricequery + '&key=' + GEOCODING_API_KEY);
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
  var baseWeatherURL = 'https://bom.jaytuckey.name/bom_data';

  _getWeatherFeed = function() {
    return $http.get(baseWeatherURL);
  }

  return {
    getWeatherFeed: _getWeatherFeed
  };

})

;
