<?php
/**
 * @package SKT Gravida
 */
?>
<article id="post-<?php the_ID(); ?>" <?php post_class('single-post'); ?>>

    <div class="postmeta">
        <div class="post-date"><?php echo get_the_date(); ?></div><!-- post-date -->
        <!--<div class="post-comment"> &nbsp;|&nbsp; <a href="<?php comments_link(); ?>"><?php comments_number(); ?></a></div>-->
    </div><!-- postmeta -->
	<header class="entry-header">
        <h2 class="entry-title"><?php the_title(); ?></h2>
    </header><!-- .entry-header -->

    <div class="entry-content">
		<?php 
        if (has_post_thumbnail() ){
			echo '<div class="post-thumb">';
            the_post_thumbnail();
			echo '</div><br />';
		}
        ?>
        <?php the_content(); ?>
        <?php
        wp_link_pages( array(
            'before' => '<div class="page-links">' . __( 'Pages:', 'gravida' ),
            'after'  => '</div>',
        ) );
        ?>
		<?php gravida_content_nav( 'nav-below' ); ?>
		<?php
		// If comments are open or we have at least one comment, load up the comment template
		if ( comments_open() || '0' != get_comments_number() )
			comments_template();
		?>
		<!--
        <div class="postmeta">
            <div class="post-categories"><?php the_category( __( ', ', 'gravida' )); ?></div>
            <div class="post-tags"><?php the_tags( __('&nbsp;|&nbsp; Tags: ', ', ', '<br />')); ?> </div>
            <div class="clear"></div>
        </div><!-- postmeta -->
	
    </div><!-- .entry-content -->

</article>