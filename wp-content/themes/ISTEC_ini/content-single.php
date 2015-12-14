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

    <div class="entry-content news-content">
        <?php the_content(); ?>
        <?php
        wp_link_pages( array(
            'before' => '<div class="page-links">' . __( 'Pages:', 'gravida' ),
            'after'  => '</div>',
        ) );
        ?>
		<?php gravida_content_nav( 'nav-below' ); ?>
	
    </div><!-- .entry-content -->

</article>