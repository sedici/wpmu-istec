<?php
function my_custom_footer() { ?>
	<style>
		#global_footer { 
			clear: both;
			padding: 10px 0px;
			text-align: center;
			background: inherit; 
			color: #9A9A9A;
			font-size: 8pt;
		}
	</style>

	<div id="global_footer"> <?php _e("Developed by"); ?>
		<a href="http://prebi.unlp.edu.ar" target="_BLANK"> PREBI </a> 
		<a href="http://sedici.unlp.edu.ar" target="_BLANK"> SEDICI </a> |
		<a href="http://www.unlp.edu.ar" target="_BLANK"> UNLP </a>
		- <?php echo date("Y"); ?>
	</div>

<?php }
add_action( 'wp_footer', 'my_custom_footer' );
?>
