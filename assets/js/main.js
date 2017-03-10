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

    /* ======= navbar toggle fade in on scroll on small screens ======= */
   $(window).on('resize', function(event){
    var windowSize = $(window).width(); 
        if(windowSize < 768){
            $(window).bind('scroll', function() {
                 if ($(window).scrollTop() > 20) {
                     $('.navbar-toggle').fadeIn();
                 }
                 else {
                     $('.navbar-toggle').fadeOut();
                 }        
            });
        }
    });

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