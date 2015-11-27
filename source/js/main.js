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
jQuery(document).ready(function($){
	//update these values if you change these breakpoints in the style.css file (or _layout.scss if you use SASS)
	var MqM= 768,
		MqL = 1024;

	var faqsSections = $('.cd-faq-group'),
		faqTrigger = $('.cd-faq-trigger'),
		faqsContainer = $('.cd-faq-items'),
		faqsCategoriesContainer = $('.cd-faq-categories'),
		faqsCategories = faqsCategoriesContainer.find('a'),
		closeFaqsContainer = $('.cd-close-panel');
	
	//select a faq section 
	faqsCategories.on('click', function(event){
		event.preventDefault();
		var selectedHref = $(this).attr('href'),
			target= $(selectedHref);
		if( $(window).width() < MqM) {
			faqsContainer.scrollTop(0).addClass('slide-in').children('ul').removeClass('selected').end().children(selectedHref).addClass('selected');
			closeFaqsContainer.addClass('move-left');
			$('body').addClass('cd-overlay');
		} else {
	        $('body,html').animate({ 'scrollTop': target.offset().top - 19}, 200); 
		}
	});

	//close faq lateral panel - mobile only
	$('body').bind('click touchstart', function(event){
		if( $(event.target).is('body.cd-overlay') || $(event.target).is('.cd-close-panel')) { 
			closePanel(event);
		}
	});
	faqsContainer.on('swiperight', function(event){
		closePanel(event);
	});

	//show faq content clicking on faqTrigger
	faqTrigger.on('click', function(event){
		event.preventDefault();
		$(this).next('.cd-faq-content').slideToggle(200).end().parent('li').toggleClass('content-visible');
	});

	//update category sidebar while scrolling
	$(window).on('scroll', function(){
		if ( $(window).width() > MqL ) {
			(!window.requestAnimationFrame) ? updateCategory() : window.requestAnimationFrame(updateCategory); 
		}
	});

	$(window).on('resize', function(){
		if($(window).width() <= MqL) {
			faqsCategoriesContainer.removeClass('is-fixed').css({
				'-moz-transform': 'translateY(0)',
			    '-webkit-transform': 'translateY(0)',
				'-ms-transform': 'translateY(0)',
				'-o-transform': 'translateY(0)',
				'transform': 'translateY(0)',
			});
		}	
		if( faqsCategoriesContainer.hasClass('is-fixed') ) {
			faqsCategoriesContainer.css({
				'left': faqsContainer.offset().left,
			});
		}
	});

	function closePanel(e) {
		e.preventDefault();
		faqsContainer.removeClass('slide-in').find('li').show();
		closeFaqsContainer.removeClass('move-left');
		$('body').removeClass('cd-overlay');
	}

	function updateCategory(){
		updateSelectedCategory();
	}

	function updateSelectedCategory() {
		faqsSections.each(function(){
			var actual = $(this),
				margin = parseInt($('.cd-faq-title').eq(1).css('marginTop').replace('px', '')),
				activeCategory = $('.cd-faq-categories a[href="#'+actual.attr('id')+'"]'),
				topSection = (activeCategory.parent('li').is(':first-child')) ? 0 : Math.round(actual.offset().top);

			if ( ( topSection - 20 <= $(window).scrollTop() ) && ( Math.round(actual.offset().top) + actual.height() + margin - 20 > $(window).scrollTop() ) ) {
				activeCategory.addClass('selected');
			}else {
				activeCategory.removeClass('selected');
			}
		});
	}
});
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

            $('body').toggleClass('navigation-is-open');
            $('.navigation-wrapper').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
                //animation is over
                isLateralNavAnimating = false;
            });
        }
    });

    $(document).on('click', '.primary-nav a', function(event) {
        //stop if nav animation is running
        if( !isLateralNavAnimating ) {
            if($(this).parents('.csstransitions').length > 0 ) isLateralNavAnimating = true;

            $('body').toggleClass('navigation-is-open');
            $('.navigation-wrapper').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
                //animation is over
                isLateralNavAnimating = false;
            });
        }
    });

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
function getParameterByName( name ){
    var regexS = "[\\?&]"+name+"=([^&#]*)",
        regex = new RegExp( regexS ),
        results = regex.exec( window.location.search );
    if( results == null ){
        return "";
    } else{
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}

jQuery(document).ready(function($){

    // Fill text with selected element
    $("#filters ul").each(function(){
        var $list = $(this);
        var $txt = $list.prev().find('.txt');
        var $selected = $list.find('.active');
        if (!$selected.length) {
            $selected = $list.children().first();
        }
        $txt.text($selected.text());
    });

    // Get & set initial list height for filters
    $("#filters ul").each(function(){
        var height = $(this).outerHeight();
        $(this).data('initial-height', height);
    });

    // Events
    $(document).on('click', "#filters ul li", function(e){
        var $selected = $(this);
        var $list = $selected.parent();
        var $txt = $list.prev().find('.txt');
        $list.find('li').removeClass('active');
        $selected.addClass('active');
        $txt.text($selected.text());

        $list.prev().trigger('click');
    });

    $(document).on('click', "#filters .selected", function(e){
        e.preventDefault();
        var $select = $(this);
        var $filter = $select.parent();
        var $list = $filter.find('ul');
        if ($filter.hasClass('opened')) {
            $filter.removeClass('opened');
            $list.animate({
                height: 0
            }, 300, function(){
                $list.css({
                    display: 'none'
                });
            });

            return;
        }

        $filter.addClass('opened');
        $list.css({
            height: 0,
            display: 'block'
        });
        $list.animate({
            height: $list.data('initial-height')
        }, 300);
    });


    // Mixituup
    mixItUp.init();
    filters.init();

    var filter_location = getParameterByName('c');
    var filter_date = getParameterByName('d');


    console.log('TODO: set filter on page load')
    console.log('TODO: add history.js support')
    //if (filter_location) {
    //    var $filters = $('#filters');
    //    var $list_el = $filters.find("li[data-id='" + filter_location + "']");
    //    $list_el.trigger('click');
    //    $list_el.trigger('click');
    //}
});

var mixItUp = {

    conatiner: $('#pushs'),

    init: function(){
        var self = this;

        self.conatiner.mixItUp({
            controls: {
                enable: false,
                live: false
            },
            callbacks: {
                onMixStart: function(){
                    $('.fail-message').hide();
                    $('.loading-message').fadeOut(200);
                },
                onMixFail: function(){
                    $('.fail-message').show();
                },
                onMixLoad: function(){
                    self.calcHeight();
                }
            },
            //load: {
            //    filter: '.city_trojmiasto'
            //}
        });

        $(window).scroll(self.calcHeight);
    },

    calcHeight: function() {
        var $text = $(".flip .text");
        var height = $text.first().outerHeight();
        $text.css({
            lineHeight: height + 'px'
        });
    }
};

var filters = {
    $filters: null,
    groups: [],
    outputArray: [],

    init: function(){
        var self = this;

        self.$container = $('#pushs');
        self.$filters = $('#filters');

        self.bindHandlers();
    },

    bindHandlers: function(){
        var self = this;

        self.$filters.on('click', '.filter li', function(e){
            var $element = $(e.currentTarget);
            var type = $element.parents('.filter').data('type');
            var active = $element.data('id');
            var outputString =  '';

            self.groups[type] = '.' + type  + '_' + active;
            if (!active.length || active == 'all') {
                active = 'all';
                self.groups[type] = '';
            }

            for (var key in self.groups) {
                outputString += self.groups[key];
            }

            if (!outputString.length) {
                outputString = 'all';
            }
            console.log(outputString);
            self.$container.mixItUp('filter', outputString);
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50LmpzIiwiZmFxLmpzIiwibWFpbi5qcyIsIm1lZXR1cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuICAgIC8vc2V0IHRoZSBoZWlnaHQgb2YgeW91ciBzZWN0aW9uIHdoaWNoIG1ha2VzIHN0aWNreSBzaXQgYmVsb3cgaXRcbiAgICAvLyB3aW5kb3dIZWlnaHQgYWxvbmUgd2lsbCBwdXNoIGl0IG91dHNpZGUgdGhlIHdpbmRvdyBzbyBkb1xuICAgIC8vd2luZG93IGhlaWdodCAtIDYwXG4gICAgdmFyIHdpbkhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICB2YXIgaGVhZGVySGVpZ2h0ID0gJCgnaGVhZGVyJykub3V0ZXJIZWlnaHQodHJ1ZSk7XG5cbiAgICAvL1lvdXIgc3RpY2t5IHJlbG9jYXRlIGNvZGVcbiAgICBmdW5jdGlvbiBldmVudF9oZWlnaHRfcmVsb2NhdGUoKSB7XG4gICAgICAgIHZhciB3aW5XaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICBpZiAod2luV2lkdGggPiAxMDI0KSB7XG4gICAgICAgICAgICAkKFwiLmpzLWZ1bGwtaGVpZ2h0XCIpLmNzcyh7J2hlaWdodCc6IHdpbkhlaWdodCAtIGhlYWRlckhlaWdodH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChcIi5qcy1mdWxsLWhlaWdodFwiKS5jc3MoeydoZWlnaHQnOiAnYXV0byd9KTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgZXZlbnRfaGVpZ2h0X3JlbG9jYXRlKCk7XG4gICAgJCh3aW5kb3cpLnNjcm9sbChldmVudF9oZWlnaHRfcmVsb2NhdGUpO1xuXG59KSgpOyIsImpRdWVyeShkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oJCl7XG5cdC8vdXBkYXRlIHRoZXNlIHZhbHVlcyBpZiB5b3UgY2hhbmdlIHRoZXNlIGJyZWFrcG9pbnRzIGluIHRoZSBzdHlsZS5jc3MgZmlsZSAob3IgX2xheW91dC5zY3NzIGlmIHlvdSB1c2UgU0FTUylcblx0dmFyIE1xTT0gNzY4LFxuXHRcdE1xTCA9IDEwMjQ7XG5cblx0dmFyIGZhcXNTZWN0aW9ucyA9ICQoJy5jZC1mYXEtZ3JvdXAnKSxcblx0XHRmYXFUcmlnZ2VyID0gJCgnLmNkLWZhcS10cmlnZ2VyJyksXG5cdFx0ZmFxc0NvbnRhaW5lciA9ICQoJy5jZC1mYXEtaXRlbXMnKSxcblx0XHRmYXFzQ2F0ZWdvcmllc0NvbnRhaW5lciA9ICQoJy5jZC1mYXEtY2F0ZWdvcmllcycpLFxuXHRcdGZhcXNDYXRlZ29yaWVzID0gZmFxc0NhdGVnb3JpZXNDb250YWluZXIuZmluZCgnYScpLFxuXHRcdGNsb3NlRmFxc0NvbnRhaW5lciA9ICQoJy5jZC1jbG9zZS1wYW5lbCcpO1xuXHRcblx0Ly9zZWxlY3QgYSBmYXEgc2VjdGlvbiBcblx0ZmFxc0NhdGVnb3JpZXMub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dmFyIHNlbGVjdGVkSHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpLFxuXHRcdFx0dGFyZ2V0PSAkKHNlbGVjdGVkSHJlZik7XG5cdFx0aWYoICQod2luZG93KS53aWR0aCgpIDwgTXFNKSB7XG5cdFx0XHRmYXFzQ29udGFpbmVyLnNjcm9sbFRvcCgwKS5hZGRDbGFzcygnc2xpZGUtaW4nKS5jaGlsZHJlbigndWwnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKS5lbmQoKS5jaGlsZHJlbihzZWxlY3RlZEhyZWYpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdFx0Y2xvc2VGYXFzQ29udGFpbmVyLmFkZENsYXNzKCdtb3ZlLWxlZnQnKTtcblx0XHRcdCQoJ2JvZHknKS5hZGRDbGFzcygnY2Qtb3ZlcmxheScpO1xuXHRcdH0gZWxzZSB7XG5cdCAgICAgICAgJCgnYm9keSxodG1sJykuYW5pbWF0ZSh7ICdzY3JvbGxUb3AnOiB0YXJnZXQub2Zmc2V0KCkudG9wIC0gMTl9LCAyMDApOyBcblx0XHR9XG5cdH0pO1xuXG5cdC8vY2xvc2UgZmFxIGxhdGVyYWwgcGFuZWwgLSBtb2JpbGUgb25seVxuXHQkKCdib2R5JykuYmluZCgnY2xpY2sgdG91Y2hzdGFydCcsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRpZiggJChldmVudC50YXJnZXQpLmlzKCdib2R5LmNkLW92ZXJsYXknKSB8fCAkKGV2ZW50LnRhcmdldCkuaXMoJy5jZC1jbG9zZS1wYW5lbCcpKSB7IFxuXHRcdFx0Y2xvc2VQYW5lbChldmVudCk7XG5cdFx0fVxuXHR9KTtcblx0ZmFxc0NvbnRhaW5lci5vbignc3dpcGVyaWdodCcsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRjbG9zZVBhbmVsKGV2ZW50KTtcblx0fSk7XG5cblx0Ly9zaG93IGZhcSBjb250ZW50IGNsaWNraW5nIG9uIGZhcVRyaWdnZXJcblx0ZmFxVHJpZ2dlci5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHQkKHRoaXMpLm5leHQoJy5jZC1mYXEtY29udGVudCcpLnNsaWRlVG9nZ2xlKDIwMCkuZW5kKCkucGFyZW50KCdsaScpLnRvZ2dsZUNsYXNzKCdjb250ZW50LXZpc2libGUnKTtcblx0fSk7XG5cblx0Ly91cGRhdGUgY2F0ZWdvcnkgc2lkZWJhciB3aGlsZSBzY3JvbGxpbmdcblx0JCh3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbigpe1xuXHRcdGlmICggJCh3aW5kb3cpLndpZHRoKCkgPiBNcUwgKSB7XG5cdFx0XHQoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpID8gdXBkYXRlQ2F0ZWdvcnkoKSA6IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlQ2F0ZWdvcnkpOyBcblx0XHR9XG5cdH0pO1xuXG5cdCQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24oKXtcblx0XHRpZigkKHdpbmRvdykud2lkdGgoKSA8PSBNcUwpIHtcblx0XHRcdGZhcXNDYXRlZ29yaWVzQ29udGFpbmVyLnJlbW92ZUNsYXNzKCdpcy1maXhlZCcpLmNzcyh7XG5cdFx0XHRcdCctbW96LXRyYW5zZm9ybSc6ICd0cmFuc2xhdGVZKDApJyxcblx0XHRcdCAgICAnLXdlYmtpdC10cmFuc2Zvcm0nOiAndHJhbnNsYXRlWSgwKScsXG5cdFx0XHRcdCctbXMtdHJhbnNmb3JtJzogJ3RyYW5zbGF0ZVkoMCknLFxuXHRcdFx0XHQnLW8tdHJhbnNmb3JtJzogJ3RyYW5zbGF0ZVkoMCknLFxuXHRcdFx0XHQndHJhbnNmb3JtJzogJ3RyYW5zbGF0ZVkoMCknLFxuXHRcdFx0fSk7XG5cdFx0fVx0XG5cdFx0aWYoIGZhcXNDYXRlZ29yaWVzQ29udGFpbmVyLmhhc0NsYXNzKCdpcy1maXhlZCcpICkge1xuXHRcdFx0ZmFxc0NhdGVnb3JpZXNDb250YWluZXIuY3NzKHtcblx0XHRcdFx0J2xlZnQnOiBmYXFzQ29udGFpbmVyLm9mZnNldCgpLmxlZnQsXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIGNsb3NlUGFuZWwoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRmYXFzQ29udGFpbmVyLnJlbW92ZUNsYXNzKCdzbGlkZS1pbicpLmZpbmQoJ2xpJykuc2hvdygpO1xuXHRcdGNsb3NlRmFxc0NvbnRhaW5lci5yZW1vdmVDbGFzcygnbW92ZS1sZWZ0Jyk7XG5cdFx0JCgnYm9keScpLnJlbW92ZUNsYXNzKCdjZC1vdmVybGF5Jyk7XG5cdH1cblxuXHRmdW5jdGlvbiB1cGRhdGVDYXRlZ29yeSgpe1xuXHRcdHVwZGF0ZVNlbGVjdGVkQ2F0ZWdvcnkoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHVwZGF0ZVNlbGVjdGVkQ2F0ZWdvcnkoKSB7XG5cdFx0ZmFxc1NlY3Rpb25zLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdHZhciBhY3R1YWwgPSAkKHRoaXMpLFxuXHRcdFx0XHRtYXJnaW4gPSBwYXJzZUludCgkKCcuY2QtZmFxLXRpdGxlJykuZXEoMSkuY3NzKCdtYXJnaW5Ub3AnKS5yZXBsYWNlKCdweCcsICcnKSksXG5cdFx0XHRcdGFjdGl2ZUNhdGVnb3J5ID0gJCgnLmNkLWZhcS1jYXRlZ29yaWVzIGFbaHJlZj1cIiMnK2FjdHVhbC5hdHRyKCdpZCcpKydcIl0nKSxcblx0XHRcdFx0dG9wU2VjdGlvbiA9IChhY3RpdmVDYXRlZ29yeS5wYXJlbnQoJ2xpJykuaXMoJzpmaXJzdC1jaGlsZCcpKSA/IDAgOiBNYXRoLnJvdW5kKGFjdHVhbC5vZmZzZXQoKS50b3ApO1xuXG5cdFx0XHRpZiAoICggdG9wU2VjdGlvbiAtIDIwIDw9ICQod2luZG93KS5zY3JvbGxUb3AoKSApICYmICggTWF0aC5yb3VuZChhY3R1YWwub2Zmc2V0KCkudG9wKSArIGFjdHVhbC5oZWlnaHQoKSArIG1hcmdpbiAtIDIwID4gJCh3aW5kb3cpLnNjcm9sbFRvcCgpICkgKSB7XG5cdFx0XHRcdGFjdGl2ZUNhdGVnb3J5LmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdFx0fWVsc2Uge1xuXHRcdFx0XHRhY3RpdmVDYXRlZ29yeS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufSk7IiwiKGZ1bmN0aW9uKCkge1xuICAgIC8vc2V0IHRoZSBoZWlnaHQgb2YgeW91ciBzZWN0aW9uIHdoaWNoIG1ha2VzIHN0aWNreSBzaXQgYmVsb3cgaXRcbiAgICAvLyB3aW5kb3dIZWlnaHQgYWxvbmUgd2lsbCBwdXNoIGl0IG91dHNpZGUgdGhlIHdpbmRvdyBzbyBkb1xuICAgIC8vd2luZG93IGhlaWdodCAtIDYwXG4gICAgdmFyIHdpbkhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICB2YXIgaGVhZGVySGVpZ2h0ID0gJCgnaGVhZGVyJykub3V0ZXJIZWlnaHQodHJ1ZSk7XG4gICAgJCgnLmludHJvJykuY3NzKCdtYXJnaW5Cb3R0b20nLCAnLScgKyBoZWFkZXJIZWlnaHQgKyAncHgnKTtcbiAgICAkKCdtYWluJykuY3NzKCdwYWRkaW5nVG9wJywgaGVhZGVySGVpZ2h0ICsgJ3B4Jyk7XG5cbiAgICB2YXIgJGV2ZW50U2lkZWJhciA9ICQoJy5sb2NhdGlvbicpO1xuICAgIGlmICgkZXZlbnRTaWRlYmFyLmxlbmd0aCkge1xuICAgICAgICAkZXZlbnRTaWRlYmFyLmNzcygncGFkZGluZ1RvcCcsIGhlYWRlckhlaWdodCArICdweCcpO1xuICAgIH1cblxuXG4gICAgLy9Zb3VyIHN0aWNreSByZWxvY2F0ZSBjb2RlXG4gICAgZnVuY3Rpb24gc3RpY2t5X3JlbG9jYXRlKCkge1xuICAgICAgICB2YXIgd2luZG93X3RvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgICAgdmFyIGRpdl90b3AgPSAkKCcjc3RpY2t5LWFuY2hvcicpLm9mZnNldCgpLnRvcDtcbiAgICAgICAgaWYgKGRpdl90b3AgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuICQoJ2JvZHknKS5hZGRDbGFzcygnaGVhZGVyLXN0aWNrJyk7XG5cbiAgICAgICAgfVxuICAgICAgICBpZiAod2luZG93X3RvcCA+IGRpdl90b3ApIHtcbiAgICAgICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnaGVhZGVyLXN0aWNrJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zdGljaycpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RpY2t5X3JlbG9jYXRlKCk7XG4gICAgJCh3aW5kb3cpLnNjcm9sbChzdGlja3lfcmVsb2NhdGUpO1xufSkoKTtcblxualF1ZXJ5KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigkKSB7XG4gICAgdmFyIGlzTGF0ZXJhbE5hdkFuaW1hdGluZyA9IGZhbHNlO1xuXG4gICAgLy9vcGVuL2Nsb3NlIGxhdGVyYWwgbmF2aWdhdGlvblxuICAgICQoJy5qcy1uYXYtdHJpZ2dlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy9zdG9wIGlmIG5hdiBhbmltYXRpb24gaXMgcnVubmluZ1xuICAgICAgICBpZiggIWlzTGF0ZXJhbE5hdkFuaW1hdGluZyApIHtcbiAgICAgICAgICAgIGlmKCQodGhpcykucGFyZW50cygnLmNzc3RyYW5zaXRpb25zJykubGVuZ3RoID4gMCApIGlzTGF0ZXJhbE5hdkFuaW1hdGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIFRvZ2dsZSB0ZXh0XG4gICAgICAgICAgICB2YXIgdGV4dFRvQ2hhbmdlID0gJCh0aGlzKS5maW5kKCcuanMtbmF2LXRleHQnKS5kYXRhKCd0b2dnbGVUZXh0Jyk7XG4gICAgICAgICAgICB2YXIgYWN0dWFsVGV4dCA9ICQodGhpcykuZmluZCgnLmpzLW5hdi10ZXh0JykudGV4dCgpO1xuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuanMtbmF2LXRleHQnKS50ZXh0KHRleHRUb0NoYW5nZSkuZGF0YSgndG9nZ2xlVGV4dCcsIGFjdHVhbFRleHQpO1xuXG4gICAgICAgICAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ25hdmlnYXRpb24taXMtb3BlbicpO1xuICAgICAgICAgICAgJCgnLm5hdmlnYXRpb24td3JhcHBlcicpLm9uZSgnd2Via2l0VHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCBvVHJhbnNpdGlvbkVuZCBtc1RyYW5zaXRpb25FbmQgdHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgLy9hbmltYXRpb24gaXMgb3ZlclxuICAgICAgICAgICAgICAgIGlzTGF0ZXJhbE5hdkFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucHJpbWFyeS1uYXYgYScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vc3RvcCBpZiBuYXYgYW5pbWF0aW9uIGlzIHJ1bm5pbmdcbiAgICAgICAgaWYoICFpc0xhdGVyYWxOYXZBbmltYXRpbmcgKSB7XG4gICAgICAgICAgICBpZigkKHRoaXMpLnBhcmVudHMoJy5jc3N0cmFuc2l0aW9ucycpLmxlbmd0aCA+IDAgKSBpc0xhdGVyYWxOYXZBbmltYXRpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ25hdmlnYXRpb24taXMtb3BlbicpO1xuICAgICAgICAgICAgJCgnLm5hdmlnYXRpb24td3JhcHBlcicpLm9uZSgnd2Via2l0VHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCBvVHJhbnNpdGlvbkVuZCBtc1RyYW5zaXRpb25FbmQgdHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgLy9hbmltYXRpb24gaXMgb3ZlclxuICAgICAgICAgICAgICAgIGlzTGF0ZXJhbE5hdkFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHZpZGVvIHNpemUgaW4gZGV2aWNlLW1vY2t1cFxuICAgIHJlY2FsY3VsYXRlX3ZpZGVvX3NpemUoKTtcblxuICAgIC8vaGFuZGxlIG5ld3NsZXR0ZXIgZm9ybVxuICAgIG5ld3NsZXR0ZXJGb3JtKCk7XG59KTtcblxuJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICByZWNhbGN1bGF0ZV92aWRlb19zaXplKCk7XG59KTtcblxuZnVuY3Rpb24gcmVjYWxjdWxhdGVfdmlkZW9fc2l6ZSgpIHtcbiAgICB2YXIgJG1vY2t1cCA9ICQoXCIuZGV2aWNlLW1vY2t1cFwiKTtcbiAgICB2YXIgJHNjcmVlbiA9ICRtb2NrdXAuZmluZCgnLnNjcmVlbicpO1xuICAgIHZhciAkdmlkZW9GcmFtZSA9ICRzY3JlZW4uZmluZCgnaWZyYW1lJyk7XG5cbiAgICB2YXIgd2lkdGggPSAkc2NyZWVuLndpZHRoKCk7XG4gICAgdmFyIGhlaWdodCA9ICRzY3JlZW4uaGVpZ2h0KCk7XG5cbiAgICAkdmlkZW9GcmFtZS5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpO1xuICAgICR2aWRlb0ZyYW1lLmF0dHIoJ3dpZHRoJywgd2lkdGgpO1xufVxuXG5cbmZ1bmN0aW9uIG5ld3NsZXR0ZXJGb3JtKCkge1xuICAgIHZhciAkZm9ybSA9ICQoXCIjbmV3c2xldHRlckZvcm1cIik7XG4gICAgaWYgKCEkZm9ybS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciAkd3JhcHBlciA9ICQoXCIjXCIgKyAkZm9ybS5kYXRhKCd3cmFwJykpO1xuICAgIHZhciAkaW5wdXQgPSAkZm9ybS5maW5kKFwiaW5wdXRbbmFtZT0nc3Vic2NyaWJlcl9lbWFpbCddXCIpO1xuXG4gICAgJGZvcm0ub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0RvIHNvbWV0aGluZyB3aXRoIHRoaXMgdXNlciBlbWFpbDogJywgJGlucHV0LnZhbCgpKTtcbiAgICAgICAgJHdyYXBwZXIuYWRkQ2xhc3MoJ2ZsaXBwZWQnKTtcbiAgICB9KVxufSIsImZ1bmN0aW9uIGdldFBhcmFtZXRlckJ5TmFtZSggbmFtZSApe1xuICAgIHZhciByZWdleFMgPSBcIltcXFxcPyZdXCIrbmFtZStcIj0oW14mI10qKVwiLFxuICAgICAgICByZWdleCA9IG5ldyBSZWdFeHAoIHJlZ2V4UyApLFxuICAgICAgICByZXN1bHRzID0gcmVnZXguZXhlYyggd2luZG93LmxvY2F0aW9uLnNlYXJjaCApO1xuICAgIGlmKCByZXN1bHRzID09IG51bGwgKXtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfSBlbHNle1xuICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csIFwiIFwiKSk7XG4gICAgfVxufVxuXG5qUXVlcnkoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCQpe1xuXG4gICAgLy8gRmlsbCB0ZXh0IHdpdGggc2VsZWN0ZWQgZWxlbWVudFxuICAgICQoXCIjZmlsdGVycyB1bFwiKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciAkbGlzdCA9ICQodGhpcyk7XG4gICAgICAgIHZhciAkdHh0ID0gJGxpc3QucHJldigpLmZpbmQoJy50eHQnKTtcbiAgICAgICAgdmFyICRzZWxlY3RlZCA9ICRsaXN0LmZpbmQoJy5hY3RpdmUnKTtcbiAgICAgICAgaWYgKCEkc2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAkc2VsZWN0ZWQgPSAkbGlzdC5jaGlsZHJlbigpLmZpcnN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgJHR4dC50ZXh0KCRzZWxlY3RlZC50ZXh0KCkpO1xuICAgIH0pO1xuXG4gICAgLy8gR2V0ICYgc2V0IGluaXRpYWwgbGlzdCBoZWlnaHQgZm9yIGZpbHRlcnNcbiAgICAkKFwiI2ZpbHRlcnMgdWxcIikuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgaGVpZ2h0ID0gJCh0aGlzKS5vdXRlckhlaWdodCgpO1xuICAgICAgICAkKHRoaXMpLmRhdGEoJ2luaXRpYWwtaGVpZ2h0JywgaGVpZ2h0KTtcbiAgICB9KTtcblxuICAgIC8vIEV2ZW50c1xuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiI2ZpbHRlcnMgdWwgbGlcIiwgZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciAkc2VsZWN0ZWQgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgJGxpc3QgPSAkc2VsZWN0ZWQucGFyZW50KCk7XG4gICAgICAgIHZhciAkdHh0ID0gJGxpc3QucHJldigpLmZpbmQoJy50eHQnKTtcbiAgICAgICAgJGxpc3QuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICRzZWxlY3RlZC5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICR0eHQudGV4dCgkc2VsZWN0ZWQudGV4dCgpKTtcblxuICAgICAgICAkbGlzdC5wcmV2KCkudHJpZ2dlcignY2xpY2snKTtcbiAgICB9KTtcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiI2ZpbHRlcnMgLnNlbGVjdGVkXCIsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciAkc2VsZWN0ID0gJCh0aGlzKTtcbiAgICAgICAgdmFyICRmaWx0ZXIgPSAkc2VsZWN0LnBhcmVudCgpO1xuICAgICAgICB2YXIgJGxpc3QgPSAkZmlsdGVyLmZpbmQoJ3VsJyk7XG4gICAgICAgIGlmICgkZmlsdGVyLmhhc0NsYXNzKCdvcGVuZWQnKSkge1xuICAgICAgICAgICAgJGZpbHRlci5yZW1vdmVDbGFzcygnb3BlbmVkJyk7XG4gICAgICAgICAgICAkbGlzdC5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgICAgIH0sIDMwMCwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkbGlzdC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnbm9uZSdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkZmlsdGVyLmFkZENsYXNzKCdvcGVuZWQnKTtcbiAgICAgICAgJGxpc3QuY3NzKHtcbiAgICAgICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgICAgIGRpc3BsYXk6ICdibG9jaydcbiAgICAgICAgfSk7XG4gICAgICAgICRsaXN0LmFuaW1hdGUoe1xuICAgICAgICAgICAgaGVpZ2h0OiAkbGlzdC5kYXRhKCdpbml0aWFsLWhlaWdodCcpXG4gICAgICAgIH0sIDMwMCk7XG4gICAgfSk7XG5cblxuICAgIC8vIE1peGl0dXVwXG4gICAgbWl4SXRVcC5pbml0KCk7XG4gICAgZmlsdGVycy5pbml0KCk7XG5cbiAgICB2YXIgZmlsdGVyX2xvY2F0aW9uID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdjJyk7XG4gICAgdmFyIGZpbHRlcl9kYXRlID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdkJyk7XG5cblxuICAgIGNvbnNvbGUubG9nKCdUT0RPOiBzZXQgZmlsdGVyIG9uIHBhZ2UgbG9hZCcpXG4gICAgY29uc29sZS5sb2coJ1RPRE86IGFkZCBoaXN0b3J5LmpzIHN1cHBvcnQnKVxuICAgIC8vaWYgKGZpbHRlcl9sb2NhdGlvbikge1xuICAgIC8vICAgIHZhciAkZmlsdGVycyA9ICQoJyNmaWx0ZXJzJyk7XG4gICAgLy8gICAgdmFyICRsaXN0X2VsID0gJGZpbHRlcnMuZmluZChcImxpW2RhdGEtaWQ9J1wiICsgZmlsdGVyX2xvY2F0aW9uICsgXCInXVwiKTtcbiAgICAvLyAgICAkbGlzdF9lbC50cmlnZ2VyKCdjbGljaycpO1xuICAgIC8vICAgICRsaXN0X2VsLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgLy99XG59KTtcblxudmFyIG1peEl0VXAgPSB7XG5cbiAgICBjb25hdGluZXI6ICQoJyNwdXNocycpLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHNlbGYuY29uYXRpbmVyLm1peEl0VXAoe1xuICAgICAgICAgICAgY29udHJvbHM6IHtcbiAgICAgICAgICAgICAgICBlbmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGxpdmU6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2FsbGJhY2tzOiB7XG4gICAgICAgICAgICAgICAgb25NaXhTdGFydDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJCgnLmZhaWwtbWVzc2FnZScpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRpbmctbWVzc2FnZScpLmZhZGVPdXQoMjAwKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uTWl4RmFpbDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJCgnLmZhaWwtbWVzc2FnZScpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uTWl4TG9hZDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jYWxjSGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vbG9hZDoge1xuICAgICAgICAgICAgLy8gICAgZmlsdGVyOiAnLmNpdHlfdHJvam1pYXN0bydcbiAgICAgICAgICAgIC8vfVxuICAgICAgICB9KTtcblxuICAgICAgICAkKHdpbmRvdykuc2Nyb2xsKHNlbGYuY2FsY0hlaWdodCk7XG4gICAgfSxcblxuICAgIGNhbGNIZWlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJHRleHQgPSAkKFwiLmZsaXAgLnRleHRcIik7XG4gICAgICAgIHZhciBoZWlnaHQgPSAkdGV4dC5maXJzdCgpLm91dGVySGVpZ2h0KCk7XG4gICAgICAgICR0ZXh0LmNzcyh7XG4gICAgICAgICAgICBsaW5lSGVpZ2h0OiBoZWlnaHQgKyAncHgnXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbnZhciBmaWx0ZXJzID0ge1xuICAgICRmaWx0ZXJzOiBudWxsLFxuICAgIGdyb3VwczogW10sXG4gICAgb3V0cHV0QXJyYXk6IFtdLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHNlbGYuJGNvbnRhaW5lciA9ICQoJyNwdXNocycpO1xuICAgICAgICBzZWxmLiRmaWx0ZXJzID0gJCgnI2ZpbHRlcnMnKTtcblxuICAgICAgICBzZWxmLmJpbmRIYW5kbGVycygpO1xuICAgIH0sXG5cbiAgICBiaW5kSGFuZGxlcnM6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICBzZWxmLiRmaWx0ZXJzLm9uKCdjbGljaycsICcuZmlsdGVyIGxpJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICB2YXIgdHlwZSA9ICRlbGVtZW50LnBhcmVudHMoJy5maWx0ZXInKS5kYXRhKCd0eXBlJyk7XG4gICAgICAgICAgICB2YXIgYWN0aXZlID0gJGVsZW1lbnQuZGF0YSgnaWQnKTtcbiAgICAgICAgICAgIHZhciBvdXRwdXRTdHJpbmcgPSAgJyc7XG5cbiAgICAgICAgICAgIHNlbGYuZ3JvdXBzW3R5cGVdID0gJy4nICsgdHlwZSAgKyAnXycgKyBhY3RpdmU7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZS5sZW5ndGggfHwgYWN0aXZlID09ICdhbGwnKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlID0gJ2FsbCc7XG4gICAgICAgICAgICAgICAgc2VsZi5ncm91cHNbdHlwZV0gPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIHNlbGYuZ3JvdXBzKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0U3RyaW5nICs9IHNlbGYuZ3JvdXBzW2tleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghb3V0cHV0U3RyaW5nLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG91dHB1dFN0cmluZyA9ICdhbGwnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2cob3V0cHV0U3RyaW5nKTtcbiAgICAgICAgICAgIHNlbGYuJGNvbnRhaW5lci5taXhJdFVwKCdmaWx0ZXInLCBvdXRwdXRTdHJpbmcpO1xuICAgICAgICB9KTtcbiAgICB9XG59OyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
