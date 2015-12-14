<?php

defined('UPFRONT_DEBUG_LEVELS') || define('UPFRONT_DEBUG_LEVELS', 'none');

require_once(dirname(__FILE__) . '/library/upfront_functions.php');
require_once(dirname(__FILE__) . '/library/upfront_functions_theme.php');
require_once(dirname(__FILE__) . '/library/class_upfront_permissions.php');
require_once(dirname(__FILE__) . '/library/class_upfront_registry.php');
require_once(dirname(__FILE__) . '/library/class_upfront_debug.php');
require_once(dirname(__FILE__) . '/library/class_upfront_http_response.php');
require_once(dirname(__FILE__) . '/library/class_upfront_server.php');
require_once(dirname(__FILE__) . '/library/class_upfront_model.php');
require_once(dirname(__FILE__) . '/library/class_upfront_module_loader.php');
require_once(dirname(__FILE__) . '/library/class_upfront_theme.php');
require_once(dirname(__FILE__) . '/library/class_upfront_grid.php');
require_once(dirname(__FILE__) . '/library/class_upfront_style_preprocessor.php');
require_once(dirname(__FILE__) . '/library/class_upfront_output.php');
require_once(dirname(__FILE__) . '/library/class_upfront_endpoint.php');
require_once(dirname(__FILE__) . '/library/class_upfront_media.php');
require_once(dirname(__FILE__) . '/library/class_ufront_ufc.php');
require_once(dirname(__FILE__) . '/library/class_upfront_codec.php');



class Upfront {
	public static $Excluded_Files = array(".", "..", ".DS_Store");
	private $_servers = array(
		'ajax',
		'javascript_main',
		'stylesheet_main',
		'stylesheet_editor',
		'element_styles',
	);
	private $_debugger;

	private function __construct () {
		$this->_debugger = Upfront_Debug::get_debugger();
		$servers = apply_filters('upfront-servers', $this->_servers);
		foreach ($servers as $component) $this->_run_server($component);
		Upfront_ModuleLoader::serve();
		do_action('upfront-core-initialized');
	}

	public static function serve () {
		$me = new self;
		$me->_add_hooks();
		$me->_add_supports();
	}

	private function _add_hooks () {
		add_filter('body_class', array($this, 'inject_grid_scope_class'));
		add_action('wp_head', array($this, "inject_global_dependencies"), 0);
		add_action('wp_footer', array($this, "inject_upfront_dependencies"), 99);
		add_action('upfront-core-wp_dependencies', array($this, "inject_core_wp_dependencies"), 99);

		add_action('admin_bar_menu', array($this, 'add_edit_menu'), 85);

		if (is_admin()) { // This prevents "Edit layout" being shown on frontend
			require_once(dirname(__FILE__) . '/library/servers/class_upfront_admin.php');
			if (class_exists('Upfront_Server_Admin')) Upfront_Server_Admin::serve();
		}

		$this->_load_textdomain();
	}

	private function _load_textdomain () {
		$path = untrailingslashit(self::get_root_dir()) . '/languages';
		load_theme_textdomain('upfront', $path);

		// Now let's try the child theme...
		$current = wp_get_theme();
		$parent = $current->parent();
		if (empty($parent)) return false; // Current theme is not a child theme, carry on...
		if ('upfront' !== $parent->get_template()) return false; // Not an Upfront child, carry on...
		$child_domain = $current->get('TextDomain');
		if (!empty($child_domain) && 'upfront' !== $child_domain) {
			load_child_theme_textdomain($child_domain, get_stylesheet_directory() . '/languages');
		}
	}

	private function _add_supports () {
		add_theme_support('post-thumbnails');
		add_theme_support('title-tag'); // Let WP deal with our theme titles
		register_nav_menu('default', __('Default', 'upfront'));
		// Do widget text
		$do_widget_text = apply_filters(
			'upfront-shortcode-enable_in_widgets',
			(defined('UPFRONT_DISABLE_WIDGET_TEXT_SHORTCODES') && UPFRONT_DISABLE_WIDGET_TEXT_SHORTCODES ? false : true)
		);
		if ($do_widget_text) {
			add_filter('widget_text', 'do_shortcode');
		}
	}

	private function _run_server ($comp) {
		$class = Upfront_Server::name_to_class($comp);
		if (!$class) return false;
		call_user_func(array($class, 'serve'));
	}

	public static function get_root_url () {
		return get_template_directory_uri();
	}

	public static function get_root_dir () {
		return get_template_directory();
	}


	public function add_edit_menu ($wp_admin_bar) {
		if (!Upfront_Permissions::current(Upfront_Permissions::BOOT)) return false;

		$item = array(
			'id' => 'upfront-edit_layout',
			'title' => __('Upfront', 'upfront'),
			'href' => (is_admin() ? home_url('/?editmode=true') : '#'),
			'meta' => array(
				'class' => 'upfront-edit_layout upfront-editable_trigger'
			),
		);
		$permalinks_on = get_option('permalink_structure');

		if (!$permalinks_on) {
			// We're checking WP priv directly because we need an admin for this
			if (current_user_can('manage_options')) {
				$item['href'] = admin_url('/options-permalink.php');
				unset($item['meta']);
			} else {
				$item = array(); // No such thing for non-admins
			}
		}

		if (!empty($item)) {
			$wp_admin_bar->add_menu($item);
		}

		// Change the existing nodes
		$nodes = $wp_admin_bar->get_nodes();
		if (!empty($nodes) && is_array($nodes)) {
			foreach ($nodes as $node) {
				if (!empty($node->href) && preg_match('/customize\.php/', $node->href)) {
					$node->href = home_url('?editmode=true');
				}
				$wp_admin_bar->add_node($node);
			}
		}

		// Action hook here, so other stuff can add its bar items
		// (most notably, the exporter)
		do_action('upfront-admin_bar-process', $wp_admin_bar, $item);
	}

	function inject_grid_scope_class ($cls) {
		$grid = Upfront_Grid::get_grid();
		$cls[] = $grid->get_grid_scope();
		return $cls;
	}

	public function inject_core_wp_dependencies () {
		$deps = Upfront_CoreDependencies_Registry::get_instance();

		if (Upfront_OutputBehavior::has_experiments()) {
			if (defined('DOING_AJAX') && DOING_AJAX) {
				$deps->add_wp_script('jquery-ui-core');
				$deps->add_wp_script('jquery-ui-widget');
				$deps->add_wp_script('jquery-ui-mouse');
				$deps->add_wp_script('jquery-effects-core');
				$deps->add_wp_script('jquery-effects-slide');
				$deps->add_wp_script('jquery-ui-draggable');
				$deps->add_wp_script('jquery-ui-droppable');
				$deps->add_wp_script('jquery-ui-resizable');
				$deps->add_wp_script('jquery-ui-selectable');
				$deps->add_wp_script('jquery-ui-sortable');
				$deps->add_wp_script('jquery-ui-slider');
				$deps->add_wp_script('jquery-ui-datepicker');
			} else {
				$deps->add_script(admin_url('admin-ajax.php?action=wp_scripts'));
			}
		} else {
			// Non-experiments load
			wp_enqueue_script('jquery-ui-core');
			wp_enqueue_script('jquery-effects-core');
			wp_enqueue_script('jquery-effects-slide');
			wp_enqueue_script('jquery-ui-draggable');
			wp_enqueue_script('jquery-ui-droppable');
			wp_enqueue_script('jquery-ui-resizable');
			wp_enqueue_script('jquery-ui-selectable');
			wp_enqueue_script('jquery-ui-sortable');
			wp_enqueue_script('jquery-ui-slider');
			wp_enqueue_script('jquery-ui-datepicker');
		}

	}

	function inject_global_dependencies () {
		$deps = Upfront_CoreDependencies_Registry::get_instance();
		wp_enqueue_script('jquery');

		//Basic styles for upfront to work are always loaded.
		wp_enqueue_style('upfront-global', self::get_root_url() . '/styles/global.css', array(), Upfront_ChildTheme::get_version());

        if (!Upfront_Permissions::current(Upfront_Permissions::BOOT)) {
            // Don't queue the front grid if has permission to boot Upfront, queue editor grid instead
    		wp_enqueue_style('upfront-front-grid', admin_url('admin-ajax.php?action=upfront_load_grid'), array(), Upfront_ChildTheme::get_version());
        }

		if (Upfront_Permissions::current(Upfront_Permissions::BOOT)) {
			do_action('upfront-core-wp_dependencies');

			wp_enqueue_style('upfront-editor-interface', self::get_root_url() . '/styles/editor-interface.css', array(), Upfront_ChildTheme::get_version());

			$link_urls =  array(
				admin_url('admin-ajax.php?action=upfront_load_editor_grid'),
				self::get_root_url() . '/scripts/chosen/chosen.min.css',
				self::get_root_url() . '/styles/font-icons.css',
			);
			foreach ($link_urls as $url) {
				$deps->add_style($url);
			}
			$deps->add_font('Source Sans Pro', array(
				'400',
				'600',
				'700',
				'400italic',
				'600italic',
				'700italic',
			));

			add_action('wp_footer', array($this, 'add_responsive_css'));
		}
	}

	function inject_upfront_dependencies () {

		if (!Upfront_Permissions::current(Upfront_Permissions::BOOT)) return false; // Do not inject for users that can't use this
		$url = self::get_root_url();
		//Boot Edit Mode if the querystring contains the editmode param
		if (isset($_GET['editmode']))
			echo upfront_boot_editor_trigger();

		$storage_key = apply_filters('upfront-data-storage-key', Upfront_Layout::STORAGE_KEY);
		$save_storage_key = $storage_key;
		$is_ssl = is_ssl() ? '&ssl=1' : '';

		if (isset($_GET['dev']) && current_user_can('switch_themes') && apply_filters('upfront-enable-dev-saving', true)) {
			$save_storage_key .= '_dev';
		}

		$script_urls = array(
			"{$url}/scripts/require.js",
			admin_url('admin-ajax.php?action=upfront_load_main' . $is_ssl),
			"{$url}/scripts/main.js",
		);
		$deps = Upfront_CoreDependencies_Registry::get_instance();
		foreach ($script_urls as $url) {
			$deps->add_script($url);
		}

		echo '<script type="text/javascript">
			var _upfront_post_data=' . json_encode(array(
				'layout' => Upfront_EntityResolver::get_entity_ids(),
				'post_id' => (is_singular() ? apply_filters('upfront-data-post_id', get_the_ID()) : false)
			)) . ';
			var _upfront_storage_key = "' . $storage_key . '";
			var _upfront_save_storage_key = "' . $save_storage_key . '";
			var _upfront_stylesheet = "' . get_stylesheet() . '";
			var _upfront_debug_mode = ' . (int)isset($_GET['debug']) . ';
			var _upfront_please_hold_on = ' . json_encode(__('Please, hold on for just a little bit more', 'upfront')) . ';
		</script>';
		echo <<<EOAdditivemarkup
	<div id="sidebar-ui" class="upfront-ui"></div>
	<div id="settings" style="display:none"></div>
	<div id="contextmenu" style="display:none"></div>
EOAdditivemarkup;

		do_action('upfront-core-inject_dependencies');
	}

	function add_responsive_css () {
		include(self::get_root_dir().'/styles/editor-interface-responsive.html');
	}

}
add_action('init', array('Upfront', 'serve'), 0);