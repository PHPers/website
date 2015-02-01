
/*
Lightbox v2.51
by Lokesh Dhakar - http://www.lokeshdhakar.com

For more information, visit:
http://lokeshdhakar.com/projects/lightbox2/

Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
- free for use in both personal and commercial projects
- attribution requires leaving author name, author link, and the license info intact
	
Thanks
- Scott Upton(uptonic.com), Peter-Paul Koch(quirksmode.com), and Thomas Fuchs(mir.aculo.us) for ideas, libs, and snippets.
- Artemy Tregubenko (arty.name) for cleanup and help in updating to latest proto-aculous in v2.05.


Table of Contents
=================
LightboxOptions

Lightbox
- constructor
- init
- enable
- build
- start
- changeImage
- sizeContainer
- showImage
- updateNav
- updateDetails
- preloadNeigbhoringImages
- enableKeyboardNav
- disableKeyboardNav
- keyboardAction
- end

options = new LightboxOptions
lightbox = new Lightbox options
*/

(function() {
  var $, Lightbox, LightboxOptions;

  $ = jQuery;

  LightboxOptions = (function() {

    function LightboxOptions() {
      this.fileLoadingImage = '/img/loading.gif';
      this.fileCloseImage = '/img/close.png';
      this.resizeDuration = 700;
      this.fadeDuration = 500;
      this.labelImage = "Image";
      this.labelOf = "of";
    }

    return LightboxOptions;

  })();

  Lightbox = (function() {

    function Lightbox(options) {
      this.options = options;
      this.album = [];
      this.currentImageIndex = void 0;
      this.init();
    }

    Lightbox.prototype.init = function() {
      this.enable();
      return this.build();
    };

    Lightbox.prototype.enable = function() {
      var _this = this;
      return $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox]', function(e) {
        _this.start($(e.currentTarget));
        return false;
      });
    };

    Lightbox.prototype.build = function() {
      var $lightbox,
        _this = this;
      $("<div>", {
        id: 'lightboxOverlay'
      }).after($('<div/>', {
        id: 'lightbox'
      }).append($('<div/>', {
        "class": 'lb-outerContainer'
      }).append($('<div/>', {
        "class": 'lb-container'
      }).append($('<img/>', {
        "class": 'lb-image'
      }), $('<div/>', {
        "class": 'lb-nav'
      }).append($('<a/>', {
        "class": 'lb-prev'
      }), $('<a/>', {
        "class": 'lb-next'
      })), $('<div/>', {
        "class": 'lb-loader'
      }).append($('<a/>', {
        "class": 'lb-cancel'
      }).append($('<img/>', {
        src: this.options.fileLoadingImage
      }))))), $('<div/>', {
        "class": 'lb-dataContainer'
      }).append($('<div/>', {
        "class": 'lb-data'
      }).append($('<div/>', {
        "class": 'lb-details'
      }).append($('<span/>', {
        "class": 'lb-caption'
      }), $('<span/>', {
        "class": 'lb-number'
      })), $('<div/>', {
        "class": 'lb-closeContainer'
      }).append($('<a/>', {
        "class": 'lb-close'
      }).append($('<img/>', {
        src: this.options.fileCloseImage
      }))))))).appendTo($('body'));
      $('#lightboxOverlay').hide().on('click', function(e) {
        _this.end();
        return false;
      });
      $lightbox = $('#lightbox');
      $lightbox.hide().on('click', function(e) {
        if ($(e.target).attr('id') === 'lightbox') _this.end();
        return false;
      });
      $lightbox.find('.lb-outerContainer').on('click', function(e) {
        if ($(e.target).attr('id') === 'lightbox') _this.end();
        return false;
      });
      $lightbox.find('.lb-prev').on('click', function(e) {
        _this.changeImage(_this.currentImageIndex - 1);
        return false;
      });
      $lightbox.find('.lb-next').on('click', function(e) {
        _this.changeImage(_this.currentImageIndex + 1);
        return false;
      });
      $lightbox.find('.lb-loader, .lb-close').on('click', function(e) {
        _this.end();
        return false;
      });
    };

    Lightbox.prototype.start = function($link) {
      var $lightbox, $window, a, i, imageNumber, left, top, _len, _ref;
      $(window).on("resize", this.sizeOverlay);
      $('select, object, embed').css({
        visibility: "hidden"
      });
      $('#lightboxOverlay').width($(document).width()).height($(document).height()).fadeIn(this.options.fadeDuration);
      this.album = [];
      imageNumber = 0;
      if ($link.attr('rel') === 'lightbox') {
        this.album.push({
          link: $link.attr('href'),
          title: $link.attr('title')
        });
      } else {
        _ref = $($link.prop("tagName") + '[rel="' + $link.attr('rel') + '"]');
        for (i = 0, _len = _ref.length; i < _len; i++) {
          a = _ref[i];
          this.album.push({
            link: $(a).attr('href'),
            title: $(a).attr('title')
          });
          if ($(a).attr('href') === $link.attr('href')) imageNumber = i;
        }
      }
      $window = $(window);
      top = $window.scrollTop() + $window.height() / 10;
      left = $window.scrollLeft();
      $lightbox = $('#lightbox');
      $lightbox.css({
        top: top + 'px',
        left: left + 'px'
      }).fadeIn(this.options.fadeDuration);
      this.changeImage(imageNumber);
    };

    Lightbox.prototype.changeImage = function(imageNumber) {
      var $image, $lightbox, preloader,
        _this = this;
      this.disableKeyboardNav();
      $lightbox = $('#lightbox');
      $image = $lightbox.find('.lb-image');
      this.sizeOverlay();
      $('#lightboxOverlay').fadeIn(this.options.fadeDuration);
      $('.loader').fadeIn('slow');
      $lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();
      $lightbox.find('.lb-outerContainer').addClass('animating');
      preloader = new Image;
      preloader.onload = function() {
        $image.attr('src', _this.album[imageNumber].link);
        $image.width = preloader.width;
        $image.height = preloader.height;
        return _this.sizeContainer(preloader.width, preloader.height);
      };
      preloader.src = this.album[imageNumber].link;
      this.currentImageIndex = imageNumber;
    };

    Lightbox.prototype.sizeOverlay = function() {
      return $('#lightboxOverlay').width($(document).width()).height($(document).height());
    };

    Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
      var $container, $lightbox, $outerContainer, containerBottomPadding, containerLeftPadding, containerRightPadding, containerTopPadding, newHeight, newWidth, oldHeight, oldWidth,
        _this = this;
      $lightbox = $('#lightbox');
      $outerContainer = $lightbox.find('.lb-outerContainer');
      oldWidth = $outerContainer.outerWidth();
      oldHeight = $outerContainer.outerHeight();
      $container = $lightbox.find('.lb-container');
      containerTopPadding = parseInt($container.css('padding-top'), 10);
      containerRightPadding = parseInt($container.css('padding-right'), 10);
      containerBottomPadding = parseInt($container.css('padding-bottom'), 10);
      containerLeftPadding = parseInt($container.css('padding-left'), 10);
      newWidth = imageWidth + containerLeftPadding + containerRightPadding;
      newHeight = imageHeight + containerTopPadding + containerBottomPadding;
      if (newWidth !== oldWidth && newHeight !== oldHeight) {
        $outerContainer.animate({
          width: newWidth,
          height: newHeight
        }, this.options.resizeDuration, 'swing');
      } else if (newWidth !== oldWidth) {
        $outerContainer.animate({
          width: newWidth
        }, this.options.resizeDuration, 'swing');
      } else if (newHeight !== oldHeight) {
        $outerContainer.animate({
          height: newHeight
        }, this.options.resizeDuration, 'swing');
      }
      setTimeout(function() {
        $lightbox.find('.lb-dataContainer').width(newWidth);
        $lightbox.find('.lb-prevLink').height(newHeight);
        $lightbox.find('.lb-nextLink').height(newHeight);
        _this.showImage();
      }, this.options.resizeDuration);
    };

    Lightbox.prototype.showImage = function() {
      var $lightbox;
      $lightbox = $('#lightbox');
      $lightbox.find('.lb-loader').hide();
      $lightbox.find('.lb-image').fadeIn('slow');
      this.updateNav();
      this.updateDetails();
      this.preloadNeighboringImages();
      this.enableKeyboardNav();
    };

    Lightbox.prototype.updateNav = function() {
      var $lightbox;
      $lightbox = $('#lightbox');
      $lightbox.find('.lb-nav').show();
      if (this.currentImageIndex > 0) $lightbox.find('.lb-prev').show();
      if (this.currentImageIndex < this.album.length - 1) {
        $lightbox.find('.lb-next').show();
      }
    };

    Lightbox.prototype.updateDetails = function() {
      var $lightbox,
        _this = this;
      $lightbox = $('#lightbox');
      if (typeof this.album[this.currentImageIndex].title !== 'undefined' && this.album[this.currentImageIndex].title !== "") {
        $lightbox.find('.lb-caption').html(this.album[this.currentImageIndex].title).fadeIn('fast');
      }
      if (this.album.length > 1) {
        $lightbox.find('.lb-number').html(this.options.labelImage + ' ' + (this.currentImageIndex + 1) + ' ' + this.options.labelOf + '  ' + this.album.length).fadeIn('fast');
      } else {
        $lightbox.find('.lb-number').hide();
      }
      $lightbox.find('.lb-outerContainer').removeClass('animating');
      $lightbox.find('.lb-dataContainer').fadeIn(this.resizeDuration, function() {
        return _this.sizeOverlay();
      });
    };

    Lightbox.prototype.preloadNeighboringImages = function() {
      var preloadNext, preloadPrev;
      if (this.album.length > this.currentImageIndex + 1) {
        preloadNext = new Image;
        preloadNext.src = this.album[this.currentImageIndex + 1].link;
      }
      if (this.currentImageIndex > 0) {
        preloadPrev = new Image;
        preloadPrev.src = this.album[this.currentImageIndex - 1].link;
      }
    };

    Lightbox.prototype.enableKeyboardNav = function() {
      $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
    };

    Lightbox.prototype.disableKeyboardNav = function() {
      $(document).off('.keyboard');
    };

    Lightbox.prototype.keyboardAction = function(event) {
      var KEYCODE_ESC, KEYCODE_LEFTARROW, KEYCODE_RIGHTARROW, key, keycode;
      KEYCODE_ESC = 27;
      KEYCODE_LEFTARROW = 37;
      KEYCODE_RIGHTARROW = 39;
      keycode = event.keyCode;
      key = String.fromCharCode(keycode).toLowerCase();
      if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
        this.end();
      } else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
        if (this.currentImageIndex !== 0) {
          this.changeImage(this.currentImageIndex - 1);
        }
      } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
        if (this.currentImageIndex !== this.album.length - 1) {
          this.changeImage(this.currentImageIndex + 1);
        }
      }
    };

    Lightbox.prototype.end = function() {
      this.disableKeyboardNav();
      $(window).off("resize", this.sizeOverlay);
      $('#lightbox').fadeOut(this.options.fadeDuration);
      $('#lightboxOverlay').fadeOut(this.options.fadeDuration);
      return $('select, object, embed').css({
        visibility: "visible"
      });
    };

    return Lightbox;

  })();

  $(function() {
    var lightbox, options;
    options = new LightboxOptions;
    return lightbox = new Lightbox(options);
  });

}).call(this);

//NAVIGATION

jQuery(document).ready(function() {
	 
	//navigation BUTTON ACTION (ON CLICK DO THE FOLLOWING)
	jQuery('.navigationButton').click(function() {

		//REMOVE THE ON CLASS FROM ALL BUTTONS
		jQuery('.navigationButton').removeClass('on');
		  
		//NO MATTER WHAT WE CLOSE ALL OPEN SLIDES
	 	jQuery('.navigationContent').slideUp('normal');
   
		//IF THE NEXT SLIDE WASN'T OPEN THEN OPEN IT
		if(jQuery(this).next().is(':hidden') == true) {
			
			//ADD THE ON CLASS TO THE BUTTON
			jQuery(this).addClass('on');
			  
			//OPEN THE SLIDE
			jQuery(this).next().slideDown('normal');
		 } 
		  
	 });
	  
	
	jQuery('#navigation li').hover(
	       function () {
	           //show its submenu
	           jQuery('ul', this).stop().slideDown(400);
	
	       }, 
	       function () {
	           //hide its submenu
	           jQuery('ul', this).stop().fadeOut(100);          
	       }
	   );
	
	
	/********************************************************************************************************************
	CLOSES ALL S ON PAGE LOAD
	********************************************************************************************************************/	
	jQuery('.navigationContent').hide();

});

// PORTFOLIO FILTER

jQuery(document).ready(function() {  
    jQuery('ul#filter a').click(function() {  
        jQuery(this).css('outline','none');  
        jQuery('ul#filter .current').removeClass('current');  
        jQuery(this).parent().addClass('current');  
          
        var filterVal = $(this).text().toLowerCase().replace(/ /g,'-');  
                  
        if(filterVal == 'all') {  
            jQuery('ul#portfolio li.hidden').fadeIn('slow').removeClass('hidden');  
        } else {  
            jQuery('ul#portfolio li').each(function() {  
                if(!jQuery(this).hasClass(filterVal)) {  
                    jQuery(this).fadeOut('normal').addClass('hidden');  
                } else {  
                    jQuery(this).fadeIn('slow').removeClass('hidden');  
                }  
            });  
        }  
          
        return false;  
    });  
});

// ACCORDION

jQuery(document).ready(function() {
	 
	//ACCORDION BUTTON ACTION (ON CLICK DO THE FOLLOWING)
	jQuery('.accordionButton').click(function() {

		//REMOVE THE ON CLASS FROM ALL BUTTONS
		jQuery('.accordionButton').removeClass('on');
		  
		//NO MATTER WHAT WE CLOSE ALL OPEN SLIDES
	 	jQuery('.accordionContent').slideUp('normal');
   
		//IF THE NEXT SLIDE WASN'T OPEN THEN OPEN IT
		if(jQuery(this).next().is(':hidden') == true) {
			
			//ADD THE ON CLASS TO THE BUTTON
			jQuery(this).addClass('on');
			  
			//OPEN THE SLIDE
			jQuery(this).next().slideDown('normal');
		 } 
		  
	 });
	  
	
	/*** REMOVE IF MOUSEOVER IS NOT REQUIRED ***/
	
	//ADDS THE .OVER CLASS FROM THE STYLESHEET ON MOUSEOVER 
	jQuery('.accordionButton').mouseover(function() {
		jQuery(this).addClass('over');
		
	//ON MOUSEOUT REMOVE THE OVER CLASS
	}).mouseout(function() {
		jQuery(this).removeClass('over');										
	});
	
	/*** END REMOVE IF MOUSEOVER IS NOT REQUIRED ***/
	
	
	/********************************************************************************************************************
	CLOSES ALL S ON PAGE LOAD
	********************************************************************************************************************/	
	jQuery('.accordionContent').hide();

});


// TABS 

jQuery(document).ready(function(){
	jQuery('#tabs div').hide();
	jQuery('#tabs div:first').show();
	jQuery('#tabs ul li:first').addClass('active');
 
	jQuery('#tabs ul li a').click(function(){
		jQuery('#tabs ul li').removeClass('active');
		jQuery(this).parent().addClass('active');
		var currentTab = jQuery(this).attr('href');
		jQuery('#tabs div').hide();
		jQuery(currentTab).show();
		return false;
		});
});


// CONTACT FORM

jQuery(document).ready(function(){

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

});

// //RESPONSIVE VIDEO
// 
// jQuery(document).ready(function(){
//     // Target your .container, .wrapper, .post, etc.
//     jQuery('.video.entry').fitVids();
//   });
  
//PLUGINS

//jQuery(document).ready(function() {
//
//	jQuery('#tweets').tweetable({
//			username: 'username', // Set your twitter username here
//			time: true,
//			limit: 2,
//			position: 'append'
//				
//		});
//		 
//		$('#flickrs').jflickrfeed({
//			limit: 6,
//			qstrings: {
//				id: '52617155@N08' // Set your flickr ID here
//			},
//			itemTemplate: 
//			'<li>' +
//				'<a class="screen-roll" href="{{image_b}}"><span></span><img src="{{image_s}}" alt="{{title}}" /></a>' +
//			'</li>'});
//		
//});  

// Contact form

jQuery(function($)  
{
    $("#contact_form").submit(function()
    {
        var email = $("#contact_email").val(); // get email field value
        var name = $("#contact_name").val(); // get name field value
        var msg = $("#contact_message").val(); // get message field value
        $.ajax(
        {
            type: "POST",
            url: "https://mandrillapp.com/api/1.0/messages/send.json",
            data: {
                'key': 'MBqj_q5SdFzpS-i4FNu_OA',
                'message': {
                    'from_email': email,
                    'from_name': name,
                    'headers': {
                        'Reply-To': email
                    },
                    'subject': 'Website Contact Form Submission',
                    'text': msg,
                    'to': [
                    {
                        'email': 'leafnode+contact@gmail.com',
                        'name': 'phpers contact',
                        'type': 'to'
                    }]
                }
            }
        })
        .done(function(response) {
            alert('Wiadomość została wysłana. Odezwiemy się wkrótce!'); // show success message
            $("#contact_name").val(''); // reset field after successful submission
            $("#contact_email").val(''); // reset field after successful submission
            $("#contact_message").val(''); // reset field after successful submission
        })
        .fail(function(response) {
            alert('Bład przy wysyłaniu wiadomości.');
        });
        return false; // prevent page refresh
    });
});
