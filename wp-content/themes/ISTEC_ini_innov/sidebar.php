<?php
/**
 * The Sidebar containing the main widget areas.
 *
 * @package SKT Gravida
 */
?>
<?php 
if ($GLOBALS['sideb'] == "ABOUT"){
	global $page_links;
	$page_links_events = $page_links[2]->url;?>
	<h4>EVENTS</h4>
	<ul>
	<?php
	$events = new WP_Query(array('post_type' => 'events','posts_per_page' => 5));
	if ($events->have_posts()): while ($events->have_posts()): $events->the_post();?>
		<li><?php the_title();?></li>
	<?php
	endwhile; endif;?>
	<li><a href="<?php echo $page_links_events ?>">view all the events</a></li>
	</ul><?php
}elseif($GLOBALS['sideb'] == "RESO"){?>
	<div class="sidebar_right">
		<h4>OTHER RESOURCES</h4>
		<ul>
			<?php 
				$sidebarResources = new WP_query( array('post_type' => 'resources'));
				while ($sidebarResources->have_posts()) : $sidebarResources->the_post();?>
					<li><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
			<?php endwhile; ?>
		</ul>
	</div>
<?php 
}elseif($GLOBALS['sideb'] == "EVE"){ ?>
	<div class="sidebar_right sidebar-top-space">
				<h4>ISTEC NEWS</h4>
				<ul>
				<?php 
					$sidebarNews = new WP_query( array('post_type' => 'post'));
					while ($sidebarNews->have_posts()) : $sidebarNews->the_post();?>
						<li><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
					<?php endwhile; ?>
				</ul>
	</div>
<?php
}
else{?>
	<div class="sidebar_right">
				<h4>MORE NEWS</h4>
				<ul>
				<?php 
					$sidebarNews = new WP_query( array('post_type' => 'post'));
					while ($sidebarNews->have_posts()) : $sidebarNews->the_post();?>
						<li><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
					<?php endwhile; ?>
				</ul>
	</div>
<?php } ?>