<?php
/**
 * The template for displaying Archive pages.
 *
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package SKT Gravida
 */
/*Template Name: Archives*/
get_header(); ?>

<?php 
get_template_part( 'context' ); ?>
<div class="list-wrapper">
	<div class="site-aligner">
		<?php $sectionName = get_the_title();
		if($sectionName == 'NEWS'){
			include('list-news.php');
		}elseif($sectionName == 'PROJECTS'){
			include('list-projects.php');
		}else{
			include('list-events.php');
		}?>
	</div>
</div>



<?php get_footer(); ?>