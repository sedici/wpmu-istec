<?php
/**
 * The Template for displaying all single posts.
 *
 * @package SKT Gravida
 */

get_header(); ?>

<?php 
get_template_part( 'context' ); ?>
<div id="content">
    <div class="site-aligner">
		<?php while ( have_posts() ) : the_post(); ?>
		<section class="site-main left-content" id="sitemain">
				<div class="entry-content blog-post">
						<?php if(is_singular('post')){
								get_template_part( 'content', 'single' ); //llama a content-single
								}elseif (is_singular( 'events' )){
									echo ' esto es contenido de events ';
								}elseif (is_singular( 'resources' )){
									include( 'content-single-resources.php' );
									$GLOBALS['sideb'] = "RESO";
								} ?>
						
					
				</div>
		<?php endwhile; // end of the loop. ?>
		</section>
		<?php
			include('sidebar.php');
		?>
		
    </div><!-- site-aligner -->
</div><!-- content -->
	
<?php get_footer(); ?>