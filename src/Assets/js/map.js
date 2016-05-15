var Gmaps = require('gmaps');

module.exports = function (e) {
    var mapCont = document.getElementById('locationMap');
    if (mapCont) {
        var venue_location = mapCont.getAttribute('data-latlng').replace(" ", "").split(',');
        var lat = venue_location[0];
        var lng = venue_location[1];
        var map = new GMaps({
            scrollwheel: false,
            el: '#locationMap',
            lat: lat,
            lng: lng,
            styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}],
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false
        });

        map.addMarker({
            lat: lat,
            lng: lng,
            title: 'PHPers',
            icon: 'http://phpers.pl/favicon.ico',
            infoWindow: {
                content: '<p>PHPers</p>'
            }
        });
    }
};