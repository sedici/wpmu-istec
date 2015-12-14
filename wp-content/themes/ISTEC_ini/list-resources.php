<?php
$resourcequery = new WP_query( 'post_type=resources');
if ( $resourcequery->have_posts() ) : while ( $resourcequery->have_posts() ) : $resourcequery->the_post(); ?>
		<article class="one_fourth resources-list-item">
			<ul class="top-id"><li></li></ul>
			<div class="list-txt-wrapper">
				<h3><?php the_title(); ?></h3>
				<?php 
				if(in_category('internal')){?>
					<a href="<?php the_permalink();?>"><img src="<?php bloginfo('template_directory');?>/images/resources/go-to.jpg"/><p>ver recurso</p></a>
				<?php
				}else{?>
					<a href="<?php the_permalink();?>"><img src="<?php bloginfo('template_directory');?>/images/resources/ext-link.jpg"/><p>ir al recurso</p></a>
				<?php
				} ?>
			</div>
		</article>
	<?php
	endwhile; endif; ?>