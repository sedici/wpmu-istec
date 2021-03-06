<?php
class Upfront_UmapView extends Upfront_Object{

	public function get_markup(){
		$_id = $this->_get_property('element_id');
		$element_id = $_id ? "id='{$_id}'" : '';
		$raw_properties = !empty($this->_data['properties']) ? $this->_data['properties'] : array();
		$to_map = array('markers', 'map_center', 'zoom', 'style', 'controls', 'styles', 'draggable', 'scrollwheel', 'hide_markers');

		$properties = array();
		foreach ($raw_properties as $prop) {
			if (in_array($prop['name'], $to_map)) $properties[$prop['name']] = $prop['value'];
		}
		if (!is_array($properties['controls'])) $properties['controls'] = array($properties['controls']);
		$map = 'data-map="' . esc_attr(json_encode($properties)) . '"';

		if (empty($properties)) return ''; // No info for this map, carry on.

		upfront_add_element_script('upfront_maps', array('js/upfront_maps-public.js', dirname(__FILE__)));
		upfront_add_element_style('upfront_maps', array('css/visitor.css', dirname(__FILE__)));

		$msg = esc_html(self::_get_l10n('preloading_msg'));

		return "<div class='ufm-gmap-container' {$element_id} {$map}>{$msg}</div>";
	}

	public static function add_js_defaults($data){
		$data['umaps'] = array(
			'defaults' => self::default_properties(),
		 );
		return $data;
	}

	public static function default_properties(){
		return array(
			'type' => "MapModel",
			'view_class' => "UmapView",
			"class" => "c24 upfront-map_element-object",
			'has_settings' => 1,
			'id_slug' => 'upfront-map_element',

			'controls' => array(),
			'map_center' => array(10.72250, 106.730762),
			'zoom' => 10,
			'style' => 'ROADMAP',
			'styles' => false,

			'draggable' => true,
			'scrollwheel' => false,
		);
	}

	public static function add_l10n_strings ($strings) {
		if (!empty($strings['maps_element'])) return $strings;
		$strings['maps_element'] = self::_get_l10n();
		return $strings;
	}

	private static function _get_l10n ($key=false) {
		$l10n = array(
			'element_name' => __('Map', 'upfront'),
			'preloading_msg' => __('This is where the map comes in.', 'upfront'),
			'css' => array(
				'label' => __('Map container', 'upfront'),
				'info' => __('The layer wrapping the map.', 'upfront'),
			),
			'menu' => array(
				'center_map' => __('Center Map Here', 'upfront'),
				'add_marker' => __('Add Marker', 'upfront'),
				'remove_marker' => __('Remove Marker', 'upfront'),
				'change_icon' => __('Change Icon', 'upfront'),
			),
			'connectivity_warning' => __('Please, check your internet connectivity', 'upfront'),
			'instructions' => __('Please enter address for us to generate a map from:', 'upfront'),
			'placeholder' => __('Street, city, country', 'upfront'),
			'or' => __('or', 'upfront'),
			'use_current_location' => __('Use my current location', 'upfront'),
			'hold_on' => __('Please, hold on', 'upfront'),
			'edit_this' => __('Edit this...', 'upfront'),
			'image_url' => __('Image URL (.png):', 'upfront'),
			'settings' => __('Map settings', 'upfront'),
			'label' => __('Google Map', 'upfront'),
			'location_label' => __('Map Location', 'upfront'),
			'style' => array(
				'roadmap' => __('Roadmap', 'upfront'),
				'satellite' => __('Satellite', 'upfront'),
				'hybrid' => __('Hybrid', 'upfront'),
				'terrain' => __('Terrain', 'upfront'),
			),
			'ctrl' => array(
				'pan' => __('Pan', 'upfront'),
				'zoom' => __('Zoom', 'upfront'),
				'type' => __('Map Type', 'upfront'),
				'scale' => __('Scale', 'upfront'),
				'street_view' => __('Street View', 'upfront'),
				'overview' => __('Overview Map', 'upfront'),
			),
			'zoom_level' => __('Map Zoom Level:', 'upfront'),
			'map_style' => __('Map Style', 'upfront'),
			'map_controls' => __('Map Controls', 'upfront'),
			'draggable_map' => __('Draggable map', 'upfront'),
			'hide_markers' => __('Hide markers', 'upfront'),
		);
		return !empty($key)
			? (!empty($l10n[$key]) ? $l10n[$key] : $key)
			: $l10n
		;
	}
}

function upfront_maps_add_context_menu ($paths) {
	$paths['maps_context_menu'] = upfront_relative_element_url('js/ContextMenu', dirname(__FILE__));
	return $paths;
}
add_filter('upfront-settings-requirement_paths', 'upfront_maps_add_context_menu');

function upfront_maps_add_maps_local_url ($data) {
	$data['upfront_maps'] = array(
		"root_url" => trailingslashit(upfront_element_url('/', dirname(__FILE__))),
		"markers" => trailingslashit(upfront_element_url('img/markers/', dirname(__FILE__))),
	);
	return $data;
}
add_filter('upfront_data', 'upfront_maps_add_maps_local_url');