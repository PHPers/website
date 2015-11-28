(function() {
    //set the height of your section which makes sticky sit below it
    // windowHeight alone will push it outside the window so do
    //window height - 60
    var winHeight = $(window).height();
    var headerHeight = $('header').outerHeight(true);
    $('.intro').css('marginBottom', '-' + headerHeight + 'px');
    $('main').css('paddingTop', headerHeight + 'px');

    var $eventSidebar = $('.location');
    if ($eventSidebar.length) {
        $eventSidebar.css('paddingTop', headerHeight + 'px');
    }


    //Your sticky relocate code
    function sticky_relocate() {
        var window_top = $(window).scrollTop();
        var div_top = $('#sticky-anchor').offset().top;
        if (div_top == 0) {
            return $('body').addClass('header-stick');

        }
        if (window_top > div_top) {
            $('body').addClass('header-stick');
        } else {
            $('body').removeClass('header-stick');
        }
    }

    sticky_relocate();
    $(window).scroll(sticky_relocate);
})();

jQuery(document).ready(function($) {
    var isLateralNavAnimating = false;

    //open/close lateral navigation
    $('.js-nav-trigger').on('click', function(event){
        event.preventDefault();
        //stop if nav animation is running
        if( !isLateralNavAnimating ) {
            if($(this).parents('.csstransitions').length > 0 ) isLateralNavAnimating = true;

            // Toggle text
            var textToChange = $(this).find('.js-nav-text').data('toggleText');
            var actualText = $(this).find('.js-nav-text').text();
            $(this).find('.js-nav-text').text(textToChange).data('toggleText', actualText);

            //$('body').toggleClass('navigation-is-open');
            $('.navigation-wrapper').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
                //animation is over
                isLateralNavAnimating = false;
            });
        }
    });

    //$(document).on('click', '.primary-nav a', function(event) {
    //    //stop if nav animation is running
    //    if( !isLateralNavAnimating ) {
    //        if($(this).parents('.csstransitions').length > 0 ) isLateralNavAnimating = true;
    //
    //        $('body').toggleClass('navigation-is-open');
    //        $('.navigation-wrapper').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
    //            //animation is over
    //            isLateralNavAnimating = false;
    //        });
    //    }
    //});

    // video size in device-mockup
    recalculate_video_size();

    //handle newsletter form
    newsletterForm();
});

$(window).resize(function() {
    recalculate_video_size();
});

function recalculate_video_size() {
    var $mockup = $(".device-mockup");
    var $screen = $mockup.find('.screen');
    var $videoFrame = $screen.find('iframe');

    var width = $screen.width();
    var height = $screen.height();

    $videoFrame.attr('height', height);
    $videoFrame.attr('width', width);
}


function newsletterForm() {
    var $form = $("#newsletterForm");
    if (!$form.length) {
        return;
    }

    var $wrapper = $("#" + $form.data('wrap'));
    var $input = $form.find("input[name='subscriber_email']");

    $form.on('submit', function (e) {
        e.preventDefault();
        console.log('Do something with this user email: ', $input.val());
        $wrapper.addClass('flipped');
    })
}