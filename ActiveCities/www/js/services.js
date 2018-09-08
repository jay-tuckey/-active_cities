angular.module('starter.services', [])

// Google Maps GeoCoding API
.service('MapsService', function($http, $q, GEOCODING_API_KEY) {
    var baseGeoCodingURL = 'https://maps.googleapis.com/maps/api/geocode/json';
    var baseNearbyPlacesURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

    _getGeoCoding = function(address) {
        return $http.get(baseGeoCodingURL + '?address=' + address + '&key=' + GEOCODING_API_KEY);
    };

    _getPlacesOfInterest = function(position, poitype) {
        return $http.get(baseNearbyPlacesURL + '?location=' + position.coords.latitude + ',' + position.coords.longitude + '&radius=1500&type='+ poitype + '&key=' + GEOCODING_API_KEY)
    }

    return {
        getGeoCoding: _getGeoCoding,
        getPlacesOfInterest: _getPlacesOfInterest
    };

})

;
