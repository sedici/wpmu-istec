<?php

class Upfront_PlainTxtView extends Upfront_Object {

	public function get_markup () {

		$element_id = $this->_get_property('element_id');
		$element_id = $element_id ? "id='{$element_id}'" : '';

		$content = $this->_get_property('content');

		$matches = array();
		//$regex = '/<div class="plaintxt_padding([^>]*)>(.+?)<\/div>/s';
		//preg_match($regex, $content, $matches);

        //if (sizeof($matches) > 1) $content = $matches[2];

        if ( preg_match('/<div class="plaintxt_padding([^>]*)>/s', $content) ){
            $doc = new DOMDocument();
            $clean_doc = new DOMDocument();
            $doc->loadHTML($content);
            $divs = $doc->getElementsByTagName('div');
            $plaintxt_wrap = false;
            foreach ( $divs as $div ){
                if ( !$div->hasAttributes() )
                    continue;
                $class = $div->attributes->getNamedItem('class');
                if ( !is_null($class) && !empty($class->nodeValue) && strpos($class->nodeValue, 'plaintxt_padding') !== false ) {
                    $plaintxt_wrap = $div;
                    break;
                }
            }
            if ( $plaintxt_wrap !== false && $plaintxt_wrap->hasChildNodes() ) {
                foreach ( $plaintxt_wrap->childNodes as $node ){
                    $import_node = $clean_doc->importNode($node, true);
                    $clean_doc->appendChild($import_node);
                }
            }
            $content = $clean_doc->saveHTML();
        }

		$style = array();
		if ($this->_get_property('background_color') && '' != $this->_get_property('background_color')) {
			$style[] = 'background-color: '. Upfront_UFC::init()->process_colors($this->_get_property('background_color'));
		}

		if ($this->_get_property('border') && '' != $this->_get_property('border')) {
			$style[] = 'border: '.Upfront_UFC::init()->process_colors($this->_get_property('border'));
		}

		$content = $this->_decorate_content($content);

		return (sizeof($style)>0 ? "<div class='plaintxt_padding' style='".implode(';', $style)."'>": ''). $content .(sizeof($style)>0 ? "</div>": '');
	}

	protected function _decorate_content ($content) {
		if (defined('DOING_AJAX') && DOING_AJAX) return $content;
		$do_processing = apply_filters(
			'upfront-shortcode-enable_in_layout',
			(defined('UPFRONT_DISABLE_LAYOUT_TEXT_SHORTCODES') && UPFRONT_DISABLE_LAYOUT_TEXT_SHORTCODES ? false : true)
		);
		if ($do_processing) $content = do_shortcode($content);
		return Upfront_Codec::get('wordpress')->expand_all($content);
	}

	public static function add_l10n_strings ($strings) {
		if (!empty($strings['text_element'])) return $strings;
		$strings['text_element'] = self::_get_l10n();
		return $strings;
	}

	private static function _get_l10n ($key=false) {
		$l10n = array(
			'element_name' => __('Text', 'upfront'),
			'css' => array(
				'container_label' => __('Text container', 'upfront'),
				'container_info' => __('The layer that contains all the text of the element.', 'upfront'),
				'p_label' => __('Text paragragh', 'upfront'),
				'p_info' => __('The paragragh that contains all the text of the element.', 'upfront'),
			),
			'default_content' => __('<p>My awesome stub content goes here</p>', 'upfront'),
			'dbl_click' => __('Double click to edit text', 'upfront'),
			'appearance' => __('Textbox Appearance', 'upfront'),
			'border' => __('Border', 'upfront'),
			'none' => __('None', 'upfront'),
			'solid' => __('Solid', 'upfront'),
			'dashed' => __('Dashed', 'upfront'),
			'dotted' => __('Dotted', 'upfront'),
			'width' => __('Width', 'upfront'),
			'color' => __('Color', 'upfront'),
			'bg_color' => __('Background Color', 'upfront'),
			'edit_text' => __('Edit Text', 'upfront'),
		);
		return !empty($key)
			? (!empty($l10n[$key]) ? $l10n[$key] : $key)
			: $l10n
		;
	}

	public static function export_content ($export, $object) {
		return upfront_get_property_value('content', $object);
	}
}