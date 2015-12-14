<?php
/**
 * @package SKT Gravida
 */
?>
<article id="post-<?php the_ID(); ?>" <?php post_class('single-post'); ?>>

	<header class="entry-header">
        <h2 class="entry-title entry-title-underlined"><?php the_title(); ?></h2>
    </header><!-- .entry-header -->
    <div class="entry-content">
		<ul class="resource-list">
        <?php the_content(); 
		
		$res_list = get_post_meta(get_the_ID(), '_cmb_repeat_group', true);
		$image_path = get_bloginfo('template_directory'). '/images/';
		
		foreach ($res_list as $resource_item){
			if( $resource_item['extlink'] == ''){
				echo '<li><h3 class="news-title">'.$resource_item['name'].'</h3><a href="'.$resource_item['resfile'].'"><img src="'.$image_path.'/resources/download.jpg"/><p>Descargar</p></a></li>';
			}else{
				echo '<li><h3 class="news-title">'.$resource_item['name'].'</h3><a href="'.$resource_item['extlink'].'" target="blank"><img src="'.$image_path.'/resources/ext-link.jpg"/><p>Ir al recurso</p></a></li>';
			}
		}
		?>
		</ul>
    </div><!-- .entry-content -->

</article>