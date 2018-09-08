angular.module('starter.services', [])

// Google Maps GeoCoding API
.service('MapsService', function($http, $q, GEOCODING_API_KEY) {
    var baseURL = 'https://maps.googleapis.com/maps/api/geocode/json';

    _getGeoCoding = function(address) {
        return $http.get(baseURL + '?address=' + address + '&key=' + GEOCODING_API_KEY);
    };

    return {
        getGeoCoding: _getGeoCoding
    };

})

;
