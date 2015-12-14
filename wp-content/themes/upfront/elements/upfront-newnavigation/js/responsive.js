
;(function($,sr){

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
	  var timeout;

	  return function debounced () {
		  var obj = this, args = arguments;
		  function delayed () {
			  if (!execAsap)
				  func.apply(obj, args);
			  timeout = null;
		  };

		  if (timeout)
			  clearTimeout(timeout);
		  else if (execAsap)
			  func.apply(obj, args);

		  timeout = setTimeout(delayed, threshold || 400);
	  };
  }
  // smartresize
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');

jQuery(document).ready(function($) {

	//Work around for having the region container have a higher z-index if it contains the nav, so that the dropdowns, if overlapping to the following regions should not loose "hover" when the mouse travels down to the next region.
	$('div.upfront-navigation').each(function() {
		if($(this).find('ul.sub-menu').length > 0) {
			$(this).closest('.upfront-output-region-container, .upfront-output-region-sub-container').each(function() {
				$(this).addClass('upfront-region-container-has-nav');
			});
		}
	});

	$('body').on('touchstart click', '.burger_nav_close', null, function() {
		$('div.responsive_nav_toggler').trigger('click');
	});

	$('body').on('touchstart click', '.upfront-navigation .upfront-navigation div.responsive_nav_toggler', null, function(e) {
		e.preventDefault();
		if($(this).parent().find('ul.menu').css('display') == 'none') {
			$(this).closest('div.upfront-output-wrapper').addClass('on_the_top');
			$(this).parent().find('ul.menu').show();
			$(this).parent().find('ul.sub-menu').show();

			var offset = $(this).parent().find('ul.menu').position();

			//$(e.target).closest('.responsive_nav_toggler').css({position: 'fixed', left: offset.left, top: offset.top+(($('div#wpadminbar').length && $('div#wpadminbar').css('display') == 'block')?$('div#wpadminbar').outerHeight():0)});
			//$(this).parent().find('ul.menu').css('padding-top', '60px');
			var close_icon = $('<i class="burger_nav_close"></i>');

			$(this).parent().find('ul.menu').parent().append(close_icon);

			close_icon.css({position: 'fixed', left: offset.left+$(this).parent().find('ul.menu').width()-close_icon.width()-10, top: offset.top+(($('div#wpadminbar').length && $('div#wpadminbar').css('display') == 'block')?$('div#wpadminbar').outerHeight():0) + 10});

			if($(this).parent().data('burger_over') == 'pushes')
				pushContent($(this).parent());

			$(this).closest('.upfront-output-region-container').each(function() {
				$(this).addClass('upfront-region-container-has-nav');
			});
		}
		else {
			$(this).parent().find('ul.menu').hide();
			$(this).parent().find('ul.sub-menu').hide();

			//$(e.target).closest('.responsive_nav_toggler').css({position: '', left: '', top: ''});
			//$(this).parent().find('ul.menu').css('padding-top', '');

			$('i.burger_nav_close').remove();

			$(this).closest('div.upfront-output-wrapper').removeClass('on_the_top');
			if($(this).parent().data('burger_over') == 'pushes')
				pullContent($(this).parent());

			$(this).closest('.upfront-output-region-container').each(function() {
				$(this).removeClass('upfront-region-container-has-nav');
			});
		}
	});

	function pushContent(nav) {
		var currentwidth = $('div#page').width();
		var navwidth = nav.find('ul.menu').width();
		var navheight = nav.find('ul.menu').height();

		$('div#page').css('margin-'+nav.data('burger_alignment'), (nav.data('burger_alignment') == 'top' || nav.data('burger_alignment') == 'whole')?navheight:navwidth);

		if(nav.data('burger_alignment') == 'left' || nav.data('burger_alignment') == 'right') {
			$('div#page').css('width', currentwidth-navwidth);
			$('div#page').css('minWidth', currentwidth-navwidth);
		}
	}

	function pullContent(nav) {
		$('div#page').css('margin-'+nav.data('burger_alignment'), '');
		$('div#page').css('width', '');
		$('div#page').css('minWidth', '');
	}

	function roll_responsive_nav(selector, bpwidth) {

		var elements = (typeof(selector) == 'object')?selector:$(selector);
		elements.each(function () {

			var breakpoints = $(this).data('breakpoints');

			var bparray = new Array();

			var currentwidth = (typeof(bpwidth) != 'undefined') ? parseInt(bpwidth):$(window).width();

			for (var key in breakpoints) {
				bparray.push(breakpoints[key])
			}

			bparray.sort(function(a, b) {
				return a.width - b.width;
			});

			for (var key in bparray) {
				if(parseInt(currentwidth) >= parseInt(bparray[key]['width'])) {

					if(bparray[key]['burger_menu'] == 'yes') {

						$(this).attr('data-style', 'burger');
						$(this).attr('data-aliment', ( bparray[key]['menu_alignment'] ? bparray[key]['menu_alignment'] : $(this).data('alimentbk') ));
						$(this).attr('data-burger_alignment', bparray[key]['burger_alignment']);
						$(this).attr('data-burger_over', bparray[key]['burger_over']);

						// Add responsive nav toggler
						if(!$(this).find('div.responsive_nav_toggler').length)
							$(this).prepend($('<div class="responsive_nav_toggler"><div></div><div></div><div></div></div>'));

						//offset a bit if admin bar or side bar is present
						if($('div#wpadminbar').length && $('div#wpadminbar').css('display') == 'block') {
							$(this).find('ul.menu').css('margin-top', $('div#wpadminbar').outerHeight());
							//$(this).find('div.responsive_nav_toggler').css('margin-top', $('div#wpadminbar').outerHeight());
						}

						if($(this).hasClass('upfront-output-unewnavigation')) {

							$('head').find('style#responsive_nav_sidebar_offset').remove();
							var responsive_css = 'div.upfront-navigation div[data-style="burger"][ data-burger_alignment="top"] ul.menu, div.upfront-navigation div[data-style="burger"][ data-burger_alignment="whole"] ul.menu {left:'+parseInt($('div.upfront-regions').offset().left)+'px !important; right:'+parseInt(($(window).width()-currentwidth-$('div#sidebar-ui').outerWidth()) / 2)+'px !important; } ';

							responsive_css = responsive_css + 'div.upfront-navigation div[data-style="burger"][ data-burger_alignment="left"] ul.menu {left:'+parseInt($('div.upfront-regions').offset().left)+'px !important; right:inherit !important; width:'+parseInt(30/100*$('div.upfront-regions').outerWidth())+'px !important;} ';

							responsive_css = responsive_css + 'div.upfront-navigation div[data-style="burger"][ data-burger_alignment="right"] ul.menu {left:inherit !important; right:'+parseInt(($(window).width()-currentwidth-$('div#sidebar-ui').outerWidth()) / 2)+'px !important; width:'+parseInt(30/100*$('div.upfront-regions').outerWidth())+'px !important; } ';
							responsive_css = responsive_css + 'div.upfront-navigation div[data-style="burger"] ul.menu {top:'+parseInt($('div#upfront-ui-topbar').outerHeight())+'px !important; } ';

							$('head').append($('<style id="responsive_nav_sidebar_offset">'+responsive_css+'</style>'));
						}
						//Z-index the container module to always be on top, in the layout edit mode
						$(this).closest('div.upfront-newnavigation_module').css('z-index', 3);


						$(this).find('ul.menu').hide();
					}
					else {
						$(this).attr('data-style', ( bparray[key]['menu_style'] ? bparray[key]['menu_style'] : $(this).data('stylebk') ));
						$(this).attr('data-aliment', ( bparray[key]['menu_alignment'] ? bparray[key]['menu_alignment'] : $(this).data('alimentbk') ));
						$(this).removeAttr('data-burger_alignment','');
						$(this).removeAttr('data-burger_over', '');

						// Remove responsive nav toggler
						$(this).find('div.responsive_nav_toggler').remove();
						$(this).find('ul.menu').show();

						//remove any display:block|none specifications from the sub-menus
						$(this).find('ul.menu, ul.sub-menu').each(function() {
							$(this).css('display', '');
						});

						// remove any adjustments done because of the sidebar or the adminbar
						if($('div#wpadminbar').length) {
							$(this).find('ul.menu').css('margin-top', '');
						}


						//remove the z-index from the container module
						$(this).closest('div.upfront-newnavigation_module').css('z-index', '');
					}

				}
			}
		});
	}
	roll_responsive_nav(".upfront-output-unewnavigation > .upfront-navigation");
	
	$(window).smartresize(function() {
		$('.responsive_nav_toggler').css({position: '', left: '', top: ''});
		$('ul.menu').css('padding-top', '');
		$('.burger_nav_close').remove();
		roll_responsive_nav(".upfront-output-unewnavigation > .upfront-navigation");
	});

/*
	$(window).on('load', function() {

		if( $("html").hasClass("ie8") ) {
			$(window).resize(function() {
				$('.responsive_nav_toggler').css({position: '', left: '', top: ''});
				$('ul.menu').css('padding-top', '');
				$('.burger_nav_close').remove();
				roll_responsive_nav(".upfront-output-unewnavigation > .upfront-navigation");
			});
		} else {
			$(window).resize(_.debounce(function() {
				
				$('.responsive_nav_toggler').css({position: '', left: '', top: ''});
				$('ul.menu').css('padding-top', '');
				$('.burger_nav_close').remove();
				roll_responsive_nav(".upfront-output-unewnavigation > .upfront-navigation");
			}, 500));
		}
		
	});
*/	
	$(document).on('changed_breakpoint', function(e) {
		roll_responsive_nav( e.selector, e.width);
	});
});

