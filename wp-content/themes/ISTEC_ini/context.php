<?php 
$sectionName = get_the_title();
if(is_singular( 'resources' )){
			echo'<div class="context"><div class="site-aligner"><h1>RESOURCES</h1></div></div>';
		}elseif(is_singular( 'post' ) || $sectionName == 'NEWS' ){
			echo'<div class="common-context-2"><div class="site-aligner"><h1>NEWS</h1></div></div>';
		}elseif($sectionName == 'INITIATIVES' ){
			echo'<div class="common-context-2"><div class="site-aligner"><h1>'.$sectionName.'</h1></div></div>';
		}elseif($sectionName == 'EVENTS' ){
			echo'<div class="events-context"><div class="site-aligner"><h1>'.$sectionName.'</h1></div></div>';
		}else{
			echo'<div class="common-context"><div class="site-aligner"><h1>'.$sectionName.'</h1></div></div>';
		} ?>