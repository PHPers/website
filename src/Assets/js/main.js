(function() {
    "use strict";

    var $          = require('jquery');
    var foundation = require('foundation');
    require('viewport-units-buggyfill').init();

    // pick what tests you need
    // require('browsernizr/test/video');
    // require('browsernizr/test/window/atob-btoa');
    // make sure to do this _after_ importing the tests
    var Modernizr = require('browsernizr');

    var owlCarousel = require("owlCarousel");
    require('countdown');
    require('jquery-countto');

    // Custom
    var vectorMap = require('./vectorMap');
    var eventHeightRelocate = require('./event.js');
    var mixIt = require('./meetup.js');

    sidebarPadding();
    stickyRelocate();
    eventHeightRelocate();

    $(window).scroll(stickyRelocate);
    $(window).resize(recalculateVideoSize);
    $(window).scroll(eventHeightRelocate);

    jQuery(document).ready(function($) {
        "use strict";

        var map = require('./map');

        initFoundation();
        initCountDown();
        initCountTo();
        vectorMap();
        initSponsorCarousel();
        map();

        // video size in device-mockup
        recalculateVideoSize();

        //handle newsletter form
        newsletterForm();

        // equalize divs
        equalizeTo();

        // var filter_location = mixIt.getParameterByName('c');
        // var filter_date = mixIt.getParameterByName('d');

        console.log('TODO: set filter on page load');
        console.log('TODO: add history.js support');
        var contactForm = require('./contact.js');
        contactForm();
        
    });

    function sidebarPadding() {
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
    }

    function initSponsorCarousel() {
        var sponsorCarouselOptions = {
            loop: true,
            autoPlay: true,
            autoplayTimeout: 8000,
            margin: 10,
            nav: false,
            responsive: {
              0: {
                items: 4
              },
              600: {
                items: 2
              },
              1000: {
                items: 4
              }
            }
        };

        $(".sponsors-carousel").owlCarousel(sponsorCarouselOptions);

        var sidebarSponsorCarouselOptions = {
          loop: true,
          responsive: {
            0: {
              items: 2
            },
            600: {
              items: 2
            },
            1000: {
              items: 2
            }
          }
        };

        $(".location .sponsors .owl-carousel").owlCarousel(sidebarSponsorCarouselOptions);
    }

    function initCountDown() {
        var $counter = $('#counter');
        if ($counter.length) {
            var datetime = $counter.data('date');
            var time = $counter.data('time');
            if (time) {
                datetime = datetime.concat(" ").concat(time);
            }
            $('#counter').countdown(datetime).on('update.countdown', function (event) {
                $("#days").text(event.offset.totalDays);
                $("#hours").text(event.offset.hours);
                $("#minutes").text(event.offset.minutes);
                $("#seconds").text(event.offset.seconds);
            });
        }
    }

    function initCountTo() {
        if (!Modernizr.mobile) {
            // start all the timers
            $('.timer').each(count);
        }

        // restart a timer when a button is clicked
        function count(options) {
            var $this = $(this);
            options = $.extend({}, options || {}, $this.data('countToOptions') || {});
            $this.countTo(options);
        }
    }

    function initFoundation() {
        $(document).foundation();
    }

    //Your sticky relocate code
    function stickyRelocate() {
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

    function recalculateVideoSize() {
        var $mockup = $(".device-mockup");
        var $screen = $mockup.find('.screen');
        var $videoFrame = $screen.find('iframe');

        var width = $screen.width();
        var height = $screen.height();

        $videoFrame.attr('height', height);
        $videoFrame.attr('width', width);
    }

    function equalizeTo() {
        var $eqaulize = $("[data-equalize-to]");
        $.each($eqaulize, function (index, element) {
            var target = $(element).data('equalizeTo'),
                $target = $('#' + target);
            if (!$target.length) {
                return false;
            }

            var height = $target.outerHeight(true);
            $(this).height(height);
        });
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
})();