(function() {
    //set the height of your section which makes sticky sit below it
    // windowHeight alone will push it outside the window so do
    //window height - 60
    var winHeight = $(window).height();
    var headerHeight = $('header').outerHeight(true);

    //Your sticky relocate code
    function event_height_relocate() {
        var winWidth = $(window).width();
        if (winWidth > 1024) {
            $(".js-full-height").css({'height': winHeight - headerHeight});
        } else {
            $(".js-full-height").css({'height': 'auto'});
        }
    }


    event_height_relocate();
    $(window).scroll(event_height_relocate);

})();