var $          = require('jquery');
var mixitup    = require('mixitup');

$(document).ready(function($){
    // Init mixitup
    function calcHeight() {
        var $text = $(".flip .text");
        var height = $text.first().outerHeight();
        $text.css({
          lineHeight: height + 'px'
        });
    }

    var mixerContainer = '#pushs';
    var mixerFilters = '#filters';
    if (!$(mixerContainer).length) {
        return;
    }

    var mixer = mixitup(mixerContainer, {
        controls: {
            enable: false,
            live: false
        },
        callbacks: {
            onMixStart: function(){
                // calcHeight();
                $('.fail-message').hide();
                $('.loading-message').fadeOut(200);
            },
            onMixFail: function(){
                $('.fail-message').show();
            }
        },
        //load: {
        //    filter: '.city_trojmiasto'
        //}
    });
  window.mymixer = mixer;

    $(window).scroll(calcHeight);

    var groups = [];
    $(document).on('click', mixerFilters + ' .filter li', function(e){
        var $element = $(e.currentTarget);
        var type = $element.parents('.filter').data('type');
        var active = $element.data('id');
        var outputString =  '';

        groups[type] = '.' + type  + '_' + active;
        if (!active.length || active == 'all') {
            active = 'all';
            groups[type] = '';
        }

        for (var key in groups) {
            outputString += groups[key];
        }

        if (!outputString.length) {
            outputString = 'all';
        }
        console.log(outputString);
        mixer.filter(outputString).then(function(state) {
          console.log(state.totalShow); // true
        });;
    });

    // --- //

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
});