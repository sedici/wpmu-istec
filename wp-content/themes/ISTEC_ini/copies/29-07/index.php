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
        	<?php /* for($f=1; $f<5; $f++) { ?>
        	<?php if( get_theme_mod('page-setting'.$f)) { ?> 
            	<?php $queryvar = new WP_query('page_id='.get_theme_mod('page-setting'.$f,true)); ?>
                <?php while( $queryvar->have_posts() ) : $queryvar->the_post(); ?>
        		<div class="feature-box <?php if($f%4==0){ ?>last<?php } ?>">
                	<?php the_post_thumbnail(); ?>
                	<div class="feature-title"><?php the_title(); ?></div><!-- feature-title -->
                    <div class="feature-content"><?php echo gravida_content(18); ?></div>
                    <a href="<?php the_permalink(); ?>"><?php _e('Read More >','gravida'); ?></a>
                </div><!-- feature-box --><?php if($f%4==0) { ?><div class="clear"></div><?php } ?>
                <?php endwhile; ?>
                <?php wp_reset_query(); ?>
            <?php } else { ?>
            	<div class="feature-box <?php if($f%4==0){ ?>last<?php } ?>">
                	<img src="<?php echo get_template_directory_uri(); ?>/images/icon<?php echo $f; ?>.png" />
                	<div class="feature-title"><?php _e('Page Title','gravida'); ?> <?php echo $f; ?></div><!-- feature-title -->
                    <div class="feature-content"><?php _e('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget sapien nec eros ultricies eleifend non imperdiet tortor. Duis vulputate dignissim ante. Suspendisse vehicula quam vel pharetra molestie.','gravida'); ?></div>
                    <a href="#"><?php _e('Read More','gravida'); ?> ></a>
                </div><!-- feature-box --><?php if($f%4==0) { ?><div class="clear"></div><?php } ?>
            <?php } ?>
            <?php }*/ ?>
			<section class="home-initiatives-wrapper">
				<div class="home-section-header">
					<h4>INITIATIVES</h4><a href="">learn about initiatives</a>
				</div>
				<div class="home-section-content">
					<?php 
						$initiaQuery = new WP_query('post_type=initia');
						if($initiaQuery -> have_posts()): while($initiaQuery -> have_posts()): $initiaQuery -> the_post();
							$featImage = wp_get_attachment_image_src(get_post_thumbnail_id($post->ID), 'full' );?>
							<div style="background-image: url('<?php echo $featImage[0] ?>');" class="home-initiatives-item"><h3 class="initia-title"><?php the_title(); ?></h3></div>
						<?php 	 
						endwhile; endif;
						wp_reset_postdata();?>
				</div>
			</section>
        	
        </div>

	
            <section class="latest-blog list-wrapper">
                <div class="site-aligner">
                        <div class="home-section-header">
							<h4>NEWS</h4><a href="">read all news</a>
						</div>
                    	<div class="home-section-content">
                            <?php $k = 1;
							$id = get_cat_id('featured'); 
							$includeFeatured = "cat=" . $id;	
							$newsquery = new WP_query($includeFeatured ); ?>
                            	<?php while( $newsquery->have_posts() ) : $newsquery->the_post(); ?>                                
                                	
									<?php $k++; ?>
										<div class="one_fourth <?php if($k%4==0){?>last_column<?php } ?>">
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
							$id = get_cat_id('featured'); 
							$excludeFeatured = "cat=-" . $id;	
							$newsquery = new WP_query($excludeFeatured ); 
                            	while( $newsquery->have_posts() ) : $newsquery->the_post(); ?>  
										<div class="one_fourth"><h3 class="news-title"><?php the_title(); ?></h3></div>
										<div class="list-txt-wrapper">
													<div class="news-list-date"><?php echo get_the_date(); ?></div>
										</div>

								<?php endwhile; ?>	
									
									
						</div>                    
                    
                </div><div class="clear"></div>
            </section>

<?php endif; ?>


<?php get_footer(); ?>