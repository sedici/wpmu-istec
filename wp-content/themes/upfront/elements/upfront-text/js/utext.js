(function ($) {
	define([
		'elements/upfront-text/js/model',
		'elements/upfront-text/js/element',
		'elements/upfront-text/js/settings',
		'elements/upfront-text/js/menu',
		'text!elements/upfront-text/tpl/utext.html'
	], function(UtextModel, TextElement, TextSettings, TextMenu, textTpl) {

		var l10n = Upfront.Settings.l10n.text_element;

		var TextView = Upfront.Views.ObjectView.extend({
			className: 'upfront-plain_txt',
			initialize: function() {
				this.constructor.__super__.initialize.apply(this, arguments);

				if(! (this.model instanceof UtextModel)){
					this.model = new UtextModel({properties: this.model.get('properties')});
				}

				/**
				 * Commenting the following because it caused the ueditor to restore draggablity while it was still editable
				 */
				//this.on('deactivated', function() {
				//	console.log('deactivating the text element editor');
				//	Upfront.Events.trigger('upfront:element:edit:stop');
				//}, this);
				this.listenTo(Upfront.Events, "theme_colors:update", this.update_colors, this);
			},
			get_content_markup: function () {
				var content = this.model.get_content(),
					$content;

				// Fix tagless content causes WSOD
				try {
				  $content = $(content);
				} catch (error) {
					$content = $('<p>' + content + '</p>');
				}

				if($content.hasClass('plaintxt_padding')) {
					content = $content.html();
				}

				var data = {
					"content" : content,
					"background_color" : this.model.get_property_value_by_name("background_color"),
					"border" : this.model.get_property_value_by_name("border")
				};
				var rendered = '';
				rendered = _.template(textTpl, data);
				return rendered + ( !this.is_edited() || $.trim(content) == '' ? '<div class="upfront-quick-swap"><p>' + l10n.dbl_click + '</p></div>' : '');
			},
			is_edited: function () {
				var is_edited = this.model.get_property_value_by_name('is_edited');
				return is_edited ? true : false;
			},
			on_render: function() {
				var me = this,
				blurTimeout = false;

				this.$el.find('.upfront-object-content')
					.addClass('upfront-plain_txt')
					.ueditor({
						linebreaks: false,
						//airButtons : ["upfrontFormatting"],
						autostart: false,
						paragraphize: false,
						focus: false,
						placeholder: l10n.default_content
					})
					.on('start', function(){
						var $swap = $(this).find('.upfront-quick-swap');
						if ( $swap.length ){
							$swap.remove();
						}
						me.model.set_property('is_edited', true, true);
						Upfront.Events.trigger('upfront:element:edit:start', 'text');
					})
					.on('stop', function(){
						var ed = me.$el.find('.upfront-object-content').data("ueditor"),
							text = ''
						;
						
						text = ed.getValue(true);
						me.model.set_content(text);
						
						Upfront.Events.trigger('upfront:element:edit:stop');
						ed.redactor.events.trigger('cleanUpListeners');
						me.render();
					})
					.on('syncAfter', function(){
						var text = $.trim($(this).html());
						me.model.set_content($(text).html(), {silent: true});
					})
				;
				
				me.update_colors();
			},
			update_colors: function () {
				var me = this;

				var bg = me.model.get_property_value_by_name("background_color");
				if (bg && Upfront.Util.colors.is_theme_color(bg)) {
					bg = Upfront.Util.colors.get_color(bg);
					me.$el.find(".plaintxt_padding").css("backgroundColor", bg);

					me.model.set_property("bg_color", bg);
				}

				var border = me.model.get_property_value_by_name("border"),
					matches = border ? border.match(/#ufc\d+/) : false
				;
				if (border && matches && matches.length) {
					var color = Upfront.Util.colors.get_color(matches[0]);
					border = border.replace(new RegExp(matches[0]), color);
					me.$el.find(".plaintxt_padding").css("border", border);

					me.model.set_property("border_color", color);
				}

			}
		});

		Upfront.Application.LayoutEditor.add_object("PlainTxt", {
			"Model": UtextModel,
			"View": TextView,
			"Element": TextElement,
			"Settings": TextSettings,
			"ContextMenu": TextMenu,
			cssSelectors: {
				'.upfront-plain_txt': {label: l10n.css.container_label, info: l10n.css.container_info},
				'.upfront-plain_txt p': {label: l10n.css.p_label, info: l10n.css.p_info},
			},
			cssSelectorsId: 'PlainTxtModel'
		});

		Upfront.Models.UtextModel = UtextModel;
		Upfront.Views.PlainTxtView = TextView;

	});
})(jQuery);
