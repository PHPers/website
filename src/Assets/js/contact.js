var $ = require('$');

module.exports = function (e) {
    $(document).ready(function(){
        if ($('#contactform').length) {
            $('#contactform').submit(function(){

                var action = $(this).attr('action');

                $("#alert").slideUp(750,function() {
                    $('#alert').hide();

                    $('#submit')
                        .after('<img src="images/ajax-loader.gif" class="loader" />')
                        .attr('disabled','disabled');

                    $.post(action, {
                            name: $('#name').val(),
                            email: $('#email').val(),
                            message: $('#message').val()
                        },
                        function(data){
                            document.getElementById('alert').innerHTML = data;
                            $('#alert').slideDown('slow');
                            $('#contactform img.loader').fadeOut('slow',function(){$(this).remove()});
                            $('#submit').removeAttr('disabled');
                            if(data.match('success') != null) $('#contactform').slideUp('slow');

                        }
                    );

                });

                return false;
            });
        }
    });
};