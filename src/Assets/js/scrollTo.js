var $ = require('$');

module.exports = function(element){
    var offset = 50;
    if (typeof element == 'string') {
        element = $("[data-scroll-target='" + element + "']");
    }
    if(element.length){
        // Clear the hash in the URL
        // location.hash = '';   // delete front "//" if you want to change the address bar
        var elOffset = $(element).offset().top;
        $('html, body').animate({ scrollTop: elOffset - offset}, 750);
    }
};