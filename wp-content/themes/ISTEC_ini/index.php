<?php
/**
 * The template for displaying home page.
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * @package SKT Gravida
 */

get_header(); 
?>

<?php if ( 'page' == get_option( 'show_on_front' ) && ( '' != get_option( 'page_for_posts' ) ) && $wp_query->get_queried_object_id() == get_option( 'page_for_posts' ) ) : ?>

   
<div id="content">
    <div class="site-aligner">
        <section class="site-main content-left" id="sitemain">
        	 <div class="blog-post">
					<?php
                    if ( have_posts() ) :
                        // Start the Loop.
                        while ( have_posts() ) : the_post();
                            /*
                             * Include the post format-specific template for the content. If you want to
                             * use this in a child theme, then include a file called called content-___.php
                             * (where ___ is the post format) and that will be used instead.
                             */
                            get_template_part( 'content', get_post_format() );
                    
                        endwhile;
                        // Previous/next post navigation.
                        gravida_pagination();
                    
                    else :
                        // If no content, include the "No posts found" template.
                         get_template_part( 'no-results', 'index' );
                    
                    endif;
                    ?>
                    </div><!-- blog-post -->
             </section>
        <div class="sidebar_right">
        <?php get_sidebar();?>
        </div><!-- sidebar_right -->
        <div class="clear"></div>
    </div><!-- site-aligner -->
</div><!-- content -->

<?php else: ?>
		
		<div class="feature-box-main site-aligner">
			<?php 
			global $page_links;
			$page_links_initia = $page_links[0]->url; 
			$page_links_news = $page_links[1]->url; 
			?>
			<section class="home-initiatives-wrapper">
				<div class="home-section-header">
					<h4 class="home-heading">PROJECTS</h4><a href="<?php echo $page_links_initia; ?>">learn about projects</a>
				</div>
				<div class="home-section-content">
					<?php 
						$projectQuery = new WP_query('post_type=project');
						if($projectQuery -> have_posts()): while($projectQuery -> have_posts()): $projectQuery -> the_post();?>
							<div class="span3">
								<div class="post-thumb-id"><?php the_post_thumbnail(); ?></div>
								<?php the_excerpt(); ?>
							</div>
						<?php 	 
						endwhile; endif;
						wp_reset_postdata();?>
				</div>
			</section>
        	
        </div>

	
            <section class="latest-blog list-wrapper">
                <div class="site-aligner top-space">
                        <div class="home-section-header">
							<h4 class="home-heading">NEWS</h4><a href="<?php echo $page_links_news; ?>">read all news</a>
						</div>
                    	<div class="home-section-content">
                            <?php $k = 1;
							$id = get_cat_id('featured'); 
							$includeFeatured = "cat=" . $id;	
							$newsquery = new WP_query($includeFeatured ); ?>
                            	<?php while( $newsquery->have_posts() ) : $newsquery->the_post(); ?>                                
                                	
									<?php $k++; ?>
										<div class="one_fourth <?php if($k%4==0){?>last_column<?php } ?>">
												<ul class="top-id"><li></li></ul>
												<p><a title="<?php the_title(); ?>" href="<?php the_permalink(); ?>">
													<?php if( has_post_thumbnail() ) { ?>
														<?php the_post_thumbnail();} ?></a></p>
												<div class="list-txt-wrapper">
													<div class="news-list-date"><?php echo get_the_date(); ?></div>
													<div class="recent-post-title">
														<h3 class="news-title"><a title="<?php the_title(); ?>" href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
													</div>
													<p><?php echo gravida_content(25); ?></p>
													<span><a href="<?php the_permalink(); ?>"><?php _e('Read More','gravida'); ?></a></span>
												</div>
												</div><?php if($k%4==0){?>
												<div class="clear"></div><?php }
								endwhile;
								wp_reset_postdata();
							$id = get_cat_id('featured'); 
							$excludeFeatured = "cat=-" . $id;	
							$newsquery2 = new WP_query(array( $excludeFeatured, 'posts_per_page' => '2') ); 
                            	while( $newsquery2->have_posts() ) : $newsquery2->the_post(); ?>  
										<div class="one_fourth">
											<ul class="top-id"><li></li></ul>
											<div class="list-txt-wrapper">
												<div class="news-list-date"><?php echo get_the_date(); ?></div>
												<h3 class="news-title"><?php the_title(); ?></h3>
												<p><?php echo gravida_content(25); ?></p>
												<span><a href="<?php the_permalink(); ?>"><?php _e('Read More','gravida'); ?></a></span>
											</div>
										</div>

								<?php endwhile; ?>	
									
									
						</div>                    
                    
                </div><div class="clear"></div>
            </section>

<?php endif; ?>


<?php get_footer(); ?>