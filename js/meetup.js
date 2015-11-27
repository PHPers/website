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