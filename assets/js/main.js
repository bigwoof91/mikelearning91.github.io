jQuery(document).ready(function($) {

    /* ======= Scrollspy ======= */
    $('body').scrollspy({ target: '#header', offset: 400});
    
    /* ======= Fixed header when scrolled ======= */
    
    $(window).bind('scroll', function() {
         if ($(window).scrollTop() > 50) {
             $('#header').addClass('navbar-fixed-top');
         }
         else {
             $('#header').removeClass('navbar-fixed-top');
         }
    });
    
    /* ======= click on logo go to homepage ======= */
    $(".logo-title").on('click', function () {
        window.location = "index.html";
    });

    /* ======= navbar toggle fade in on scroll ======= */
    $(window).bind('scroll', function() {
         if ($(window).scrollTop() > 20) {
             $('.navbar-toggle').fadeIn();
         }
         else {
             $('.navbar-toggle').fadeOut('fast');
         }        
    });

    /* ======= navbar toggle animation ======= */
    (function() {

      "use strict";

      var toggles = document.querySelectorAll(".c-hamburger");

      for (var i = toggles.length - 1; i >= 0; i--) {
        var toggle = toggles[i];
        toggleHandler(toggle);
      };

      function toggleHandler(toggle) {
        toggle.addEventListener( "click", function(e) {
          e.preventDefault();
          (this.classList.contains("is-active") === true) ? this.classList.remove("is-active") : this.classList.add("is-active");
        });
      }

    })();

    /* ======= ScrollTo ======= */
    $('a.scrollto').on('click', function(e){
        
        //store hash
        var target = this.hash;
                
        e.preventDefault();
        
		$('body').scrollTo(target, 800, {offset: -70, 'axis':'y', easing:'easeOutQuad'});
        //Collapse mobile menu after clicking
		if ($('.navbar-collapse').hasClass('in')){
			$('.navbar-collapse').removeClass('in').addClass('collapse');
		}
		
	});

});