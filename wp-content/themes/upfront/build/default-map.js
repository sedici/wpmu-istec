(function(e){function n(e){if(e.data("map"))return;var t=JSON.parse(e.attr("data-bg-map")),n={center:new google.maps.LatLng(t.center[0],t.center[1]),zoom:parseInt(t.zoom),mapTypeId:google.maps.MapTypeId[t.style],panControl:t.controls&&t.controls.indexOf("pan")>=0,zoomControl:t.controls&&t.controls.indexOf("zoom")>=0,mapTypeControl:t.controls&&t.controls.indexOf("map_type")>=0,scaleControl:t.controls&&t.controls.indexOf("scale")>=0,streetViewControl:t.controls&&t.controls.indexOf("street_view")>=0,overviewMapControl:t.controls&&t.controls.indexOf("overview_map")>=0,scrollwheel:!1,styles:t.styles},r=new google.maps.Map(e.get(0),n);e.data("map",r);if(!!t.show_markers)var i=new google.maps.Marker({position:n.center,draggable:!1,map:r})}function r(){if(e(document).data("upfront-google_maps-loading"))return!1;e(document).data("upfront-google_maps-loading",!0);if(typeof google=="object"&&typeof google.maps=="object"&&typeof google.maps.Map=="object")return i();var t="",n=document.createElement("script");try{t=document.location.protocol}catch(r){t="http:"}n.type="text/javascript",n.src=t+"//maps.google.com/maps/api/js?v=3&libraries=places&sensor=false&callback=upfront_maps_loaded",document.body.appendChild(n)}function i(){e("[data-bg-map]").each(function(){e(this).css("display")!="none"&&n(e(this))})}var t=function(e,t,n){var r,i,s,o=null,u=0;n||(n={});var a=function(){u=n.leading===!1?0:(new Date).getTime(),o=null,s=e.apply(r,i),o||(r=i=null)};return function(){var l=(new Date).getTime();u||n.leading!==!1||(u=l);var p=t-(l-u);return r=this,i=arguments,0>=p||p>t?(clearTimeout(o),o=null,u=l,s=e.apply(r,i),o||(r=i=null)):o||n.trailing===!1||(o=setTimeout(a,p)),s}};e(document).on("upfront-google_maps-loaded",i);var s=t(i,100);window.upfront_maps_loaded||(window.upfront_maps_loaded=window.upfront_maps_loaded||function(){e(document).trigger("upfront-google_maps-loaded"),e(document).data("upfront-google_maps-loading",!1),e(window).on("resize",s)},e(r))})(jQuery);