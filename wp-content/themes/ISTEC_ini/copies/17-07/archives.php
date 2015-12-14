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
$GLOBALS['contxt'] = "NEWS";
get_template_part( 'context' ); ?>
<div class="list-wrapper">
	<div class="site-aligner">
	<?php 

		  $id = get_cat_id('featured'); 
		  $includeFeatured = "cat=" . $id;
		  $excludeFeatured = "cat=-" . $id;  
		  $newsqueryFeat = new WP_query($includeFeatured ); 
		  
		  $paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;
		  $custom_args = array('post_type' => 'post','posts_per_page' => 2,'paged' => $paged,);
		  $newsquery = new WP_Query( $custom_args, $excludeFeatured ); 
		  
		  if (!is_paged()):
		  if ( $newsqueryFeat->have_posts() ) : while ( $newsqueryFeat->have_posts() ) : $newsqueryFeat->the_post(); ?>
			  <article class="loop feat_list">
				<?php the_post_thumbnail(); ?>
				<div class="content_feat_list">
					<h2 class="featured"><a href="<?php the_permalink();?>"><?php the_title(); ?></a></h2>
					<div class="content">
					  <?php the_excerpt(); ?>
					</div>
				</div>
			  </article>
			<?php endwhile; endif;endif;?>
			
		  <div class="not-feat-list">
		  <?php
			  if ( $newsquery->have_posts() ) : while ( $newsquery->have_posts() ) : $newsquery->the_post(); ?>
				  <article class="one_fourth">
					<?php the_post_thumbnail(); ?>
					<h3><a href="<?php the_permalink();?>"><?php the_title(); ?></a></h3>
					<div class="content">
					  <?php the_excerpt(); ?>
					</div>
				  </article>
				<?php endwhile; endif; ?>

				<!-- pagination here -->
				<?php
				  if (function_exists(custom_pagination)) {
					custom_pagination($newsquery->max_num_pages,"",$paged);
				  }else{
					_e( 'Sorry, no posts matched your criteria.' );  
				  }
				?>

			  <?php wp_reset_postdata(); ?>
		  </div>
	</div>
</div>



<?php get_footer(); ?>