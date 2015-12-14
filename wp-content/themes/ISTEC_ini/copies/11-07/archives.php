<?php
/**
 * The template for displaying Archive pages.
 *
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package SKT Gravida
 */
/*Template Name: Archives*/
get_header(); ?>

<?php 

  $paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;

  $custom_args = array(
      'post_type' => 'post',
      'posts_per_page' => 2,
      'paged' => $paged,
	  
    );

  $custom_query = new WP_Query( $custom_args ); ?>

  <?php if ( $custom_query->have_posts() ) : ?>

    <!-- the loop -->
    <?php while ( $custom_query->have_posts() ) : $custom_query->the_post(); ?>
      <article class="loop">
        <h3><?php the_title(); ?></h3>
        <div class="content">
          <?php the_excerpt(); ?>
        </div>
      </article>
    <?php endwhile; ?>
    <!-- end of the loop -->

    <!-- pagination here -->
    <?php
      if (function_exists(custom_pagination)) {
        custom_pagination($custom_query->max_num_pages,"",$paged);
      }
    ?>

  <?php wp_reset_postdata(); ?>

  <?php else:  ?>
    <p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
  <?php endif; ?>



<?php get_footer(); ?>