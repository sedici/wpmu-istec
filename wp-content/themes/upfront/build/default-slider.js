(function(e){var t=function(e,t,n){var r,i,s,o=null,u=0;n||(n={});var a=function(){u=n.leading===!1?0:(new Date).getTime(),o=null,s=e.apply(r,i),o||(r=i=null)};return function(){var l=(new Date).getTime();u||n.leading!==!1||(u=l);var p=t-(l-u);return r=this,i=arguments,0>=p||p>t?(clearTimeout(o),o=null,u=l,s=e.apply(r,i),o||(r=i=null)):o||n.trailing===!1||(o=setTimeout(a,p)),s}};e.fn.upfront_default_slider=function(t){var r=typeof t=="string",i;return this.each(function(){var s=e(this),o=s.data("uslider");o?r&&(i=o.callMethod(t)):r?e.error("Can't call the ueditor method "+t+". The slider is not initialized"):s.data("uslider",new n(s,t))}),this.length==1&typeof i!="undefined"?i:this};var n=function(t,n){var r=this,i=e.extend({auto:!0,interval:5e3,auto_height:!0,control:"outside",control_num:!0,control_next_prev:!0,show_control:"always",effect:"crossfade",classname:{slider:"upfront-default-slider",slider_wrap:"upfront-default-slider-wrap",item:"upfront-default-slider-item",nav:"upfront-default-slider-nav",nav_item:"upfront-default-slider-nav-item",prev:"upfront-default-slider-nav-prev",next:"upfront-default-slider-nav-next"},adjust_slide_size:!0,starting_slide:0,caption_height:!1},n),s=i.item?t.find(">"+i.item):t.find(">."+i.classname.item);this.$slider=t.data("slider-applied",!0).addClass(i.classname.slider).append('<div class="'+i.classname.slider_wrap+'" />'),this.opts=i,this.index=0,this.pause=!1,this.timer=!1,this.update_configs(),this.update_items(s),this.$slider.append(e('<div class="'+i.classname.nav+'" />')),this.update_nav(),i.control_next_prev&&this.prev_next_navigation(),this.slider_switch(i.starting_slide),this.update_auto_slide(),this.bind_events()};n.prototype={callMethod:function(e){switch(e){case"next":this.next();break;case"prev":this.prev()}},update_configs:function(){var e=this.$slider,t=e.attr("data-slider-auto"),n=this.opts;e.removeClass(n.classname.slider+"-control-"+n.control),e.removeClass(n.classname.slider+"-control-"+n.show_control),typeof t!="string"?t=n.auto:t=="0"?!1:!0,n.auto=t,n.interval=e.attr("data-slider-interval")||n.interval,n.effect=e.attr("data-slider-effect")||n.effect,n.control=e.attr("data-slider-control")||n.control,n.show_control=e.attr("data-slider-show-control")||n.show_control,e.addClass(n.classname.slider+"-control-"+n.control),e.addClass(n.classname.slider+"-control-"+n.show_control)},update_items:function(t){var n=this.$slider,r=this.opts,i=n.find("."+r.classname.slider_wrap);this.items=t,i.html("").append(this.items),this.items.each(function(t,n){var r=e(n),i=r.data("caption-selector"),s=r.data("caption"),o=r.find(".uslide-caption");i||s?(o.length||(o=e('<div class="uslide-caption" />'),r.append(o)),i?o.html(e(i).html()):o.html(s)):o.length&&o.remove()}),this.items.addClass(r.classname.item),r.auto_height?(this.calc_height(),n.find("img").one("load",e.proxy(this.calc_height,this))):r.adjust_slide_size&&this.adjust_slide_size()},calc_height:function(){var t=this,n;this.$slider.css("height",9999),this.items.each(function(){var r=e(this).find("img"),i=e(this).find(".uslide-caption"),s=t.opts.caption_height?i.outerHeight():0,o=r.height()+s;n=n>o?n:o}),this.$slider.css({"padding-top":Math.ceil(n/15)*15,height:"auto"})},adjust_slide_size:function(){var t=this.$slider.outerHeight(),n=this.$slider.outerWidth();this.items.each(function(){var r=e(this).find("img"),i,s;r.css({height:"",width:""}),i=r.height(),s=r.width(),t/n>i/s?r.css({height:"100%",width:"auto",marginLeft:(n-Math.round(t/i*s))/2,marginTop:""}):r.css({height:"auto",width:"100%",marginLeft:"",marginTop:(t-Math.round(n/s*i))/2})})},update_nav:function(){var t=this,n=this.opts,r=this.$slider.find("."+n.classname.nav);r.html(""),n.control_num&&(this.items.each(function(e){r.append('<i class="'+n.classname.nav_item+" uslider-dotnav-"+e+'" data-slider-index="'+e+'">'+e+"</i>")}),this.$slider.on("click","."+n.classname.nav_item,function(n){n.preventDefault();var r=e(this).data("slider-index");t.slider_switch(r),t.pause=!0}))},prev_next_navigation:function(){var e=this,t=this.opts;this.$slider.append('<div class="'+t.classname.prev+'" /><div class="'+t.classname.next+'" />').on("click","."+t.classname.prev,function(t){t.preventDefault(),e.prev()}).on("click","."+t.classname.next,function(t){t.preventDefault(),e.next()})},next:function(){var e=this.opts,t=e.effect;this.slider_switch(this.index+1>=this.items.length?0:this.index+1,!1,t),this.pause=!0},prev:function(){var e=this.opts,t=e.effect=="slide-left"?"slide-right":e.effect=="slide-right"?"slide-left":e.effect=="slide-down"?"slide-up":e.effect=="slide-up"?"slide-down":"crossfade";this.slider_switch(this.index>0?this.index-1:this.items.length-1,!1,t),this.pause=!0},slider_switch:function(t,n,r){var i=this.opts,s=this.$slider.find(i.classname.nav),o=this.$slider,u=s.find("."+i.classname.nav_item).eq(t),a=this.items.eq(t),f=o.find("."+i.classname.item+"-current");r||(r=i.effect),!a.hasClass(i.classname.item+"-current")&&(!n||!this.pause)&&(o.trigger("slideout",f).find("div.slide-previous").removeClass("slide-previous"),f.removeClass(i.classname.item+"-current").addClass("slide-previous"),a.addClass(i.classname.item+"-current"),s.find("."+i.classname.nav_item+"-selected").removeClass(i.classname.nav_item+"-selected"),u.addClass(i.classname.nav_item+"-selected"),this.index=t,a.addClass(i.classname.item+"-effect-"+r),a.one("animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",function(){e(this).removeClass(i.classname.item+"-effect-"+r),a.hasClass(i.classname.item+"-current")&&o.trigger("slidein",[a,t])})),o.find(".upfront-default-slider-nav-item").removeClass("uslider-dotnav-current"),o.find(".uslider-dotnav-"+t).addClass("uslider-dotnav-current"),this.pause=!1},update_auto_slide:function(){var e=this,t=this.opts;this.timer&&clearInterval(this.timer),t.auto&&t.interval>999&&(this.timer=setInterval(function(){e.slider_switch(e.index+1>=e.items.length?0:e.index+1,!0)},t.interval))},bind_events:function(){var t=this,n=t.$slider,r=t.opts;n.on("refresh",function(){var i=r.item?n.find(">"+r.item):n.find(">."+r.classname.item),s=i.length,o=t.items.length;t.update_configs(),t.update_auto_slide(),s&&(t.update_items(i),t.update_nav(),s!=o&&t.slider_switch(r.starting_slide)),!r.auto_height&&r.adjust_slide_size&&(t.adjust_slide_size(),t.items.find("img").one("load",e.proxy(t.adjust_slide_size,t)))}).on("pause",function(){clearInterval(t.timer)}).on("resume",function(){t.update_auto_slide()})}},e(document).ready(function(){var n={item:".upfront-inserted_image-wrapper",control_next_prev:!1};e(".upfront-inline_post-slider").upfront_default_slider(n);var r={auto_height:!1,control:"inside"},i=function(){e(".upfront-bg-slider").each(function(){e(this).closest(".upfront-output-bg-overlay").css("display")!="none"&&e(this).upfront_default_slider(r)})};i(),e(window).on("load",function(){e(".upfront-inline_post-slider, .upfront-bg-slider").trigger("refresh")});var s=t(function(){i(),e(".upfront-inline_post-slider, .upfront-bg-slider").trigger("refresh")},100);e(window).on("resize",s),e(document).on("upfront-load",function(){Upfront.Events.on("application:mode:after_switch",function(){e(".upfront-inline_post-slider").upfront_default_slider(n)}),Upfront.Events.on("entity:background:update",function(t,n){var i=t.$el.find(".upfront-region-bg-slider");i.length&&i.each(function(){e(this).data("slider-applied")?e(this).trigger("refresh"):e(this).upfront_default_slider(r)})})})})})(jQuery);