<?php
$paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;

function posts_by_year(){
  $years = array();

  $posts = get_posts(array(
    'numberposts' => -1,
    'orderby' => 'post_date',
    'order' => 'ASC',
    'post_type' => 'events',
    'post_status' => 'publish',
	'paged' => $paged,
  ));

  foreach($posts as $post){
    $years[date('Y', strtotime($post->post_date))][] = $post;}

  krsort($years);

  return $years;
}

posts_by_year();

$blogtime = current_time('mysql');
print_r($blogtime);
?>
<div class="list-wrapper">
	<div class="site-aligner">
	<?php foreach(posts_by_year() as $year => $posts) : ?>
		<div class="year-item">
			<h2><?php echo $year; ?></h2>
			<ul>
				<?php foreach($posts as $post) : setup_postdata($post); ?>
				<article class="one_fourth">
					<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
					<div class="content">
						<?php the_excerpt(); ?>
					</div>
				</article>
				<?php endforeach; ?>
			</ul>
		</div>
	<?php endforeach; ?>
<?php
				if (function_exists(custom_pagination)) {
						custom_pagination($year->max_num_pages,"",$paged);
					}?>	
	</div>
</div>


