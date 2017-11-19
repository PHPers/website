var $               = require('jquery');
var scrollToElement = require('./scrollTo');

module.exports = function (e) {
    $(window).on('load', function(){
        // Remove the # from the hash, as different browsers may or may not include it
        var hash = location.hash.replace('#','');
        if(hash != '') {
            scrollToElement(hash);
        }
    });

    $(document).ready(function(){
        $("[data-scroll-to]").each( function(index, element) {
            $(element).on('click', function(e){
                e.preventDefault();
                var href = $(this).attr('href');
                var locator = href.split("#").slice(-1)[0];
                var el = $("[data-scroll-target='" + locator + "']");

                if(el.length) {
                    return scrollToElement(locator);
                } else {
                    return window.location = href;
                }
            });
        });
    });
};