<div class="list-wrapper">
	<div class="site-aligner">
	<?php foreach(posts_by_year() as $year => $posts) : ?>
		<h2><?php echo $year; ?></h2>
		<ul>
			<?php foreach($posts as $post) : setup_postdata($post); ?>
			<li>
				<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
			</li>
			<?php endforeach; ?>
		</ul>
	<?php endforeach; ?>
	
	<?php  
		  $paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;
		  $eventarg = array('post_type' => 'events','posts_per_page' => 2,'paged' => $paged,);
		  $evquery = new WP_Query( $eventarg ); ?>
		  	
		  <div class="not-feat-list">
		  <?php
			  if ( $evquery->have_posts() ) : while ( $evquery->have_posts() ) : $evquery->the_post(); ?>
				  <article class="one_fourth">
					<?php the_post_thumbnail(); ?>
					<h3><?php the_title(); ?></h3>
					<div class="content">
					  <?php the_excerpt(); ?>
					</div>
				  </article>
				<?php endwhile; endif; ?>

				<!-- pagination here -->
				<?php
				  if (function_exists(custom_pagination)) {
					custom_pagination($evquery->max_num_pages,"",$paged);
				  }else{
					_e( 'Sorry, no posts matched your criteria.' );  
				  }
				?>

			  <?php wp_reset_postdata(); ?>
		  </div>
	</div>
</div>


