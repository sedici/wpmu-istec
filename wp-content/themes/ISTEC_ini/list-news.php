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
					<ul class="top-id"><li></li></ul>
					<div class="post-date"><?php echo get_the_date(); ?></div>
					<h2 class="featured"><a href="<?php the_permalink();?>"><?php the_title(); ?></a></h2>
					<div class="content">
					  <?php the_excerpt(); ?>
					</div>
				</div>
			  </article>
			<?php endwhile; endif;endif; wp_reset_postdata();?>
			
		  <div class="not-feat-list">
		  <?php
			  if ( $newsquery->have_posts() ) : while ( $newsquery->have_posts() ) : $newsquery->the_post(); ?>
				  <article class="one_fourth">
					<ul class="top-id"><li></li></ul>
					<?php the_post_thumbnail(); ?>
					<div class="list-txt-wrapper">
						<div class="post-date"><?php echo get_the_date(); ?></div>
						<h3 class="news-title"><a href="<?php the_permalink();?>"><?php the_title(); ?></a></h3>
						<div class="content"><?php the_excerpt(); ?></div>
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