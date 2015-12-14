<?php

include 'METABOX.php';

add_action( 'init', 'create_post_type' );
function create_post_type() {
  register_post_type( 'project',
    array(
      'labels' => array(
        'name' => __( 'Projects' ),
        'singular_name' => __( 'Project' ),
      ),
      'public' => true,
      'has_archive' => true,
	  'supports' => array('title','editor','thumbnail'),
      'taxonomies' => array('category')
	  
    )
  );
}

add_action( 'init', 'create_post_type2' );
function create_post_type2() {
  register_post_type( 'events',
    array(
      'labels' => array(
        'name' => __( 'Events' ),
        'singular_name' => __( 'Event' ),
      ),
      'public' => true,
      'has_archive' => true,
	  'supports' => array('title','editor','thumbnail'),
      'taxonomies' => array('category')
	  
    )
  );
}

// METABOX

add_filter( 'cmb_meta_boxes', 'cmb_sample_metaboxes' );

function cmb_sample_metaboxes( array $meta_boxes ) {

$prefix = '_cmb_';
  
  $meta_boxes['event_group'] = array(
    'id'         => 'event_group',
    'title'      => __( 'Files', 'cmb' ),
    'pages'      => array( 'events' ),
    'fields'     => array(
      array(
        'id'          => $prefix . 'event_first_group',
        'type'        => 'group',
        'options'     => array(
          'add_button'    => __( 'Add file', 'cmb' ),
          'remove_button' => __( 'Remove file', 'cmb' ),
          'sortable'      => true, // beta
        ),
        // Fields array works the same, except id's only need to be unique for this group. Prefix is not needed.
        'fields'      => array(
		  array(
            'name' => 'Name',
            'id'   => 'eventfilename',
            'type' => 'text',
          ),
          array(
            'name' => 'File to download',
            'id'   => 'eventfile',
            'type' => 'file',
          ),
        ),
      ),
    ),
  );
  
  $meta_boxes['event_group_2'] = array(
    'id'         => 'event_group_2',
    'title'      => __( 'External Links', 'cmb' ),
    'pages'      => array( 'events' ),
    'fields'     => array(
      array(
        'id'          => $prefix . 'event_second_group',
        'type'        => 'group',
        'options'     => array(
          'add_button'    => __( 'Add link', 'cmb' ),
          'remove_button' => __( 'Remove link', 'cmb' ),
          'sortable'      => true, // beta
        ),
        // Fields array works the same, except id's only need to be unique for this group. Prefix is not needed.
        'fields'      => array(
		  array(
            'name' => 'Name',
            'id'   => 'eventlinkname',
            'type' => 'text',
          ),		
		  array(
            'name' => 'Link',
            'id'   => 'eventlink',
            'type' => 'text',
          ),
        ),
      ),
    ),
  );

return $meta_boxes;
}

//SIMPLE Metaboxes

add_action( 'init', 'cmb_initialize_cmb_meta_boxes', 9999 ); //when wordpress loads, initialize metabox;
/**
 * Initialize the metabox class.
 */
function cmb_initialize_cmb_meta_boxes() {

  if ( ! class_exists( 'cmb_Meta_Box' ) )
    require_once 'Custom-Metaboxes-and-Fields-for-WordPress-master/init.php';
}

/**
 * SKT Gravida functions and definitions
 *
 * @package SKT Gravida
 */

// Set the word limit of post content 
function gravida_content($limit) {
$content = explode(' ', get_the_content(), $limit);
if (count($content)>=$limit) {
array_pop($content);
$content = implode(" ",$content).'...';
} else {
$content = implode(" ",$content);
}	
$content = preg_replace('/\[.+\]/','', $content);
$content = apply_filters('the_content', $content);
$content = str_replace(']]>', ']]&gt;', $content);
return $content;
}

/**
 * Set the content width based on the theme's design and stylesheet.
 */

if ( ! function_exists( 'gravida_setup' ) ) :
/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which runs
 * before the init hook. The init hook is too late for some features, such as indicating
 * support post thumbnails.
 */
function gravida_setup() {
	if ( ! isset( $content_width ) )
		$content_width = 640; /* pixels */

	load_theme_textdomain( 'gravida', get_template_directory() . '/languages' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support('woocommerce');
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-header' );
	add_theme_support( 'title-tag' );
	add_image_size('gravida-homepage-thumb',240,145,true);
	register_nav_menus( array(
		'primary' => __( 'Primary Menu', 'gravida' ),
		'secondary' => __( 'Secondary Menu', 'gravida' ),
	) );
	add_theme_support( 'custom-background', array(
		'default-color' => 'ffffff'
	) );
	add_editor_style( 'editor-style.css' );
}
endif; // gravida_setup
add_action( 'after_setup_theme', 'gravida_setup' );


function gravida_widgets_init() {
	register_sidebar( array(
		'name'          => __( 'Blog Sidebar', 'gravida' ),
		'description'   => __( 'Appears on blog page sidebar', 'gravida' ),
		'id'            => 'sidebar-1',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	) );
	
	register_sidebar( array(
		'name'          => __( 'Twitter Widget', 'gravida' ),
		'description'   => __( 'Appears on footer of the page', 'gravida' ),
		'id'            => 'twitter-wid',
		'before_widget' => '<div class="cols">',
		'after_widget'  => '</div>',
		'before_title'  => '<h2>',
		'after_title'   => '</h2>',
	) );
	
	
}
add_action( 'widgets_init', 'gravida_widgets_init' );


function gravida_font_url(){
		$font_url = '';
		
		/* Translators: If there are any character that are
		* not supported by Roboto, translate this to off, do not
		* translate into your own language.
		*/
		$roboto = _x('on', 'Roboto font:on or off','gravida');
		
		/* Translators: If there are any character that are not
		* supported by Oswald, trsnalate this to off, do not
		* translate into your own language.
		*/
		$oswald = _x('on','Oswald:on or off','gravida');
		
		/* Translators: If there has any character that are not supported 
		*  by Scada, translate this to off, do not translate
		*  into your own language.
		*/
		$scada = _x('on','Scada:on or off','gravida');
		
		if('off' !== $roboto || 'off' !== $oswald){
			$font_family = array();
			
			if('off' !== $roboto){
				$font_family[] = 'Roboto:300,400,600,700,800,900';
			}
			if('off' !== $oswald){
				$font_family[] = 'Oswald:300,400,600,700';
			}
			if('off' !== $scada){
				$font_family[] = 'Scada:300,400,600,700';
			}
			$query_args = array(
				'family'	=> urlencode(implode('|',$font_family)),
			);
			
			$font_url = add_query_arg($query_args,'//fonts.googleapis.com/css');
		}
		
	return $font_url;
	}


function gravida_scripts() {
	wp_enqueue_style('gravida-font', gravida_font_url(), array());
	wp_enqueue_style( 'gravida-basic-style', get_stylesheet_uri() );
	wp_enqueue_style( 'gravida-editor-style', get_template_directory_uri()."/editor-style.css" );
	wp_enqueue_style( 'gravida-nivoslider-style', get_template_directory_uri()."/css/nivo-slider.css" );
	wp_enqueue_style( 'gravida-main-style', get_template_directory_uri()."/css/main.css" );		
	wp_enqueue_style( 'gravida-base-style', get_template_directory_uri()."/css/style_base.css" );
	wp_enqueue_script( 'gravida-nivo-script', get_template_directory_uri() . '/js/jquery.nivo.slider.js', array('jquery') );
	wp_enqueue_script( 'gravida-custom_js', get_template_directory_uri() . '/js/custom.js' );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'gravida_scripts' );

function gravida_ie_stylesheet(){
	global $wp_styles;
	
	/** Load our IE-only stylesheet for all versions of IE.
	*   <!--[if lt IE 9]> ... <![endif]-->
	*
	*  Note: It is also possible to just check and see if the $is_IE global in WordPress is set to true before
	*  calling the wp_enqueue_style() function. If you are trying to load a stylesheet for all browsers
	*  EXCEPT for IE, then you would HAVE to check the $is_IE global since WordPress doesn't have a way to
	*  properly handle non-IE conditional comments.
	*/
	wp_enqueue_style('gravida-ie', get_template_directory_uri().'/css/ie.css', array('gravida-style'));
	$wp_styles->add_data('gravida-ie','conditional','IE');
	}
add_action('wp_enqueue_scripts','gravida_ie_stylesheet');


define('SKT_URL','http://www.sktthemes.net');
define('SKT_THEME_URL','http://www.sktthemes.net/themes');
define('SKT_THEME_URL_DIRECT','http://www.sktthemes.net/themes/gravida_pro/');
define('SKT_THEME_DOC','http://sktthemesdemo.net/documentation/gravida-documentation/');
define('SKT_PRO_THEME_URL','http://www.sktthemes.net/themes/gravida-corporate-wordpress-theme/');


function gravida_credit(){
		return "Copyright &copy; 2015 Gravida. Theme by <a href=".esc_url(SKT_URL)." target='_blank'>SKT Themes</a>.";
}
/**
 * Implement the Custom Header feature.
 */
require get_template_directory() . '/inc/custom-header.php';

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/inc/template-tags.php';

/**
 * Custom functions that act independently of the theme templates.
 */
require get_template_directory() . '/inc/extras.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/inc/customizer.php';

/**
 * Load Jetpack compatibility file.
 */
require get_template_directory() . '/inc/jetpack.php';

// get slug by id
function gravida_get_slug_by_id($id) {
	$post_data = get_post($id, ARRAY_A);
	$slug = $post_data['post_name'];
	return $slug; 
}

//PAGINATION
function custom_pagination($numpages = '', $pagerange = '', $paged='') {

  if (empty($pagerange)) {
    $pagerange = 2;
  }

  /**
   * This first part of our function is a fallback
   * for custom pagination inside a regular loop that
   * uses the global $paged and global $wp_query variables.
   * 
   * It's good because we can now override default pagination
   * in our theme, and use this function in default quries
   * and custom queries.
   */
  global $paged;
  if (empty($paged)) {
    $paged = 1;
  }
  if ($numpages == '') {
    global $wp_query;
    $numpages = $wp_query->max_num_pages;
    if(!$numpages) {
        $numpages = 1;
    }
  }

  /** 
   * We construct the pagination arguments to enter into our paginate_links
   * function. 
   */
  $pagination_args = array(
    'base'            => get_pagenum_link(1) . '%_%',
    'format'          => 'page/%#%',
    'total'           => $numpages,
    'current'         => $paged,
    'show_all'        => False,
    'end_size'        => 1,
    'mid_size'        => $pagerange,
    'prev_next'       => True,
    'prev_text'       => __('&laquo;'),
    'next_text'       => __('&raquo;'),
    'type'            => 'plain',
    'add_args'        => false,
    'add_fragment'    => ''
  );

  $paginate_links = paginate_links($pagination_args);

  if ($paginate_links) {
    echo "<nav class='custom-pagination'>";
      echo "<span class='page-numbers page-num'>Page " . $paged . " of " . $numpages . "</span> ";
      echo $paginate_links;
    echo "</nav>";
  }

}

//Order posts by year



//links from nav
global $page_links;
$page_links = wp_get_nav_menu_items('istec-main-nav');

global $page_links_secondary;
$page_links_secondary = wp_get_nav_menu_items('istec-secondary-menu');
