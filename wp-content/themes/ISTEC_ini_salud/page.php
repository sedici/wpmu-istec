<?php
/**
 * The template for displaying all pages.
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * @package SKT Gravida
 */

get_header(); ?>
<?php if( have_posts() ) : while( have_posts() ) : the_post(); 
$sectionName = get_the_title($post->post_parent);?>
<div class="context"><div class="site-aligner"><h1><?php echo $sectionName ?></h1></div></div>
	<div id="content">
    		<div class="site-aligner">
				<div class="left-content">
								<?php 
								//subsections
								/*
								$subsections = get_pages( array( 'child_of' => $post->ID, 'sort_column' => 'post_date', 'sort_order' => 'desc' ) );
								foreach ( $subsections as $subsection ){
									echo '<a href="'.$subsection->guid.'">'.$subsection->post_title.'</a>';
								}
								*/
								?>
								<?php
								$main_link = get_permalink( $post->post_parent );
								
								if($post->post_parent)
									$children = wp_list_pages("title_li=&child_of=".$post->post_parent."&echo=0");
								else
									$children = wp_list_pages("title_li=&child_of=".$post->ID."&echo=0");
								if ($children) { ?>
									<ul class="page-nav">
									<?php echo '<li><a href="'.$main_link.'">otro link</a></li>'; ?>
									<?php echo $children; ?>
									</ul>
								<?php } ?>
                                <div class="entry-content">
                                			<?php the_content(); ?>
                                            <?php
												//If comments are open or we have at least one comment, load up the comment template
												if ( comments_open() || '0' != get_comments_number() )
													comments_template();
												?>
                                </div><!-- entry-content -->
                      		<?php endwhile; else : endif; ?>
				</div>
				<div class="sidebar_right">
				<?php
					$GLOBALS['sideb'] = "ABOUT";
					include('sidebar.php')
				?>
				</div>
            </div><!-- site-aligner -->
    </div><!-- content -->
<?php get_footer(); ?>