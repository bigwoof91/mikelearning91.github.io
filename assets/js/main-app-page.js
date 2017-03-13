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

    /* ======= displays hamburger toggle always ======= */
    $('#navBarToggle').css('display', 'block');
    $('html').css('background', '#17baef').css('height', '100%');
    $('header').css('z-index', '1');

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

    /* ======= adjust height of appContainer to the height of absolute step containers, in order to fit in screens ======= */
    var biggestHeight = "0";
    $(".box").each(function(){
        if ($(this).height() > biggestHeight ) {
            biggestHeight = $(this).height()
        }
    });
    $("#appContainer").height(biggestHeight);

    /* ======= fade in and fade out tip before taking selfie ======= */
    $('.overlay-advice').delay(500).fadeIn('slow').delay(1500).fadeOut('slow');

});