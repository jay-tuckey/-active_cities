angular.module('starter.services', [])

// Google Maps GeoCoding API
.service('MapsService', function($http, $q, GEOCODING_API_KEY) {
    var baseGeoCodingURL = 'https://maps.googleapis.com/maps/api/geocode/json';
    var baseNearbyPlacesURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

    _getGeoCoding = function(address) {
        return $http.get(baseGeoCodingURL + '?address=' + address + '&key=' + GEOCODING_API_KEY);
    };

    _getExercisePlaces = function(position) {
        var placeTypes = 'bowling_alley,gym,park';
        return $http.get(baseNearbyPlacesURL + '?location=' + position.coords.latitude + ',' + position.coords.longitude + '&radius=1500&type='+ placeTypes + '&key=' + GEOCODING_API_KEY)
    }

    return {
        getGeoCoding: _getGeoCoding,
        getExercisePlaces: _getExercisePlaces
    };

})

;
