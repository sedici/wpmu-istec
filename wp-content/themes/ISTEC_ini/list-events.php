<?php
$paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;
$events = new WP_Query(array('post_type' => 'events','posts_per_page' => 2,'paged' => $paged));

$image_path = get_bloginfo('template_directory'). '/images/';
?>
<div class="list-wrapper">
	<div class="site-aligner">
		<section class="site-main left-content">
			<div class="entry-content">
			<?php if ( $events->have_posts() ) : while ( $events->have_posts() ) : $events->the_post(); ?>
				<ul class="resource-list">
					<li class="entry-content-item">
						<p class="post-date"><?php the_date(); ?></p>
						<h3 class="title-full-width"><?php the_title(); ?></h3>
						<div class="content">
							<?php 
							the_content();?>
							<ul class="event-resource-list">
								<?php
								$event_files = get_post_meta(get_the_ID(), '_cmb_event_first_group', true);
								$event_links = get_post_meta(get_the_ID(), '_cmb_event_second_group', true);
								
								if($event_files || $event_links){
									foreach ($event_files as $file){	
										echo '<li class="event-resource">
												<a href="'.$file['eventfile'].'" target="blank"><p>'.$file['eventfilename'].'</p><img src="'.$image_path.'/resources/download.png"/></a>
											  </li>';
									};
									foreach ($event_links as $link){	
										echo '<li class="event-resource">
												<a href="'.$link['eventlink'].'" target="blank"><p>'.$link['eventlinkname'].'</p><img src="'.$image_path.'/resources/ext-link.png"/></a>
											  </li>';
									};
								};								
								?>
							</ul>
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


