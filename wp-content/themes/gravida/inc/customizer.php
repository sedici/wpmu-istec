<?php
/**
 * SKT Gravida Theme Customizer
 *
 * @package SKT Gravida
 */

/**
 * Add postMessage support for site title and description for the Theme Customizer.
 *
 * @param WP_Customize_Manager $wp_customize Theme Customizer object.
 */
function gravida_customize_register( $wp_customize ) {
	
	//Add a class for titles
    class gravida_Info extends WP_Customize_Control {
        public $type = 'info';
        public $label = '';
        public function render_content() {
        ?>
			<h3 style="text-decoration: underline; color: #DA4141; text-transform: uppercase;"><?php echo esc_html( $this->label ); ?></h3>
        <?php
        }
    }
	
	class WP_Customize_Textarea_Control extends WP_Customize_Control {
    public $type = 'textarea';
 
    public function render_content() {
        ?>
            <label>
                <span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
                <textarea rows="5" style="width:100%;" <?php $this->link(); ?>><?php echo esc_textarea( $this->value() ); ?></textarea>
            </label>
        <?php
    }
}
	
	$wp_customize->get_setting( 'blogname' )->transport         = 'postMessage';
	$wp_customize->get_setting( 'blogdescription' )->transport  = 'postMessage';
	$wp_customize->remove_control('header_textcolor');
	$wp_customize->remove_control('display_header_text');
	
	$wp_customize->add_section(
        'logo_sec',
        array(
            'title' => __('Logo (PRO Version)', 'gravida'),
            'priority' => 1,
            'description' => sprintf( __( 'Logo Settings available in %s.', 'gravida' ), sprintf( '<a href="%1$s" target="_blank">%2$s</a>', esc_url( '"'.SKT_PRO_THEME_URL.'"' ), __( 'PRO Version', 'gravida' ))),	
        )
    );  
    $wp_customize->add_setting('gravida_options[logo-info]', array(
			'sanitize_callback' => 'sanitize_text_field',
            'type' => 'info_control',
            'capability' => 'edit_theme_options',
        )
    );
    $wp_customize->add_control( new gravida_Info( $wp_customize, 'logo_section', array(
        'section' => 'logo_sec',
        'settings' => 'gravida_options[logo-info]',
        'priority' => null
        ) )
    );
	
	$wp_customize->add_setting('color_scheme',array(
			'default'	=> '#0ec7ab',
			'sanitize_callback'	=> 'sanitize_hex_color'
	));
	
	$wp_customize->add_control(
		new WP_Customize_Color_Control($wp_customize,'color_scheme',array(
			'label' => __('Color Scheme','gravida'),
			 'description' => sprintf( __( 'More color options in %s.', 'gravida' ), sprintf( '<a href="%1$s" target="_blank">%2$s</a>', esc_url( '"'.SKT_PRO_THEME_URL.'"' ), __( 'PRO Version', 'gravida' ))),			
			'section' => 'colors',
			'settings' => 'color_scheme'
		))
	);
	
	$wp_customize->add_section('footer_text',array(
			'title'	=> __('Footer Text','gravida'),
			'priority'	=> null,
			'description'	=> __('Add footer copyright text','gravida')
	));
	
	$wp_customize->add_setting('gravida_options[credit-info]', array(
			'sanitize_callback' => 'sanitize_text_field',
            'type' => 'info_control',
            'capability' => 'edit_theme_options',
        )
    );
    $wp_customize->add_control( new gravida_Info( $wp_customize, 'cred_section', array(
        'section' => 'footer_text',
		'label'	=> __('To remove credit &amp; copyright text upgrade to PRO version','gravida'),
        'settings' => 'gravida_options[credit-info]',
        ) )
    );
	
	$wp_customize->add_setting('footer_right',array(
			'default'	=> __('<a href="#">Home</a> | <a href="#">Contact Us</a> | <a href="#">Sitemap</a>','gravida'),
			'sanitize_callback'	=> 'wp_htmledit_pre'
	));
	
	$wp_customize->add_control(
		new WP_Customize_Textarea_Control(
			$wp_customize,
			'footer_right',
			array(
				'label'	=> __('Footer right text','gravida'),
				'section'	=> 'footer_text',
				'setting'	=> 'footer_right'
			)
		)
	);
	
	$wp_customize->add_section('slider_section',array(
		'title'	=> __('Slider Settings','gravida'),
		 'description' => sprintf( __( 'Featured Image Size Should be ( 1400x446 ) More slider settings available in %s.', 'gravida' ), sprintf( '<a href="%1$s" target="_blank">%2$s</a>', esc_url( '"'.SKT_PRO_THEME_URL.'"' ), __( 'PRO Version', 'gravida' ))),	
		'priority'		=> null
	));
	
	// Slide Image 1
	$wp_customize->add_setting('slide_image1',array(
		'default'	=> get_template_directory_uri().'/images/slides/slider1.jpg',
		'sanitize_callback'	=> 'esc_url_raw',
	));
	
	$wp_customize->add_control(
    new WP_Customize_Image_Control(
        $wp_customize,
        'slide_image1',
        array(
            'label' => __('Slide Image 1 (1400x446)','gravida'),
            'section' => 'slider_section',
            'settings' => 'slide_image1'
        )
    )
);

	$wp_customize->add_setting('slide_title1',array(
			'default'	=> __('The Next Level in WordPress Theme','gravida'),
			'sanitize_callback'	=> 'sanitize_text_field'
	));
	
	$wp_customize->add_control('slide_title1',array(
		'label'	=> __('Slider title 1','gravida'),
		'setting'	=> 'slide_title1',
		'section'	=> 'slider_section'
	));
	
	$wp_customize->add_setting('slide_desc1',array(
		'default'	=> __('Take your Website to the next level.','gravida'),
		'sanitize_callback'	=> 'wp_htmledit_pre'	
	));
	
	$wp_customize->add_control(
		new WP_Customize_Textarea_Control(
			$wp_customize,
			'slide_desc1',
			array(
				'label'	=> __('Slider description  1','gravida'),
				'setting'	=> 'slide_desc1',
				'section'	=> 'slider_section'
			)
		)
	);
	
	$wp_customize->add_setting('slide_link1',array(
			'default'	=> '#link1',
			'sanitize_callback'	=> 'esc_url_raw'
	));
	
	$wp_customize->add_control('slide_link1',array(
			'label'	=> __('Slide link 1','gravida'),
			'setting'	=> 'slide_link1',
			'section'	=> 'slider_section'
	));
	
	$wp_customize->add_setting('slide_image2',array(
			'default'	=> get_template_directory_uri().'/images/slides/slider2.jpg',
			'sanitize_callback'	=> 'esc_url_raw'
	));
	
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'slide_image2',
			array(
				'label'	=> __('Slide image 2','gravida'),
				'setting'	=> 'slide_image2',
				'section'	=> 'slider_section'
			)
		)
	);
	
	$wp_customize->add_setting('slide_title2',array(
			'default'	=> __('Gravida WordPress Theme','gravida'),
			'sanitize_callback'		=> 'sanitize_text_field',
	));
	
	$wp_customize->add_control('slide_title2',array(
			'label'	=> __('Slide title 2','gravida'),
			'setting'	=> 'slide_title2',
			'section'	=> 'slider_section'
	));
	
	$wp_customize->add_setting('slide_desc2',array(
			'default'	=> __('Responsive & Retina Ready with Clean and Modern Design','gravida'),
			'sanitize_callback'	=> 'wp_htmledit_pre'
	));
	
	$wp_customize->add_control(
		new WP_Customize_Textarea_Control(
			$wp_customize,
			'slide_desc2',
			array(
				'label'	=> __('Slide description 2','gravida'),
				'setting'	=> 'slide_desc2',
				'section'	=> 'slider_section'
			)
		)
	);
	
	$wp_customize->add_setting('slide_link2',array(
			'default'	=> '#link2',
			'sanitize_callback'	=> 'esc_url_raw'
	));
	
	$wp_customize->add_control('slide_link2',array(
		'label'	=> __('Slide link 2','gravida'),
		'setting'	=> 'slide_link2',
		'section'	=> 'slider_section'
	));
	
	$wp_customize->add_setting('slide_image3',array(
			'default'	=> get_template_directory_uri().'/images/slides/slider3.jpg',
			'sanitize_callback'	=> 'esc_url_raw'
	));
	
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'slide_image3',
			array(
				'label'	=> __('Slide Image 3','gravida'),
				'setting'	=> 'slide_image3',
				'section'	=> 'slider_section'
			)
		)
	);
	
	$wp_customize->add_setting('slide_title3',array(
			'default'	=> __('Incredible Ease of Customization','gravida'),
			'sanitize_callback'	=> 'sanitize_text_field'
	));
	
	$wp_customize->add_control('slide_title3',array(
			'label'	=> __('Slide title 3','gravida'),
			'setting'	=> 'slide_image3',
			'section'	=> 'slider_section'
	));
	
	$wp_customize->add_setting('slide_desc3',array(
			'default'	=> __('Re-Usable features with amazing user experience','gravida'),
			'sanitize_callback'	=> 'wp_htmledit_pre'
	));
	
	$wp_customize->add_control(
		new WP_Customize_Textarea_Control(
			$wp_customize,
			'slide_desc3',
			array(
				'label'	=> __('Slide Description 3','gravida'),
				'setting'	=> 'slide_desc3',
				'section'	=> 'slider_section'
			)
		)
	);
	
	$wp_customize->add_setting('slide_link3',array(
			'default'	=> '#link3',
			'sanitize_callback'	=> 'esc_url_raw'
	));
	
	$wp_customize->add_control('slide_link3',array(
			'label'	=> __('Slide link 3','gravida'),
			'setting'	=> 'slide_link3',
			'section'	=> 'slider_section'
	));
	
	$wp_customize->add_setting('slide_image4',array(
			'default'	=> '',
			'sanitize_callback'	=> 'wp_htmledit_pre'
	));
	
	$wp_customize->add_control(
	 	new WP_Customize_Image_Control(
			$wp_customize,
			'slide_image4',
			array(
				'label'	=> __('Slide Image 4','gravida'),
				'setting'	=> 'slide_image4',
				'section'	=> 'slider_section'
			)
		)
	);
	
	$wp_customize->add_setting('slide_title4',array(
			'default'	=> '',
			'sanitize_callback'	=> 'sanitize_text_field'
	));
	
	$wp_customize->add_control('slide_title4',array(
			'label'	=> __('Slide title 4','gravida'),
			'setting'	=> 'slide_title4',
			'section'	=> 'slider_section'
	));
	
	$wp_customize->add_setting('slide_desc4',array(
			'default'	=> '',
			'sanitize_callback'	=> 'wp_htmledit_pre'
	));
	
	$wp_customize->add_control(
		new WP_Customize_Textarea_Control(
			$wp_customize,
			'slide_desc4',
			array(
				'label'	=> __('Slide description 4','gravida'),
				'setting'	=> 'slide_desc4',
				'section'	=> 'slider_section'
			)
		)
	);
	
	$wp_customize->add_setting('slide_link4',array(
			'default'	=> '',
			'sanitize_callback'	=> 'esc_url_raw'
	));	
	
	$wp_customize->add_control('slide_link4',array(
			'label'	=> __('Slide link 4','gravida'),
			'setting'	=> 'slide_link4',
			'section'	=> 'slider_section'
	));
	
	$wp_customize->add_setting('slide_image5',array(
			'default'	=> '',
			'sanitize_callback'	=> 'esc_url_raw'
	));
	
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'slide_image5',
			array(
				'label'	=> __('Slide image 5','gravida'),
				'setting'	=> 'slide_image5',
				'section'	=> 'slider_section'
			)
		)
	);
	
	$wp_customize->add_setting('slide_title5',array(
			'default'	=> '',
			'sanitize_callback'	=> 'sanitize_text_field'
	));
	
	$wp_customize->add_control('slide_title5',array(
			'label'	=> __('Slide title 5','gravida'),
			'setting'	=> 'slide_title5',
			'section'	=> 'slider_section'
	));
	
	$wp_customize->add_setting('slide_desc5',array(
			'default'	=> '',
			'sanitize_callback'	=> 'wp_htmledit_pre'
	));
	
	$wp_customize->add_control(
		new WP_Customize_Textarea_Control(
			$wp_customize,
			'slide_desc5',
			array(
				'label'	=> __('Slide description 5','gravida'),
				'setting'	=> 'slide_desc5',
				'section'	=> 'slider_section'
			)
		)
	);
	
	$wp_customize->add_setting('slide_link5',array(
			'default'	=> '',
			'sanitize_callback'	=> 'esc_url_raw'
	));
	
	$wp_customize->add_control('slide_link5',array(
			'label'	=> __('Slide link 5','gravida'),
			'setting'	=> 'slide_link5',
			'section'	=> 'slider_section'
	));
	
	$wp_customize->add_section('page_boxes',array(
		'title'	=> __('Homepage Boxes','gravida'),
 			'description' => sprintf( __( 'Featured Image Dimensions : ( 58 X 58 )<br/> Select Featured Image for these pages <br /> How to set featured image %s', 'gravida' ), sprintf( '<a href="%1$s" target="_blank">%2$s</a>', esc_url( '"'.SKT_THEME_FEATURED_SET_VIDEO_URL.'"' ), __( 'Click Here ?', 'gravida' )
						)
					),
		'priority'	=> null
	));
	
	$wp_customize->add_setting(
    'page-setting1',
		array(
			'default' => '0',
			'capability' => 'edit_theme_options',		
			'sanitize_callback' => 'gravida_sanitize_integer',
		)
	);
 
	$wp_customize->add_control(
		'page-setting1',
		array(
			'type' => 'dropdown-pages',
			'label' => __('Choose a page for box one:','gravida'),
			'section' => 'page_boxes',
		)
	);
	
	$wp_customize->add_setting('page-setting2',array(
			'default' => '0',
			'capability' => 'edit_theme_options',	
			'sanitize_callback'	=> 'gravida_sanitize_integer'
	));
	
	$wp_customize->add_control('page-setting2',array(
			'type'	=> 'dropdown-pages',
			'label'	=> __('Choose a page for box two:','gravida'),
			'section'	=> 'page_boxes'	
	));
	
	$wp_customize->add_setting('page-setting3',array(
			'default' => '0',
			'capability' => 'edit_theme_options',	
			'sanitize_callback'	=> 'gravida_sanitize_integer'
	));
	
	$wp_customize->add_control('page-setting3',array(
			'type'	=> 'dropdown-pages',
			'label'	=> __('Choose a page for box three:','gravida'),
			'section'	=> 'page_boxes'
	));
	
	$wp_customize->add_setting('page-setting4',array(
			'default' => '0',
			'capability' => 'edit_theme_options',	
			'sanitize_callback'	=> 'gravida_sanitize_integer'
	));
	
	$wp_customize->add_control('page-setting4',array(
			'type'	=> 'dropdown-pages',
			'label'	=> __('Choose a page for box four:','gravida'),
			'section'	=> 'page_boxes'
	));
	
	$wp_customize->add_section('social_sec',array(
			'title'	=> __('Social Settings','gravida'),
			'description' => sprintf( __( 'More social icon available in %s.', 'gravida' ), sprintf( '<a href="%1$s" target="_blank">%2$s</a>', esc_url( '"'.SKT_PRO_THEME_URL.'"' ), __( 'PRO Version', 'gravida' ))),	
			'priority'		=> null
	));
	
	$wp_customize->add_setting('fb_link',array(
			'default'	=> '#facebook',
			'sanitize_callback'	=> 'esc_url_raw'	
	));
	
	$wp_customize->add_control('fb_link',array(
			'label'	=> __('Add facebook link here','gravida'),
			'setting'	=> 'fb_link',
			'section'	=> 'social_sec'
	));
	
	$wp_customize->add_setting('twitt_link',array(
			'default'	=> '#twitter',
			'sanitize_callback'	=> 'esc_url_raw'
	));
	
	$wp_customize->add_control('twitt_link',array(
			'label'	=> __('Add twitter link here','gravida'),
			'setting'	=> 'twitt_link',
			'section'	=> 'social_sec'
	));
	
	$wp_customize->add_setting('gplus_link',array(
			'default'	=> '#gplus',
			'sanitize_callback'	=> 'esc_url_raw'
	));
	
	$wp_customize->add_control('gplus_link',array(
			'label'	=> __('Add google plus link here','gravida'),
			'setting'	=> 'gplus_link',
			'section'	=> 'social_sec'
	));
	
	$wp_customize->add_setting('linked_link',array(
			'default'	=> '#linkedin',
			'sanitize_callback'	=> 'esc_url_raw'
	));
	
	$wp_customize->add_control('linked_link',array(
			'label'	=> __('Add linkedin link here','gravida'),
			'setting'	=> 'linked_link',
			'section'	=> 'social_sec'
	));
	
	$wp_customize->add_section('contact_sec',array(
			'title'	=> __('Contact Details','gravida'),
			'description'	=> __('Add you contact details here','gravida'),
			'priority'	=> null
	));
	
	$wp_customize->add_setting('contact_title',array(
			'default'	=> __('Contact Gravida','gravida'),
			'sanitize_callback'	=> 'sanitize_text_field'
	));
	
	$wp_customize->add_control('contact_title',array(
			'label'	=> __('Add contact title here','gravida'),
			'setting'	=> 'contact_title',
			'section'	=> 'contact_sec'
	));
	
	$wp_customize->add_setting('contact_desc',array(
			'default'	=> __('If you have any questions don\'t hesitate to contact us','gravida'),
			'sanitize_callback'	=> 'wp_htmledit_pre'
	));
	
	$wp_customize->add_control(
		new WP_Customize_Textarea_Control(
			$wp_customize,
			'contact_desc',
			array(
				'label'	=> __('Add contact description here','gravida'),
				'setting'	=> 'contact_desc',
				'section'	=> 'contact_sec'
			)
		)
	);
	
	$wp_customize->add_setting('contact_add',array(
			'default'	=> __('Dummy Donec Rutrum, 1234 N Duis lacinia vel.','gravida'),
			'sanitize_callback'	=> 'wp_htmledit_pre'
	));
	
	$wp_customize->add_control(
		new WP_Customize_Textarea_Control(
			$wp_customize,
			'contact_add',
			array(
				'label'	=> __('Add contact address here','gravida'),
				'setting'	=> 'contact_add',
				'section'	=> 'contact_sec'
			)
		)
	);
	
	$wp_customize->add_setting('contact_no',array(
			'default'	=> __('+123 456 7890','gravida'),
			'sanitize_callback'	=> 'sanitize_text_field'
	));
	
	$wp_customize->add_control('contact_no',array(
			'label'	=> __('Add contact number here.','gravida'),
			'setting'	=> 'contact_no',
			'section'	=> 'contact_sec'
	));
	
	$wp_customize->add_setting('contact_mail',array(
			'default'	=> 'contact@company.com',
			'sanitize_callback'	=> 'sanitize_email'
	));
	
	$wp_customize->add_control('contact_mail',array(
			'label'	=> __('Add you email here','gravida'),
			'setting'	=> 'contact_mail',
			'section'	=> 'contact_sec'
	));
	
	$wp_customize->add_section(
        'theme_layout_sec',
        array(
            'title' => __('Layout Settings (PRO Version)', 'gravida'),
            'priority' => null,
            'description' => sprintf( __( 'Layout Settings available in   %s.', 'gravida' ), sprintf( '<a href="%1$s" target="_blank">%2$s</a>', esc_url( '"'.SKT_PRO_THEME_URL.'"' ), __( 'PRO Version', 'gravida' ))),
        )
    );  
    $wp_customize->add_setting('gravida_options[layout-info]', array(
			'sanitize_callback' => 'sanitize_text_field',
            'type' => 'info_control',
            'capability' => 'edit_theme_options',
        )
    );
    $wp_customize->add_control( new gravida_Info( $wp_customize, 'layout_section', array(
        'section' => 'theme_layout_sec',
        'settings' => 'gravida_options[layout-info]',
        'priority' => null
        ) )
    );
	
	$wp_customize->add_section(
        'theme_font_sec',
        array(
            'title' => __('Fonts Settings (PRO Version)', 'gravida'),
            'priority' => null,
            'description' => sprintf( __( 'Font Settings available in   %s.', 'gravida' ), sprintf( '<a href="%1$s" target="_blank">%2$s</a>', esc_url( '"'.SKT_PRO_THEME_URL.'"' ), __( 'PRO Version', 'gravida' ))),		
        )
    );  
    $wp_customize->add_setting('gravida_options[font-info]', array(
			'sanitize_callback' => 'sanitize_text_field',
            'type' => 'info_control',
            'capability' => 'edit_theme_options',
        )
    );
    $wp_customize->add_control( new gravida_Info( $wp_customize, 'font_section', array(
        'section' => 'theme_font_sec',
        'settings' => 'gravida_options[font-info]',
        'priority' => null
        ) )
    );
	
    $wp_customize->add_section(
        'theme_doc_sec',
        array(
            'title' => __('Documentation &amp; Support', 'gravida'),
            'priority' => null,
			 'description' => sprintf( __( 'For documentation and support check this link %s.', 'gravida' ), sprintf( '<a href="%1$s" target="_blank">%2$s</a>', esc_url( '"'.SKT_THEME_DOC.'"' ), __( 'Gravida Documentation', 'gravida' ))),          
        )
    );  
    $wp_customize->add_setting('gravida_options[info]', array(
			'sanitize_callback' => 'sanitize_text_field',
            'type' => 'info_control',
            'capability' => 'edit_theme_options',
        )
    );
    $wp_customize->add_control( new gravida_Info( $wp_customize, 'doc_section', array(
        'section' => 'theme_doc_sec',
        'settings' => 'gravida_options[info]',
        'priority' => 10
        ) )
    );
	
	
}
add_action( 'customize_register', 'gravida_customize_register' );




//Integer
function gravida_sanitize_integer( $input ) {
    if( is_numeric( $input ) ) {
        return intval( $input );
    }
}

function gravida_custom_css(){
		?>
        	<style type="text/css">
					.logo h2::first-letter, 
					#content h1.entry-title::first-letter,
					.feature-box a,
					.latest-blog span a,
					.postmeta a:hover, 
					a, 
					#footer .widget-column a:hover, 
					#copyright a:hover,
					.blog-post-repeat .entry-summary a, 
					.entry-content a,
					#sidebar aside h3.widget-title,
					.blog-post-repeat .blog-title a{
						color:<?php echo get_theme_mod('color_scheme','#0ec7ab'); ?>;
					}
					.site-nav li:hover a, 
					.site-nav li.current_page_item a,
					.nivo-caption h1 a,
					.site-nav li:hover ul li:hover, 
					.site-nav li:hover ul li.current-page-item,
					.site-nav li:hover ul li,
					p.form-submit input[type="submit"],
					#sidebar aside.widget_search input[type="submit"], 
					.wpcf7 input[type="submit"], 
					.add-icon, 
					.phone-icon, 
					.mail-icon,
					.pagination ul li .current, .pagination ul li a:hover{
						background-color:<?php echo get_theme_mod('color_scheme','#0ec7ab'); ?>
					}
			</style>
	<?php }
add_action('wp_head','gravida_custom_css');	

/**
 * Binds JS handlers to make Theme Customizer preview reload changes asynchronously.
 */
function gravida_customize_preview_js() {
	wp_enqueue_script( 'gravida_customizer', get_template_directory_uri() . '/js/customizer.js', array( 'customize-preview' ), '20130508', true );
}
add_action( 'customize_preview_init', 'gravida_customize_preview_js' );


function gravida_custom_customize_enqueue() {
	wp_enqueue_script( 'gravida-custom-customize', get_template_directory_uri() . '/js/custom.customize.js', array( 'jquery', 'customize-controls' ), false, true );
}
add_action( 'customize_controls_enqueue_scripts', 'gravida_custom_customize_enqueue' );