/*
	SCROLLY DOTS

	JQuery plugin for vertical scrolling navigation

	Author: Shannon Smith	
*/
(function ( $ ) {

	$.fn.ScrollyDots = function( options ) {

        var defaults = {
        	active_class: "active", // CSS class for the current dot
			element: "a", // the elements inside of the selectors div
			static_height: false,	// whether or not the elements on the page will change heights	 
        	ind_section_scroller: true, // Activates a nav to allow scrolling on each section
        	ind_section_scroll_class: "section-scroll"
        };

        var constants = {
        	WINDOW_OFFSET: 0.15, // Percentage of sections height to denote as the mid-line
        	SCROLL_EVAL_DELAY: 300, // Delay for after the user stops scrolling 
        	SCROLL_TIMING: 700 // Animation timing for manual scroll
        };

        var vars = {
        	id_list: [],
        	positions: [],
        	timeout: null
        };

        var settings = $.extend( {}, defaults, options );
	 	
	 	return this.each(function() {
	 		var DOTS = this,
	 		ITEMS = $(DOTS).find(settings.element);

	 		var methods = {
				init: function() {
					var length = $(DOTS).find(settings.element).length;
					$(DOTS).find(settings.element).each(function(i) { // populate IDs based on elements inside of container
						var id = this.hash,
						pos = $(id).offset().top;

						vars.positions.push(pos);
						vars.id_list.push(id);

						if(settings.ind_section_scroller && i < length - 1) { // add scrolling nav to individual sections
							methods.add_section_nav($(id));
						}
					});

					methods.evt_handlers();
				},

				evt_handlers: function() { 
					$(ITEMS).on("click", function(e) { // click for dots
						e.preventDefault();
						e.stopImmediatePropagation();
						$(window).off("scroll", methods.delay);

						var i = $(this).index();
						methods.manual_scroll.activate(e, i, true);
					});

					if(settings.ind_section_scroller) { // if individual sections also have navigation experience
						$("." + settings.ind_section_scroll_class).on("click", function(e) { // click for section arrows

							e.preventDefault();
							e.stopImmediatePropagation();
							$(window).off("scroll", methods.delay);

							var curr_location = $(this).attr("href"),
							i = $(curr_location).index() + 1;

							methods.manual_scroll.activate(e, i);

						});
					}

					$(window).on("scroll", methods.delay); // when window is scrolled
				},

				delay: function() { // when scrolling stop
					if (vars.timeout) {
						clearTimeout(vars.timeout);
						vars.timeout = null;
					}
					vars.timeout = setTimeout(function() {
						clearTimeout(this.timeout);
						vars.timeout = null;
						methods.active_scroll.activate();
					}, constants.SCROLL_EVAL_DELAY);
				},

				setActive: function(el) {
					if(!el.hasClass(settings.active_class)) {
						ITEMS.removeClass(settings.active_class);
						el.addClass(settings.active_class);
					}
				},

				add_section_nav: function(el) {
					var id = el.attr("id");
					$(el).append("<a href='#" + id + "' class='" + settings.ind_section_scroll_class + "'>&dArr;</a>");
				},

				manual_scroll: { // fired from clicking on nav

					activate: function(e, index, set_active) {
						var obj = methods.manual_scroll, 
						id =  e.target.hash.replace("#", ""); 
						
						if(set_active) {
							methods.setActive($(e.target));
						}

						var y = settings.static_height ? obj.getLocation($(e.target.hash)) : vars.positions[index];
						obj.scrollToY(y, id);
					},

					getLocation: function(el) {
						return el.offset().top;
					},

					scrollToY: function(y, target) { // scroll to point
						$('html, body').stop().animate({
					        'scrollTop': y
					    }, constants.SCROLL_TIMING, 'swing', function() {
					        window.location.hash = target;
					        $(window).on("scroll", methods.delay);  // turn back on window event handler
					    });
					}
				},
				
				active_scroll: { // fired from scrolling window

					activate: function() {
						var y = methods.active_scroll.getLocation(),
						pos_length = vars.positions.length;
						item = 0;

						if(y > 0) {
							if(y > vars.positions[pos_length - 1]) { // default to last nav item if window is below all sections
								item = pos_length - 1;
							}

							for ( var i = 0; i < pos_length; i++) {
								var isActive = this.evalLocation(y, vars.positions[i]);
								if(!isActive) {
									item = i - 1;
									break;
								}
							}
						} 

						methods.setActive(ITEMS.eq(item));
					},

					evalLocation: function(y, section) {
						return (y >= section) ? true : false;
					},

					getLocation: function() { // identify the current position of the document
						return document.body.scrollTop + methods.active_scroll.get_offset();
					},

					get_offset: function() { // determine section mid-line (active line)
						var h = window.innerHeight;
						return h * constants.WINDOW_OFFSET;
					}					
				}
			}

			methods.init();
    	});
	};
}( jQuery ));


