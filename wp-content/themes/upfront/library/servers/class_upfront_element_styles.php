<?php


/**
 * Serves registered element stylesheets.
 */
class Upfront_ElementStyles extends Upfront_Server {

	const TYPE_SCRIPT = 'js';
	const TYPE_STYLE = 'css';

	public static function serve () {
		$me = new self;
		$me->_add_hooks();
	}

	private function _add_hooks () {
		$this->_cache = Upfront_Cache::get_instance(Upfront_Cache::TYPE_LONG_TERM);

		if (Upfront_OutputBehavior::has_experiments()) {
			add_filter('upfront-experiments-styles-debounce_dependency_load', array($this, 'add_style_load_url'));
			add_filter('upfront-experiments-scripts-debounce_dependency_load', array($this, 'add_script_load_url'));
		} else {
			add_action('upfront-layout-applied', array($this, 'load_styles'));
			add_action('upfront-layout-applied', array($this, 'load_scripts'));
		}

		upfront_add_ajax('upfront-element-styles', array($this, 'serve_styles'));
		upfront_add_ajax_nopriv('upfront-element-styles', array($this, 'serve_styles'));

		upfront_add_ajax('upfront-element-scripts', array($this, 'serve_scripts'));
		upfront_add_ajax_nopriv('upfront-element-scripts', array($this, 'serve_scripts'));
	}

	function load_styles () {
		$hub = Upfront_PublicStylesheets_Registry::get_instance();
		$styles = $hub->get_all();
		if (empty($styles)) return false;

		$ckey = $this->_cache->key(self::TYPE_STYLE, $styles);

		$raw_cache_key = $ckey->get_hash();
		$cache = $this->_debugger->is_active() ? false : $this->_cache->get($ckey);

		if (empty($cache)) {
			foreach ($styles as $key => $frags) {
				//$path = upfront_element_dir($frags[0], $frags[1]);
				//if (file_exists($path)) $cache .= "/* {$key} */\n" . file_get_contents($path) . "\n";
				if (empty($frags)) continue;
				$style = $this->_get_style_contents($frags);
				if (!empty($style))  $cache .= "/* {$key} */\n{$style}\n";
			}
			if (!$this->_debugger->is_active(Upfront_Debug::STYLE)) $cache = Upfront_StylePreprocessor::compress($cache);
			$this->_cache->set($ckey, $cache);
		}

		//wp_enqueue_style('upfront-element-styles', admin_url('admin-ajax.php?action=upfront-element-styles&key=' . $cache_key)); // It'll also work as an AJAX request
		wp_enqueue_style('upfront-element-styles', Upfront_VirtualPage::get_url(join('/', array(
			'upfront-dependencies',
			'styles',
			$raw_cache_key
		))), array(), $this->_get_enqueue_version()); // But let's do pretty instead
	}

	public function add_style_load_url ($urls) {
		$hub = Upfront_PublicStylesheets_Registry::get_instance();
		$styles = $hub->get_all();
		if (empty($styles)) return $urls;

		$ckey = $this->_cache->key(self::TYPE_STYLE, $styles);

		$raw_cache_key = $ckey->get_hash();
		$cache = $this->_debugger->is_active() ? false : $this->_cache->get($ckey);

		if (empty($cache)) {
			foreach ($styles as $key => $frags) {
				//$path = upfront_element_dir($frags[0], $frags[1]);
				//if (file_exists($path)) $cache .= "/* {$key} */\n" . file_get_contents($path) . "\n";
				if (empty($frags)) continue;
				$style = $this->_get_style_contents($frags);
				if (!empty($style))  $cache .= "/* {$key} */\n{$style}\n";
			}
			if (!$this->_debugger->is_active(Upfront_Debug::STYLE)) $cache = Upfront_StylePreprocessor::compress($cache);
			$this->_cache->set($ckey, $cache);
		}

		$url = Upfront_VirtualPage::get_url(join('/', array(
			'upfront-dependencies',
			'styles',
			$raw_cache_key
		)));
		$urls[] = $url;
		return $urls;
	}

	/**
	 * Fetching and pre-processing the relative/absolute paths in styles.
	 */
	private function _get_style_contents ($frags) {
		$path = upfront_element_dir($frags[0], $frags[1]);
		$url = upfront_element_url($frags[0], $frags[1]);
		if (!file_exists($path)) return false;

		$style = file_get_contents($path);

		// Obtain the first "../" level
		$base_url = trailingslashit(dirname(dirname($url)));

		// First up, let's build up allowed directories list
		$dirs = explode('/', $base_url);
		$relatives = array();
		$upfront_root = preg_quote(Upfront::get_root_url(), '/');
		while (array_pop($dirs) !== NULL) {
			$rel = join('/', $dirs);
			$relatives[] = $rel;
			if (preg_match('/^' . $upfront_root . '$/', $rel)) break; // Let's not allow relative paths inclusion higher than the Upfront root
		}
		if (empty($relatives)) return $style;

		// Next, let's build the matching patterns list
		$matchers = array();
		foreach ($relatives as $idx => $relpath) {
			$count = $idx+1;
			$matchers[$count] = array(
				'url' => $relpath,
				'pattern' => str_repeat('../', $count)
			);
		}
		$matchers = array_reverse($matchers); // Start with longest match first

		// Lastly, let's actually replace the relative paths
		$slash = preg_quote('/', '/');
		foreach ($matchers as $match) {
			if (empty($match['pattern']) || empty($match['url'])) continue;
			$rx = "/([^{$slash}])" . preg_quote($match['pattern'], '/') . '([^.]{2})/'; // Let's start small
			$rpl = '$1' . trailingslashit($match['url']) . '$2';
			$style = preg_replace($rx, $rpl, $style);
		}

		return $style;
	}

	function load_scripts () {
		$hub = Upfront_PublicScripts_Registry::get_instance();
		$scripts = $hub->get_all();
		if (empty($scripts)) return false;

		$ckey = $this->_cache->key(self::TYPE_SCRIPT, $scripts);

		$raw_cache_key = $ckey->get_hash();
		$cache = $this->_debugger->is_active() ? false : $this->_cache->get($ckey);

		if (empty($cache)) {
			foreach ($scripts as $key => $frags) {
				$path = upfront_element_dir($frags[0], $frags[1]);
				if (file_exists($path)) $cache .= "/* {$key} */\n" . file_get_contents($path) . "\n";
			}
			$this->_cache->set($ckey, $cache);
		}
		//wp_enqueue_script('upfront-element-scripts', admin_url('admin-ajax.php?action=upfront-element-scripts&key=' . $cache_key), array('jquery')); // It'll also work as an AJAX request
		wp_enqueue_script('upfront-element-scripts', Upfront_VirtualPage::get_url(join('/', array(
			'upfront-dependencies',
			'scripts',
			$raw_cache_key
		))), array('jquery'), $this->_get_enqueue_version(), true); // Scripts go into footer
	}

	public function add_script_load_url ($urls) {
		$hub = Upfront_PublicScripts_Registry::get_instance();
		$scripts = $hub->get_all();
		if (empty($scripts)) return $urls;

		$ckey = $this->_cache->key(self::TYPE_SCRIPT, $scripts);

		$raw_cache_key = $ckey->get_hash();
		$cache = $this->_debugger->is_active() ? false : $this->_cache->get($ckey);

		if (empty($cache)) {
			foreach ($scripts as $key => $frags) {
				$path = upfront_element_dir($frags[0], $frags[1]);
				if (file_exists($path)) $cache .= "/* {$key} */\n" . file_get_contents($path) . "\n";
			}
			$this->_cache->set($ckey, $cache);
		}
		$url = Upfront_VirtualPage::get_url(join('/', array(
			'upfront-dependencies',
			'scripts',
			$raw_cache_key
		)));
		$urls[] = $url;
		return $urls;
	}

	function serve_styles () {
		$key = $this->_cache->key(self::TYPE_STYLE);
		$key->set_hash(stripslashes($_REQUEST['key']));

		$cache = $this->_cache->get($key);
		$response = empty($cache)
			? new Upfront_CssResponse_Error('')
			: new Upfront_CssResponse_Success($cache)
		;

		$this->_out($response);
	}

	function serve_scripts () {
		$key = $this->_cache->key(self::TYPE_SCRIPT);
		$key->set_hash(stripslashes($_REQUEST['key']));

		$cache = $this->_cache->get($key);
		$response = empty($cache)
			? new Upfront_JavascriptResponse_Error('')
			: new Upfront_JavascriptResponse_Success($cache)
		;

		$this->_out($response);
	}

	private function _get_enqueue_version () {
		return Upfront_ChildTheme::get_version();
	}

}