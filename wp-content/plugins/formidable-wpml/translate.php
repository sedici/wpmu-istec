<div id="form_settings_page" class="wrap">
    <div class="frmicon icon32"><br/></div>
    <h2><?php _e('Translate Form', 'formidable') ?></h2>
    <?php 
    $path = method_exists('FrmAppHelper', 'plugin_path') ? FrmAppHelper::plugin_path() : FRM_PATH;
    include($path .'/classes/views/shared/errors.php'); 
    ?>
    <div class="alignright">
        <div id="postbox-container-1">
            <?php if ( !isset($hide_preview) || !$hide_preview ) {
                if (!$form->is_template){ ?>
            <p class="howto" style="margin-top:0;"><?php _e('Insert into a post, page or text widget', 'formidable') ?>
            <input type="text" readonly="true" class="frm_select_box" value="[formidable id=<?php echo $id; ?>]" /></p>
            <?php } ?>

            <p class="frm_orange"><a href="<?php echo FrmFormsHelper::get_direct_link($form->form_key); ?>" target="_blank"><?php _e('Preview', 'formidable') ?></a>
            <?php global $frm_settings; 
                if ($frm_settings->preview_page_id > 0){ ?>
                <?php _e('or', 'formidable') ?> 
                <a href="<?php echo add_query_arg('form', $form->form_key, get_permalink($frm_settings->preview_page_id)) ?>" target="_blank"><?php _e('Preview in Current Theme', 'formidable') ?></a>
            <?php } ?>
            </p>
            <?php
            } ?>
        </div>
    </div>
    <div class="alignleft">
    <?php FrmAppController::get_form_nav($id, true); ?>
    </div>
    
<form method="post">
    <p style="clear:left;">        
        <input type="submit" value="<?php _e('Update', 'formidable') ?>" class="button-primary" />
        <?php _e('or', 'formidable') ?>
        <a class="button-secondary cancel" href="<?php echo admin_url('admin.php?page=formidable') ?>&amp;frm_action=settings&amp;id=<?php echo $id ?>"><?php _e('Cancel', 'formidable') ?></a>
    </p>
    
    <div class="clear"></div> 

    <div id="poststuff" class="metabox-holder">
    <div id="post-body">
    
        <input type="hidden" name="id" value="<?php echo $id; ?>" />
        <input type="hidden" name="frm_action" value="update_translate" />
        <?php wp_nonce_field('frm_translate_form_nonce', 'frm_translate_form'); ?>

        <table class="widefat fixed">
        <thead>
            <tr>
            <th class="manage-column" width="170px"><?php echo FrmAppHelper::truncate($form->name, 40) ?></th>
            <?php foreach($langs as $lang){ 
                if($lang['code'] == $default_language)
                    continue;
                $col_order[] = $lang['code'];
                ?>
            <th class="manage-column frm_lang_<?php echo $lang['code'] ?>"><?php echo $lang['display_name']; ?></th>
            <?php } ?>
            </tr>
        </thead>
        <tbody>
        <?php
        $alternate = false;
        foreach($strings as $string){ 
            $name = preg_replace('/^'.$id.'_/', '', $string->name, 1); 
            $alternate = ($alternate == '') ? 'alternate' : '';
            $col = 0;
            
            if(strpos($string->name, $id .'_field-') === 0){
                $fid = explode('-', str_replace($id .'_field-', '', $string->name), 2);
                if ( ! is_array($string->value) ) {
                    
                    $new_val = false;
                    if ( isset($fields[$fid[0]]->{$fid[1]}) && $string->value != $fields[$fid[0]]->{$fid[1]} ) {
                        $string->value = $fields[$fid[0]]->{$fid[1]};
                        $new_val = true;
                    } else if ( isset($fields[$fid[0]]->field_options[$fid[1]]) && $string->value != $fields[$fid[0]]->field_options[$fid[1]] ) {
                        $string->value = $fields[$fid[0]]->field_options[$fid[1]];
                        $new_val = true;
                    }
                    
                    if ( $new_val && $string->value != '' && ! is_array($string->value) ) {
                        $str_name = (function_exists('mb_substr')) ? mb_substr($string->name, 0, 160) : substr($string->name, 0, 160);
                        icl_register_string('formidable', $str_name, $string->value);
                    }
                }
                unset($fid);
            }
            
            if(is_array($string->value)) 
                continue;
              
            if ( $string->value == '' || $string->value == '*') { 
                icl_unregister_string( 'formidable', $string->name );
                continue;
            }

        ?>
        <tr class="<?php echo $alternate; ?>">
            <td><?php echo htmlspecialchars(stripslashes($string->value)); ?></td>
        <?php
            foreach($translations as $trans){
                if($trans->string_id != $string->id)
                    continue;

                $col++; 
                $next_col = array_search($trans->language, $col_order);
                for($col; $col<$next_col; $col++){ ?>
        <td>
            <?php if( strlen($string->value) > 80){ ?>
            <textarea name="frm_wpml[<?php echo $string->id .'_'. $col_order[$col] ?>][value]" style="width:100%"></textarea>
            <?php }else{ ?>
            <input type="text" value="" name="frm_wpml[<?php echo $string->id .'_'. $col_order[$col] ?>][value]" style="width:100%" />
            <?php } ?>
            <input type="checkbox" value="<?php echo ICL_STRING_TRANSLATION_COMPLETE ?>" id="<?php echo $string->id .'_'. $col_order[$col] ?>_status" name="frm_wpml[<?php echo $string->id .'_'. $col_order[$col] ?>][status]" /> <label for="<?php echo $string->id .'_'. $col_order[$col] ?>_status"><?php _e('Complete', 'formidable')?></label>
        </td>
        <?php
                }
         ?>
        <td>
            <?php if( strlen($string->value) > 80){ ?>
            <textarea name="frm_wpml[<?php echo $trans->id ?>][value]" style="width:100%"><?php echo FrmAppHelper::esc_textarea(stripslashes($trans->value)) ?></textarea>
            <?php }else{ ?>
            <input type="text" value="<?php echo esc_attr(stripslashes($trans->value)) ?>" name="frm_wpml[<?php echo $trans->id ?>][value]" style="width:100%" />
            <?php } ?>
            <input type="checkbox" value="<?php echo ICL_STRING_TRANSLATION_COMPLETE ?>" id="<?php echo $trans->id ?>_status" name="frm_wpml[<?php echo $trans->id ?>][status]" <?php checked($trans->status, ICL_STRING_TRANSLATION_COMPLETE) ?>/> <label for="<?php echo $trans->id ?>_status"><?php _e('Complete', 'formidable')?></label>
        </td>
        <?php
                unset($trans);
            }

            if($col < $lang_count){
                $col++; 
                for($col; $col<=$lang_count; $col++){ ?>
        <td>
            <?php if( strlen($string->value) > 80){ ?>
            <textarea name="frm_wpml[<?php echo $string->id .'_'. $col_order[$col] ?>][value]" style="width:100%"></textarea>
            <?php }else{ ?>
            <input type="text" value="" name="frm_wpml[<?php echo $string->id .'_'. $col_order[$col] ?>][value]" style="width:100%" />
            <?php } ?>
            <input type="checkbox" value="<?php echo ICL_STRING_TRANSLATION_COMPLETE ?>" id="<?php echo $string->id .'_'. $col_order[$col] ?>_status" name="frm_wpml[<?php echo $string->id .'_'. $col_order[$col] ?>][status]" /> <label for="<?php echo $string->id .'_'. $col_order[$col] ?>_status"><?php _e('Complete', 'formidable')?></label>
        </td>
        <?php
                }
            }
            unset($string);
        ?>
        </tr>
        <?php
        }
        ?> 
        </tr>
        </tbody>
        </table>
        <p class="howto"><?php printf(__('If you are missing parts of the form that need translation, please visit the %1$sWPML Translation Management%2$s page then return.', 'formidable'), '<a href="'.  admin_url('admin.php?page=wpml-translation-management/menu/main.php') .'">', '</a>'); ?></p>


    </div>

    </div>
    <p>        
        <input type="submit" value="<?php _e('Update', 'formidable') ?>" class="button-primary" />
        <?php _e('or', 'formidable') ?>
        <a class="button-secondary cancel" href="<?php echo admin_url('admin.php?page=formidable') ?>&amp;frm_action=settings&amp;id=<?php echo $id ?>"><?php _e('Cancel', 'formidable') ?></a>
    </p>
    </form>

</div>

<script type="text/javascript">
jQuery(document).ready(function($){
$('input[name^="frm_wpml"]:not([type=checkbox])').change(frmWPMLComplete);
})
function frmWPMLComplete(){
    if(jQuery(this).val() != ''){
        jQuery(this).next('input[type=checkbox]').prop('checked', true);
    }
}
</script>