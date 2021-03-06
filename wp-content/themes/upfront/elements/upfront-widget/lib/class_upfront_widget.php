<?php

class Upfront_Uwidget {

	private $_widget_name;

	public function __construct ($widget) {
		$this->_widget_name = $widget;
	}

	public static function get_widget_list () {
		global $wp_registered_widget_controls, $wp_registered_widgets;
		$data = array();

		foreach ($wp_registered_widgets as $key => $widget) {
			$cback = $wp_registered_widget_controls[$key]['callback'];
			$class = !empty($cback[0]) && is_object($cback[0]) && $cback[0] instanceof WP_Widget
				? get_class($cback[0])
				: false
			;
			$data[] = array(
				'name' => $widget['name'],
				'key' => $key,
				'class' => $class,
				'admin' => !empty($wp_registered_widget_controls[$key])
			);
		}
		return $data;
	}

	public function get_widget () {
		return $this->_widget_name;
	}

	public function get_widget_markup ($instance = array()) {
		global $wp_registered_widgets;
		$widget = $this->get_widget();
		$result = Upfront_Permissions::current(Upfront_Permissions::BOOT)
			? Upfront_UwidgetView::get_l10n('render_error')
			: ''
		;
		$args = !empty($wp_registered_widgets[$widget]['params']) ? $wp_registered_widgets[$widget]['params'] : array();

		$callback = false;
		if (empty($wp_registered_widgets[$widget])) {
			if (class_exists($widget)) $callback = array(new $widget, 'widget');
		} else {
			$callback = $wp_registered_widgets[$widget]['callback'];
		}
		if (empty($callback) || !is_callable($callback)) return $result;

		if (is_array($callback) && !empty($callback[0]) && is_object($callback[0]) && $callback[0] instanceof WP_Widget) {
			$callback[1] = 'widget';
		}

		$classname = !empty($wp_registered_widgets[$widget]['classname'])
			? $wp_registered_widgets[$widget]['classname']
			: ''
		;

		$args = wp_parse_args($args, array(
			'before_widget' => sprintf('<div class="widget %s">', $classname),
			'before_title' => '<h2 class="widgettitle">',
			'after_title' => '</h2>',
			'after_widget' => '</div>',
		));
		$args = apply_filters('upfront_widget_widget_args', $args);

		$instance = wp_parse_args($instance, array(
			'title' => '',
		));

		ob_start();
		call_user_func_array($callback, array($args, $instance));
		$out = ob_get_clean();

		return !empty($out) ? $out : $result;
	}

	private function _get_admin_fields () {
		global $wp_registered_widget_controls;
		$widget = $this->get_widget();
		$result = array();

		if (empty($wp_registered_widget_controls[$widget])) return $result;

		$callback = $wp_registered_widget_controls[$widget]['callback'];
		if (empty($callback) || !is_callable($callback)) return $result;

		$params = $wp_registered_widget_controls[$widget]['params'];

		ob_start();
		call_user_func_array($callback, array($params));
		$markup = ob_get_clean();

		return $this->_get_fields_from_markup($markup);
	}

	private function _get_fields_from_markup ($markup) {
		$form = new DOMDocument();
		@$form->loadHTML($markup);

		$xpath = new DOMXPath($form);
		$nodes = $xpath->query('/html/body//label | /html/body//input | /html/body//select | /html/body//textarea');

		$fields = array();

		foreach($nodes as $node) {
			if ('label' === strtolower($node->nodeName)) {
				if (isset($fields[$node->getAttribute('for')])) $fields[$node->getAttribute('for')]['label'] = $node->nodeValue;
				else $fields[$node->getAttribute('for')] = array('label' => $node->nodeValue);
			} else {
				$exp_name = explode('[', $node->getAttribute('name'));
				$fieldname = str_replace(']', '', array_pop($exp_name));
				if (isset($fields[$node->getAttribute('id')])) $fields[$node->getAttribute('id')]['name'] = $fieldname;
				else $fields[$node->getAttribute('id')] = array('name' =>$fieldname);
				if (strtolower($node->nodeName) == 'select') {
					$fields[$node->getAttribute('id')]['type'] = $node->nodeName;
					$fields[$node->getAttribute('id')]['options'] = array();
					foreach($xpath->query('./option', $node) as $option) {
						$fields[$node->getAttribute('id')]['options'][$option->getAttribute('value')] = $option->nodeValue;
					}
				} elseif('textarea' === strtolower($node->nodeName)) {
					$fields[$node->getAttribute('id')]['type'] = $node->nodeName;
					$fields[$node->getAttribute('id')]['value'] = $node->nodeValue;
				} elseif('input' === strtolower($node->nodeName)) {
					$fields[$node->getAttribute('id')]['type'] = $node->getAttribute('type');
					$fields[$node->getAttribute('id')]['value'] = $node->getAttribute('value');

				}
			}

		}

		return $fields;
	}

	public function get_widget_admin_fields () {
		return $this->_get_admin_fields();
	}

}