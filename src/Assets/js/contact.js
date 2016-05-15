var $ = require('jquery');

module.exports = function (e) {
    $(document).ready(function(){
        if (jQuery('#contactform').length) {
            jQuery('#contactform').submit(function(){

                var action = jQuery(this).attr('action');

                jQuery("#alert").slideUp(750,function() {
                    jQuery('#alert').hide();

                    jQuery('#submit')
                        .after('<img src="images/ajax-loader.gif" class="loader" />')
                        .attr('disabled','disabled');

                    jQuery.post(action, {
                            name: jQuery('#name').val(),
                            email: jQuery('#email').val(),
                            message: jQuery('#message').val()
                        },
                        function(data){
                            document.getElementById('alert').innerHTML = data;
                            jQuery('#alert').slideDown('slow');
                            jQuery('#contactform img.loader').fadeOut('slow',function(){jQuery(this).remove()});
                            jQuery('#submit').removeAttr('disabled');
                            if(data.match('success') != null) jQuery('#contactform').slideUp('slow');

                        }
                    );

                });

                return false;
            });
        }
    });
};