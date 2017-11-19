var $ = require('jquery');

require('./vectormap/jquery.jvectormap.min');
require('./vectormap/jquery-jvectormap-pl-merc-en');

module.exports = function (e) {
    var $map = $('#map');
    if ($map.length && !$map.children().length) {
        var markerStyle = {
            image: '/images/elephpant-small.png'
        };
        var regionStyle = {
            fill: 'white',
            stroke: 'gray',
            "stroke-width": 1,
            "stroke-opacity": 1,
            cursor: 'arrow'
        };
        
        phpersMarkers.map(function (el) {
            el['style'] = markerStyle;
        });

        $('#map').vectorMap({
            map: 'pl_merc_en',
            zoomButtons: false,
            zoomOnScroll: false,
            backgroundColor: '#f9f9f9',
            labels: {
                markers: {
                    render: function (i) {
                        return phpersMarkers[i].name;
                    }
                }
            },
            regionStyle: {
                initial: regionStyle,
                hover: regionStyle,
                selected: regionStyle
            },
            markers: phpersMarkers,
            onRegionTipShow: function (e, el, code) {
                e.preventDefault();
            },
            onMarkerTipShow: function (e, el, code) {
                e.preventDefault();
                console.log(e, el, code);
                console.log(phpersMarkers[code]);
            },
            onMarkerClick: function (e, code) {
                var url = document.location.protocol + '//' + document.domain;
                if (document.location.port) {
                    url += ':' + document.location.port;
                }
                url += '/meetup/?c=' + phpersMarkers[code].slug;
                window.location = url;
            }
        });
    }
};