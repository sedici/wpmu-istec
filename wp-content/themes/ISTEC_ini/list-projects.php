<?php
$paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;
$projects = new WP_Query(array('post_type' => 'project','posts_per_page' => 2,'paged' => $paged));

$image_path = get_bloginfo('template_directory'). '/images/';
?>
<div class="list-wrapper">
	<div class="site-aligner">
		<section class="site-main left-content">
			<div class="entry-content">
			<?php if ( $projects->have_posts() ) : while ( $projects->have_posts() ) : $projects->the_post(); ?>
				<ul class="resource-list">
					<li class="entry-content-item">
						<div class="post-thumb-id"><?php the_post_thumbnail(); ?></div>
						<div class="content">
							<?php 
							the_content();?>
						</div>
					</li>
				</ul>
			<?php endwhile; endif;?>
		
	<?php
					if (function_exists(custom_pagination)) {
							custom_pagination($events->max_num_pages,"",$paged);
						}?>	
			</div>
		</section>
		<?php
			$GLOBALS['sideb'] = "EVE";
			include('sidebar.php');
		?>
	</div>
</div>


