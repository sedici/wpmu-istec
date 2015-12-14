<?php

/*Template Name: Membership*/


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
									<?php echo '<li><a href="'.$main_link.'">member</a></li>'; ?>
									<?php echo $children; ?>
									</ul>
								<?php } ?>
                                <div class="entry-content">
                                			<?php the_content(); ?>
                                </div><!-- entry-content -->
                      		<?php endwhile; else : endif;
								  rewind_posts();?>
				</div>
				<div class="sidebar_right">
					<a href="<?php bloginfo('template_directory'); ?>/content-files/ISTEC-Application-Es.pdf" target="blank">FORMULARIO</a>
				</div>	
            </div><!-- site-aligner -->
			<?php if(! $post->post_parent): ?>
						<section class="list-wrapper">
							<div class="site-aligner" >
							<?php
								$member_options = new WP_query( 'post_type=member' );
								if ( $member_options->have_posts() ) : while ( $member_options->have_posts() ) : $member_options->the_post();?>
										<?php
										if(in_category('institutional')){ ?>
											INSTITUTIONAL MEMBERSHIPS
											<div class="one_one">
												<ul>
													<li class="membership_info">
														<h4><?php the_title(); ?></h4>
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
											ACADEMIC MEMBERSHIPS
											<div class="one_one">
												<ul>
													<li class="membership_info">
														<h4><?php the_title(); ?></h4>
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
							?>
							</div>
						</section>
			<?php endif; ?>
    </div><!-- content -->
<?php get_footer(); ?>