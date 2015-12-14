<?php

/*Template Name: Membership*/


get_header(); ?>
<?php if( have_posts() ) : while( have_posts() ) : the_post(); 
$sectionName = get_the_title($post->post_parent);?>
<div class="common-context"><div class="site-aligner"><h1><?php echo $sectionName ?></h1></div></div>
	<div id="content">
    		<div class="site-aligner">
				<div class="left-content-related">
                                <div class="entry-content">
									<?php if (! $post->post_parent){
										$member_options = new WP_query( 'post_type=member' );
										if ( $member_options->have_posts() ) : while ( $member_options->have_posts() ) : $member_options->the_post();?>
												<?php
												if(in_category('institutional')){ ?>
													<h2 class="entry-title-underlined">Institutional Memberships</h2>
													<div class="one_one">
														<ul>
															<li class="membership_info">
																<h3 class="news-title"><?php the_title(); ?></h3>
																<hr>
																<h5 class="benefits-label">BENEFITS</h5>
																<?php the_content(); ?>
															</li>
															<?php
															$member_price = get_post_meta(get_the_ID(), 'member_cost', true);
															echo '<li class="price"><h5 class="member-price-label">PRICE</h5>'.$member_price.'</li>';
															?>
														</ul>
													</div>
												<?php 
												} else {?>
													<h2 class="entry-title-underlined">Academic Memberships</h2>
													<div class="one_one">
														<ul>
															<li class="membership_info">
																<h3 class="news-title"><?php the_title(); ?></h3>
																<hr>
																<h5 class="benefits-label">BENEFITS</h5>
																<?php the_content(); ?>
															</li>
															<?php
															$member_price = get_post_meta(get_the_ID(), 'member_cost', true);
															echo '<li class="price"><h5 class="member-price-label">PRICE</h5>'.$member_price.'</li>';
															?>
														</ul>
													</div>
												<?php
												}?>
										<?php 			
										endwhile; endif;
										}else{?>
											<h2 class="entry-title-underlined"><?php the_title(); ?></h2>
											<div class="active-members-content"><?php the_content(); ?></div>
										<?php } ?>
                                </div><!-- entry-content -->
				</div>
				<?php endwhile; endif;
				rewind_posts();?>
				<div class="sidebar_right">
					<span class="sidebar-page-links">
					<?php 
					if ( have_posts() ) : while ( have_posts() ) : the_post();
						$main_link = get_permalink( $post->post_parent );
						if($post->post_parent)
							$children = wp_list_pages("title_li=&child_of=".$post->post_parent."&echo=0");
						else
							$children = wp_list_pages("title_li=&child_of=".$post->ID."&echo=0");
						if (! $post->post_parent ) {?>
							<ul class="page-nav-right">
								<?php echo $children; ?>
							</ul>
						<?php } else{ 
									echo '<li><a href="'.$main_link.'">MEMBERSHIP LEVELS</a></li>';
								}
					endwhile; endif;?>
					</span>
					<div class="membership-steps">
						<h4>HOW TO BECOME A MEMBER</h4>
						<ul>
							<li><h3>1</h3>Download the application form from  <a href="<?php bloginfo('template_directory'); ?>/content-files/ISTEC-Application-Es.pdf" target="blank">here</a></li>
							<li><h3>2</h3>fill out the application  form and submit it<br/>Via email: Roberto Murphy: presidente@istec.org.<br/>Via fax: 01 (222) 247 43 06.</li>
							<li><h3>3</h3>Once your application is approved, you will receive an invoice with payment instructions</li>
							<li>Questions or problems<br/> Roberto Murphy presidente@istec.org <br/>01 (222) 247 43 06</li>	
						</ul>
					</div>
				</div>	
            </div><!-- site-aligner -->
    </div><!-- content -->


<?php get_footer(); ?>