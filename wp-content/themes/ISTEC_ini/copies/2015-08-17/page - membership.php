<?php

/*Template Name: Membership*/


get_header(); ?>
<?php if( have_posts() ) : while( have_posts() ) : the_post(); 
$sectionName = get_the_title($post->post_parent);?>
<div class="context"><div class="site-aligner"><h1><?php echo $sectionName ?></h1></div></div>
	<div id="content">
    		<div class="site-aligner">
				<div class="left-content-related">
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
									<?php echo '<li><a href="'.$main_link.'">membership levels</a></li>'; ?>
									<?php echo $children; ?>
									</ul>
								<?php } ?>
                                <div class="entry-content">
									<?php if (! $post->post_parent){
										$member_options = new WP_query( 'post_type=member' );
										if ( $member_options->have_posts() ) : while ( $member_options->have_posts() ) : $member_options->the_post();?>
												<?php
												if(in_category('institutional')){ ?>
													<h2 class="featured">Institutional Memberships</h2>
													<div class="one_one">
														<ul>
															<li class="membership_info">
																<h3 class="news-title"><?php the_title(); ?></h3>
																<?php the_content(); ?>
															</li>
															<?php
															$member_price = get_post_meta(get_the_ID(), 'member_cost', true);
															echo '<li class="price">'.$member_price.'</li>';
															?>
														</ul>
													</div>
												<?php 
												} else {?>
													<h2 class="featured">Academic Memberships</h2>
													<div class="one_one">
														<ul>
															<li class="membership_info">
																<h3 class="news-title"><?php the_title(); ?></h3>
																<?php the_content(); ?>
															</li>
															<?php
															$member_price = get_post_meta(get_the_ID(), 'member_cost', true);
															echo '<li class="price">'.$member_price.'</li>';
															?>
														</ul>
													</div>
												<?php
												}?>
										<?php 			
										endwhile; endif;
										} ?>
                                </div><!-- entry-content -->
                      		
				</div>
				<?php endwhile; else : endif;
				rewind_posts();?>
				<div class="sidebar_right">
					<h4>HOW TO BECOME A MEMBER</h4>
					To activate your membership, follow these steps:<br/>
					1) Download the application form from  <a href="<?php bloginfo('template_directory'); ?>/content-files/ISTEC-Application-Es.pdf" target="blank">here</a><br/>
					2) Submit your application via email or fax. Via email: fill-out the interactive pdf form, save, and send as an attachment to Roberto Murphy at presidente@istec.org. via fax: 01 (222) 247 43 06.<br/>
					3) Once your application is approved, you will receive an invoice with payment instructions<br/>
					If you have any questions or encounter problems with your application form, please contact Roberto Murphy at presidente@istec.org or call 01 (222) 247 43 06	
				</div>	
            </div><!-- site-aligner -->
    </div><!-- content -->


<?php get_footer(); ?>