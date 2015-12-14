<?php
/**
 * The Header for our theme.
 *
 * Displays all of the <head> section and everything up till <div id="content">
 *
 * @package SKT Gravida
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="profile" href="http://gmpg.org/xfn/11">
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
<?php wp_head(); ?>

</head>

<body <?php body_class(''); ?>>
	<div id="wrapper">
    	<div class="header">
        		<div class="site-aligner">
					<div class="header-top-area">
						<?php $indexurl = home_url(); ?>
						<div class="logo"><a href="<?php echo $indexurl; ?>"><img src="<?php bloginfo('template_directory'); ?>/images/istec-liblink-logo.png"></a></div>
						<div class="mobile_nav"><a href="#"><?php _e('Go To...','gravida'); ?></a></div>
						<nav class="site-nav">
						
								<?php wp_nav_menu(array('theme_location' => 'primary')); ?>
								<p>I</p>
								<a href="http://www.istec.org/" target="blank" class="initiatives-istec-link">ISTEC.ORG</a>
							
						</nav>
					</div>
                </div>
        </div><!-- header -->
		<?php if ( is_home() || is_front_page() ) {?>
        <section id="home_slider">			        
        	<?php echo do_shortcode("[metaslider id=296]"); ?>
		</section>	
		<?php 
        } ?>
    </div>
            
       