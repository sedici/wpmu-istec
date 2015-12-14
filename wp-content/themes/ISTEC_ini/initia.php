<?php
 /*Template Name: Initia-template*/
 
get_header(); ?>

<?php  
	get_template_part( 'context' ); ?>
	<div id="content">
    		<div class="site-aligner">
				<div class="left-content-related">
            		<?php if( have_posts() ) :
							while( have_posts() ) : the_post(); ?>
                                <div class="entry-content">
                                			<?php the_content(); ?>
                                            <?php/*
												//If comments are open or we have at least one comment, load up the comment template
												if ( comments_open() || '0' != get_comments_number() )
													comments_template();*/
												?>
                                </div><!-- entry-content -->
                      		<?php endwhile; else : endif;
								  wp_reset_postdata();?>
				</div>
				<div class="sidebar_right">
					<div class="initia-quote">
						<ul class="top-id"><li></li></ul>
						<p>In each of these broad realms of human concern — sustainability, health, vulnerability, and joy of living — specific grand challenges await engineering solutions. The world’s cadre of engineers will seek ways to put knowledge into practice to meet these grand challenges. Applying the rules of reason, the findings of science, the aesthetics of art, and the spark of creative imagination, engineers will continue the tradition of forging a better future</p>
					</div>
				</div>
            </div><!-- site-aligner -->
			<section class="list-wrapper">
				<div class="site-aligner">
					<?php 
						$initiaQuery = new WP_query('post_type=initia');
						if($initiaQuery -> have_posts()): while($initiaQuery -> have_posts()): $initiaQuery -> the_post();
							$featImage = wp_get_attachment_image_src(get_post_thumbnail_id($post->ID), 'full' );?>
							<div class="module-list-item-wrapper">
								<div style="background-image: url('<?php echo $featImage[0] ?>');" class="home-initiatives-id"><h3 class="initia-title"><?php the_title(); ?></h3></div>
								<div class="initiative-brief-desc"><?php the_content(); ?><a>VISIT SITE</a></div>
							</div>
						<?php 	 
						endwhile; endif;
						wp_reset_postdata();?>
				</div>
			</section>
    </div><!-- content -->
<?php get_footer(); ?>