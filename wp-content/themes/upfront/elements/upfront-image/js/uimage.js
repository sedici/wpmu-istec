(function ($) {
define([
	'text!elements/upfront-image/tpl/image.html',
	'text!elements/upfront-image/tpl/image_editor.html',
	'elements/upfront-image/js/image-context-menu',
	'elements/upfront-image/js/image-settings',
	'elements/upfront-image/js/image-selector',
	'elements/upfront-image/js/image-editor',
	'elements/upfront-image/js/image-element',
	'elements/upfront-image/js/model'
], function(imageTpl, editorTpl, ImageContextMenu, ImageSettings, ImageSelector, ImageEditor, ImageElement, UimageModel) {

	var l10n = Upfront.Settings.l10n.image_element;
	var breakpointColumnPadding = Upfront.Views.breakpoints_storage.get_breakpoints().get_active().get('column_padding');
	breakpointColumnPadding = parseInt(breakpointColumnPadding, 10);
	breakpointColumnPadding = _.isNaN(breakpointColumnPadding) ? 15 : breakpointColumnPadding;

	// Variable used to speed resizing up;
	var resizingData = {};

	var UimageView = Upfront.Views.ObjectView.extend({
		model: UimageModel,
		imageTpl: Upfront.Util.template(imageTpl),
		sizehintTpl: _.template($(editorTpl).find('#sizehint-tpl').html()),
		cropTimeAfterResize: 1,// making this longer makes image resize not save

		initialize: function() {
			var me = this;
			this.setDefaults();

			if(! (this.model instanceof UimageModel)){
				this.model = new UimageModel({properties: this.model.get('properties')});
			}
			this.events = _.extend({}, this.events, {
				'click a.upfront-image-select': 'openImageSelector',
				'click div.upfront-quick-swap': 'openImageSelector',
				'dblclick .wp-caption': 'editCaption',
				'click .js-uimage-open-lightbox': 'openLightboxRegion',
				'click .swap-image-overlay': 'openImageSelector'
			});
			this.delegateEvents();

			this.bodyEventHandlers = {
				dragover: function(e){
					e.preventDefault();
					me.handleDragEnter(e);
				},
				dragenter: function(e){
					me.handleDragEnter(e);
				},
				dragleave: function(e){
					me.handleDragLeave(e);
				}
			};

			$('body').on('dragover', this.bodyEventHandlers.dragover)
				.on('dragenter', this.bodyEventHandlers.dragenter)
				.on('dragleave', this.bodyEventHandlers.dragleave)
				.on('drop', this.bodyEventHandlers.drop)
			;

			// Set the full size current size if we don't have attachment id
			if (!this.property('image_id')) {
				this.property('srcFull', this.property('src'));
			}

			this.listenTo(this.model.get('properties'), 'change', this.render);
			this.listenTo(this.model.get('properties'), 'add', this.render);
			this.listenTo(this.model.get('properties'), 'remove', this.render);

			this.listenTo(this.model, 'uimage:edit', this.editRequest);

			this.controls = this.createControls();

			if(this.property('image_status') !== 'ok' || this.property('quick_swap') || (this.isThemeImage() && !Upfront.themeExporter)) {
				this.property('has_settings', 0);
			}
			else {
				this.property('has_settings', 1);
			}

			this.listenTo(Upfront.Events, 'upfront:element:edit:start', this.on_element_edit_start);
			this.listenTo(Upfront.Events, 'upfront:element:edit:stop', this.on_element_edit_stop);

			this.listenTo(Upfront.Events, 'command:layout:save', this.saveResizing);
			this.listenTo(Upfront.Events, 'command:layout:save_as', this.saveResizing);

			this.listenTo(Upfront.Events, 'upfront:layout_size:change_breakpoint', function(newMode){
				if(newMode.id !== 'desktop') {
					this.setMobileMode();
				} else {
					this.unsetMobileMode();
				}
			});
		},

		setDefaults: function(){
			this.sizes = false;
			this.elementSize = {width: 0, height: 0};
			this.imageId = 0;
			this.imageSize = {width: 0, height: 0};
			this.imageOffset = {top: 0, left: 0};
			this.maskOffset = {top: 0, left: 0};
			this.imageInfo  = false;
			this.controls = false;
			this.editor = false;

			//Temporary props for element resizing and cropping
			this.temporaryProps = {
				size: false,
				position: false
			};
			this.cropTimer = false;
			this.stoppedTimer  = false;
		},

		getSelectedAlignment: function(){
			if(!this.property('include_image_caption') && this.property('caption_position') === false && this.property('caption_alignment') === false) {
				return 'nocaption';
			}
			if(this.property('caption_position') === 'below_image') {
				return 'below';
			}

			var align = this.property('caption_alignment');

			switch(align){
				case 'top':
					return 'topOver';
				case 'bottom':
					return 'bottomOver';
				case 'fill':
					return 'topCover';
				case 'fill_middle':
					return 'middleCover';
				case 'fill_bottom':
					return 'bottomCover';
			}

			return 'nocaption';
		},

		isThemeImage: function() {
			return this.property('srcFull') && this.property('srcFull').match('wp-content/themes/');
		},

		replaceImage: function() {
			this.openImageSelector();
		},

		createControls: function() {
			var me = this,
				panel = new Upfront.Views.Editor.InlinePanels.ControlPanel(),
				captionControl = new Upfront.Views.Editor.InlinePanels.TooltipControl()
			;

			// Do not allow editing of theme images if not in builder
			if (this.isThemeImage() && !Upfront.themeExporter) {
				return false;
			}

			captionControl.sub_items = {
				topOver: this.createControl('topOver', l10n.ctrl.over_top),
				bottomOver: this.createControl('bottomOver', l10n.ctrl.over_bottom),
				topCover: this.createControl('topCover', l10n.ctrl.cover_top),
				middleCover: this.createControl('middleCover', l10n.ctrl.cover_middle),
				bottomCover: this.createControl('bottomCover', l10n.ctrl.cover_bottom),
				below: this.createControl('below', l10n.ctrl.below),
				nocaption: this.createControl('nocaption', l10n.ctrl.no_caption)
			};

			captionControl.icon = 'caption';
			captionControl.tooltip = l10n.ctrl.caption_position;
			captionControl.selected = this.getSelectedAlignment();

			this.listenTo(captionControl, 'select', function(item){
				switch(item){
					case 'topOver':
						me.property('include_image_caption', [1]);
						me.property('caption_position', 'over_image');
						me.property('caption_alignment', 'top');
						break;
					case 'bottomOver':
						me.property('include_image_caption', [1]);
						me.property('caption_position', 'over_image');
						me.property('caption_alignment', 'bottom');
						break;
					case 'topCover':
						me.property('include_image_caption', [1]);
						me.property('caption_position', 'over_image');
						me.property('caption_alignment', 'fill');
						break;
					case 'middleCover':
						me.property('include_image_caption', [1]);
						me.property('caption_position', 'over_image');
						me.property('caption_alignment', 'fill_middle');
						break;
					case 'bottomCover':
						me.property('include_image_caption', [1]);
						me.property('caption_position', 'over_image');
						me.property('caption_alignment', 'fill_bottom');
						break;
					case 'below':
						me.property('include_image_caption', [1]);
						me.property('caption_position', 'below_image');
						me.property('caption_alignment', false);
						break;
					case 'nocaption':
						me.property('include_image_caption', false);
						me.property('caption_position', false);
						me.property('caption_alignment', false);
				}
				me.render();
			});

			panel.items = _([
				this.createControl('crop', l10n.ctrl.edit_image, 'editRequest'),
				this.createLinkControl(),
				captionControl
			]);

			return panel;
		},

		createLinkControl: function(){
			var me = this,
				control = new Upfront.Views.Editor.InlinePanels.DialogControl(),
				linkPanel;

			control.view = linkPanel = new Upfront.Views.Editor.LinkPanel({
				linkType: this.property('when_clicked'),
				linkUrl: this.property('image_link'),
				linkTarget: this.property('link_target'),
				linkTypes: { image: true },
				imageUrl: this.property('srcFull')
			});

			this.listenTo(control, 'panel:ok', function() {
				if(linkPanel.model.get('type') == 'lightbox' && linkPanel.$el.find('.js-ulinkpanel-lightbox-input').val() != '') {
					linkPanel.createLightBox();
				}
				control.close();
			});

			this.listenTo(control, 'panel:open', function() {
				me.$el.closest('.ui-draggable').draggable('disable');
				_.delay( function() {
					me.controls.$el.parent().parent().addClass('upfront-control-visible');
				}, 1000);
			});

			me.listenTo(control, 'panel:close', function(){
				me.controls.$el.parent().parent().removeClass('upfront-control-visible');
				me.$el.closest('.ui-draggable').draggable('enable');
			});

			me.listenTo(linkPanel, 'change', me.updateLink);
			me.listenTo(linkPanel, 'change:target', function(data) {
				me.property('link_target', data.target);
				me.$el.find('a').attr('target', data.target);
			});

			control.icon = 'link';
			control.tooltip = l10n.ctrl.image_link;
			control.id = 'link';

			return control;
		},

		updateLink: function(data) {
			this.property('when_clicked', data.type);
			this.property('image_link', data.url);
			this.property('link_target', data.target);

			this.render();
		},

		postTypes: function(){
			var types = [];
			_.each(Upfront.data.ugallery.postTypes, function(type){
				if(type.name !== 'attachment') {
					types.push({name: type.name, label: type.label});
				}
			});
			return types;
		},

		editCaption: function(){
			var me = this,
				captionEl = $('#' + this.property('element_id')).find('.wp-caption')
			;


			if(captionEl.find('.uimage-caption-cover').length) {
				captionEl = captionEl.find('.uimage-caption-cover');
			}

			if(captionEl.data('ueditor') || ! captionEl.length) { //Already instantiated
				return;
			}

			captionEl.ueditor({
					autostart: false,
					upfrontMedia: false,
					upfrontImages: false,
					airButtons: ['upfrontFormatting', 'bold', 'italic', 'stateAlign', 'upfrontLink', 'upfrontColor', 'upfrontIcons']
				})
				.on('start', function(){
					me.$el.addClass('upfront-editing');
				})
				.on('stop', function(){
					me.$el.removeClass('upfront-editing');
					me.render();
				})
				.on('syncAfter', function(){
					me.property('image_caption', captionEl.html());
				})
			;
		},

		createControl: function(icon, tooltip, click){
			var me = this,
				item = new Upfront.Views.Editor.InlinePanels.Control();
			item.icon = icon;
			item.tooltip = tooltip;
			if(click){
				this.listenTo(item, 'click', function(e){
					me[click](e);
				});
			}

			return item;
		},

		setImageInfo: function(){
			var maskSize, maskOffset,
				starting = this.$('.upfront-image-starting-select'),
				size = this.temporaryProps.size, //this.property('size'),
				position = this.temporaryProps.position, //this.property('position'),
				captionHeight = this.property('caption_position') === 'below_image' ? this.$('.wp-caption').outerHeight() : 0
			;

			if (starting.length) {
				maskSize = {
					width: starting.outerWidth(),
					height: starting.outerHeight()
				};
				maskOffset = starting.offset();
				position = false;
			} else {
				starting = this.$('.uimage');
				maskSize = {
					width: starting.width(),
					height: starting.height() - captionHeight
				};
				maskOffset = {
					top: starting.offset().top,
					left: starting.offset().left
				};
			}
	/*
			//Fix for responsive images
			if(img.length){
				size = {
					width: img.width(),
					height: img.height()
				},
				position = {
					top: -img.position().top,
					left: -img.position().left
				}

			}
	*/
			this.imageInfo = {
				id: this.property('image_id'),
				src: this.property('src'),
				srcFull: this.property('srcFull'),
				srcOriginal: this.property('srcOriginal'),
				size: size,
				position: position,
				rotation: this.property('rotation'),
				fullSize: this.property('fullSize'),
				align: this.property('align'),
				maskSize: maskSize,
				maskOffset: maskOffset
			};

		},

		isSmallImage: function() {
			var elementSize = this.property('element_size');
			if (resizingData.data && resizingData.data.elementSize) {
				elementSize = resizingData.data.elementSize;
			}
			return elementSize.width < 100 || elementSize.height < 50;
		},

		disableCaption: function() {
			this.property('include_image_caption', false);
		},

		enableCaption: function() {
			this.property('include_image_caption', true);
		},

		hasCaptionPosition: function() {
			return this.property('caption_position') !== false || this.property('caption_alignment') !== false;
		},

		setupBySize: function() {
			if (this.isSmallImage()) {
				this.disableCaption();
				this.parent_module_view.$el.addClass('uimage-small');
			} else if(this.hasCaptionPosition()) {
				this.enableCaption();
			}

			if (!this.isSmallImage()) {
				this.parent_module_view.$el.removeClass('uimage-small');
			}
		},

		get_content_markup: function () {
			var elementSize = this.property('element_size'),
				me = this,
				props = this.extract_properties(),
				rendered,
				smallSwap,
				render,
				size,
				img;

			this.setupBySize();

			if(!this.temporaryProps || !this.temporaryProps.size) {
				this.temporaryProps = {
					size: props.size,
					position: props.position
				};
			}

			props.url = this.property('when_clicked') ? this.property('image_link') : false;
			props.size = this.temporaryProps.size;
			props.position = this.temporaryProps.position;
			props.marginTop = Math.max(0, -props.position.top);
			props.link_target = props.link_target || '_self';

			props.cover_caption = props.caption_position !== 'below_image';

			if(props.stretch) {
				props.imgWidth = '100%';
			} else {
				props.imgWidth = props.size.width + 'px';
			}

			//Gif image handled as normal ones in the backend
			props.gifImage = '';
			props.gifLeft = 0;
			props.gifTop = 0;

			if (props.caption_position === 'below_image') {
				props.captionBackground = false;
			}

			props.l10n = l10n.template;

			rendered = this.imageTpl(props);

			if (this.property('quick_swap')) {
				smallSwap = props.element_size.width < 150 || props.element_size.height < 90 ? 'uimage-quick-swap-small' : '';

				rendered += '<div class="upfront-quick-swap ' + smallSwap + '"><p>Change this image</p></div>';
			} else if (this.property('image_status') === 'starting') {
				rendered = '<div class="upfront-image-starting-select upfront-ui" style="height:' + props.element_size.height + 'px"><div class="uimage-centered">' +
						'<span class="upfront-image-resizethiselement">' + l10n.ctrl.add_image + '</span><div class=""><a class="upfront-image-select" href="#" title="' + l10n.ctrl.add_image + '">+</a></div>'+
				'</div></div>';
			} else {
				render = $('<div></div>').append(rendered);
				size = props.size;
				img = render.find('img');
				props = this.temporaryProps;

				// Let's load the full image to improve resizing
				render.find('.upfront-image-container').css({
					overflow: 'hidden',
					position: 'relative',
					width: Math.min(elementSize.width, size.width),
					height: Math.min(elementSize.height, size.height)
				});

				img.attr('src', me.property('srcFull'))
					.css({
						width: size.width,
						height: size.height,
						position: 'absolute',
						top: Math.min(0, -props.position.top),
						left: Math.min(0, -props.position.left),
						'margin-top': 0,
						'max-height': 'none',
						'max-width': 'none'
					})
				;

				rendered = render.html();
			}

			return rendered;
		},

		on_render: function() {
			var me = this,
				onTop = ['bottom', 'fill_bottom'].indexOf(this.property('caption_alignment')) !== -1 || this.property('caption_position') === 'below_image' ? ' sizehint-top' : '',
				elementSize = this.property('element_size');

			//Bind resizing events
			if (!this.parent_module_view.$el.data('resizeHandling')) {
				this.parent_module_view.$el
					.on('resizestart', $.proxy(this.onElementResizeStart, this))
					.on('resize', $.proxy(this.onElementResizing, this))
					.on('resizestop', $.proxy(this.onElementResizeStop, this))
					.data('resizeHandling', true);
			}

			if(this.property('when_clicked') === 'lightbox') {
				this.$('a').addClass('js-uimage-open-lightbox');
			}

			if (this.isThemeImage() && !Upfront.themeExporter) {
				this.$el.addClass('image-from-theme');
				this.$el.find('b.upfront-entity_meta').after('<div class="swap-image-overlay"><p class="upfront-icon upfront-icon-swap-image"><span>Click to </span>Swap Image</p></div>');
			} else {
				var resizeHint = $('<div>').addClass('upfront-ui uimage-resize-hint' + onTop).html(this.sizehintTpl({
					width: elementSize.width,
					height: elementSize.height,
					l10n: l10n.template
				}));
				this.$el.append(resizeHint);
			}

			if(this.property('image_status') !== 'ok') {
				var starting = this.$('.upfront-image-starting-select');
				if(!this.elementSize.height){
					this.setElementSize();
					starting.height(this.elementSize.height);
				}
				return;
			}


			if (this.property('quick_swap')) { // Do not show image controls for swappable images.
				return false;
			}

			setTimeout(function() {
				me.updateControls(elementSize.width, elementSize.height);
				me.$el.removeClass('upfront-editing');

				me.editCaption();
			}, 300);

			// Show full image if we are in mobile mode
			if (this.mobileMode) {
				this.$('.uimage').addClass('uimage-mobile-mode');
				this.setMobileMode();
			}

			this.setStuckToTop();

			setTimeout( function() {
				me.$el.closest('.ui-draggable').on('dragstop', function() {
					setTimeout(function() {
						me.setStuckToTop();
					}, 10);
				});

				me.$el.closest('.upfront-module-view').addClass('uimage-upfront-module-view');
			}, 100);

			setTimeout(function() {
				me.toggleResizableHandles();
			}, 100);
		},

		toggleResizableHandles: function() {
			var container = this.$el.parents('.upfront-objects_container');
			if (this.isThemeImage() && !Upfront.themeExporter) {
				container.siblings('.ui-resizable-handle').addClass('ui-resizable-handle-hidden');
			} else {
				container.siblings('.ui-resizable-handle').removeClass('ui-resizable-handle-hidden');
			}
		},

		setStuckToTop: function() {
			if (this.$el.offset().top + this.parent_module_view.$el.offset().top < 25) {
				this.$el.addClass('stuck-to-top');
			} else {
				this.$el.removeClass('stuck-to-top');
			}
		},

		updateControls: function(width, height) {
			var imageControlsTpl = '<div class="uimage-controls image-element-controls upfront-ui"></div>';

			this.controls = this.createControls();

			if (this.controls === false) {
				return;
			}

			this.controls.setWidth({
				width: width,
				height:height
			});
			this.controls.render();

			if (this.parent_module_view.$('.upfront-module').find('.uimage-controls').length === 0) {
				this.parent_module_view.$('.upfront-module').append(imageControlsTpl);
			}
			this.parent_module_view.$('.upfront-module').find('.uimage-controls').html('').append(this.controls.$el);
			this.controls.delegateEvents();
		},

		on_edit: function(){
			return false;
		},

		extract_properties: function() {
			var props = {};
			this.model.get('properties').each(function(prop){
				props[prop.get('name')] = prop.get('value');
			});
			return props;
		},

		handleDragEnter: function(){
			var me = this;
			// todo Sam: re-enable this and start bug fixing
			return; // disabled for now
			if(!this.$('.uimage-drop-hint').length){
				var dropOverlay = $('<div class="uimage-drop-hint"><div>' + l10n.drop_image + '</div></div>')
					.on('drop', function(e){
						e.preventDefault();
						e.stopPropagation();
						me.openImageSelector();
						$('.uimage-drop-hint').remove();
						if(e.originalEvent.dataTransfer){
							var files = e.originalEvent.dataTransfer.files;
							// Only call the handler if 1 or more files was dropped.
							if (files.length){
								Upfront.Views.Editor.ImageSelector.uploadImage(files);
										}
								}
					})
					.on('dragenter', function(e){
						e.preventDefault();
						e.stopPropagation();
						$(this).addClass('uimage-dragenter');
					})
					.on('dragleave', function(e){
						e.preventDefault();
						e.stopPropagation();
						$(this).removeClass('uimage-dragenter');
						$(this).removeClass('uimage-drageover');
					}).on('dragover', function (e) {
											e.preventDefault();
											$(this).addClass('uimage-drageover');
									})
				;
				this.$('.upfront-image').append(dropOverlay);
			}
			if(this.dragTimer){
				clearTimeout(this.dragTimer);
				this.dragTimer = false;
			}
		},

		handleDragLeave: function(){
			var me = this;
			this.dragTimer = setTimeout(function(){
					me.$('.uimage-drop-hint').remove();
					this.dragTimer = false;
				}, 200)
			;
		},

		setMobileMode: function(){
			this.mobileMode = true;
			this.$el
				.find('.uimage-resize-hint').hide().end()
				.find('.uimage').css('min-height', 'none')
				.find('.upfront-image-caption-container').css('width', '100%').end()
				.find('.upfront-image-container').css('width', '100%').css('height', 'auto').end()
				.find('img')
					.css({
						position: 'static',
						width: '100%',
						height: 'auto'
					})
					.attr('src', this.property('src'))
			;
		},

		unsetMobileMode: function(){
			this.mobileMode = false;
			if(this.parent_module_view){
				this.render();
			}
		},

		/***************************************************************************/
		/*           Handling element resize events (jQuery resizeable)            */
		/***************************************************************************/
		onElementResizeStart: function() {
			if(this.mobileMode) {
				return;
			}

			var starting = this.$('.upfront-image-starting-select'); // Add image panel

			if(this.property('caption_position') !== 'below_image') {
				this.$('.wp-caption').fadeOut('fast');
			}

			// Store variables used in resize event handlers
			resizingData = {
				starting: starting,
				data: {
					position: this.property('position'),
					size: this.property('size'),
					stretch: this.property('stretch'),
					vstretch: this.property('vstretch')
				},
				img: this.$('img'),
				setTextHeight: this.property('caption_position') === 'below_image'
			};

			if(this.cropTimer) {
				clearTimeout(this.cropTimer);
				this.cropTimer = false;
			}

			if(starting.length) {
				return;
			}

			//let's get rid of the image-caption-container to proper resizing
			this.$('.upfront-image-caption-container, .upfront-image-container').css({
				width: '100%',
				height: '100%',
				marginTop: 0
			});
			this.$('.uimage').css('min-height', 'auto');
		},

		onElementResizing: function() {
			if(this.mobileMode) {
				return;
			}

			var starting = resizingData.starting,
				resizer = resizingData.resizer,
				data = resizingData.data,
				img = resizingData.img,
				captionHeight = this.property('caption_position') === 'below_image' ? this.$('.wp-caption').outerHeight() : 0,
				ratio;

			if(!resizer){
				resizer = $('html').find('.upfront-resize');
				resizingData.resizer = resizer;
			}
			data.elementSize = {width: resizer.width() - (2 * breakpointColumnPadding), height: resizer.height() - (2 * breakpointColumnPadding) - captionHeight};

			this.$el.find('.uimage-resize-hint').html(this.sizehintTpl({
					width: data.elementSize.width,
					height: data.elementSize.height,
					l10n: l10n.template
				})
			);

			if(starting.length){
				return starting.outerHeight(data.elementSize.height);
			}

			//Wonderful stuff from here down
			this.$('.uimage').css('height', data.elementSize.height);

			//Resizing the stretching dimension has priority, the other dimension just alter position
			if(data.stretch && !data.vstretch){
				this.resizingH(img, data, true);
				this.resizingV(img, data);
			} else if(!data.stretch && data.vstretch){
				this.resizingV(img, data, true);
				this.resizingH(img, data);
			} else {
				//Both stretching or not stretching, calculate ratio difference
				ratio = data.size.width / data.size.height - data.elementSize.width / data.elementSize.height;

				//Depending on the difference of ratio, the resizing is made horizontally or vertically
				if(ratio > 0 && data.stretch || ratio < 0 && ! data.stretch){
					this.resizingV(img, data, true);
					this.resizingH(img, data);
				}
				else {
					this.resizingH(img, data, true);
					this.resizingV(img, data);
				}
			}

			this.updateControls(data.elementSize.width, data.elementSize.height);
			this.setupBySize();
		},

		onElementResizeStop: function() {
			if(this.mobileMode) {
				return;
			}

			var starting = resizingData.starting,
				me = this,
				img = resizingData.img,
				imgSize = {width: img.width(), height: img.height()},
				imgPosition = img.position();

			if(starting.length){
				this.elementSize = {
					height: $('.upfront-resize').height() - (2 * breakpointColumnPadding),
					width: $('.upfront-resize').width() - (2 * breakpointColumnPadding)
				};
				this.property('element_size', this.elementSize);
				return;
			} else if (this.property('quick_swap')) {
				return;
			}

			// Save resizing, be sure we have the good dimensions
			this.onElementResizing();

			// Change the sign
			imgPosition.top = -imgPosition.top;
			imgPosition.left = -imgPosition.left;

			this.temporaryProps = {
				size: imgSize,
				position: imgPosition
			};

			this.property('element_size', resizingData.data.elementSize);

			this.cropTimer = setTimeout(function(){
				me.saveTemporaryResizing();
			}, this.cropTimeAfterResize);

			resizingData = {};
			this.showCaption();
		},

		showCaption: function() {
			this.$('.wp-caption').fadeIn('fast');
		},

		resizingH: function(img, data, size) {
			var elWidth = data.elementSize.width,
				width = size ? data.size.width : img.width(), // The width has been modified if we don't need to set the size
				left = data.position.left,
				css = {},
				align;

			if(data.stretch) {
				if(elWidth < width - left) {
					css.left = -left;
					if(size) {
						css.width = width;
					}
				} else if(width > elWidth && elWidth >= width - left) {
					css.left = elWidth - width;
					if(size) {
						css.width = width;
					}
				} else {
					css.left = 0;
					if(size) {
						css.width = elWidth;
					}
				}
				if(size) {
					css.height = 'auto';
				}
				img.css(css);
				return;
			}

			if(elWidth > width) {
				align = this.property('align');
				if(align === 'left') {
					css.left = 0;
				} else if(align === 'center') {
					css.left = (elWidth - width) / 2;
				} else {
					css.left = 'auto';
					css.right = 0;
				}
				if(size) {
					css.width = width;
					css.height = 'auto';
				}
				img.css(css);
				return;
			}

			css.left = 0;
			if(size) {
				css.width = elWidth;
				css.height = 'auto';
			}
			img.css(css);
		},

		resizingV: function(img, data, size) {
			var elHeight = data.elementSize.height,
				height = size ? data.size.height : img.height(),
				top = data.position.top,
				css = {};

			if(data.vstretch) {
				if(elHeight < height - top) {
					css.top = -top;
					if(size) {
						css.height = height;
					}
				} else if(height > elHeight && elHeight >= height - top){
					css.top = elHeight - height;
					if(size) {
						css.height = height;
					}
				} else{
					css.top = 0;
					if(size) {
						css.height = elHeight;
					}
				}
				if(size) {
					css.width = 'auto';
				}
				img.css(css);
				return;
			}

			if(elHeight > height - top) {
				css.top = -top;
				if(size) {
					css.height = height;
				}
			} else if(height - top >= elHeight && elHeight > height){
				css.top = elHeight - height;
				if(size) {
					css.height = height;
				}
			} else {
				css.top = 0;
				if(size) {
					css.height = elHeight;
				}
			}

			if(size) {
				css.width = 'auto';
			}
			img.css(css);
		},
		/***************************************************************************/
		/*       End Handling element resize events (jQuery resizeable)            */
		/***************************************************************************/

		saveTemporaryResizing: function() {
			var me = this,
				elementSize = me.property('element_size'),
				crop = {},
				imageId = me.property('image_id'),
				resize = me.temporaryProps.size,
				position = me.temporaryProps.position
			;


			crop.top = position.top;
			crop.left = position.left;

			crop.width = Math.min(elementSize.width, resize.width);
			crop.height = Math.min(elementSize.height, resize.height);

			var promise = Upfront.Views.Editor.ImageEditor.saveImageEdition(
				imageId,
				me.property('rotation'),
				resize,
				crop
			).done(function(results){
				var imageData = results.data.images[imageId];

				if(imageData.error){
					Upfront.Views.Editor.notify('Image failed to process.', 'error');
					return;
				}

				me.property('size', resize);
				me.property('position', position);
				me.property('src', imageData.url);
				me.property('srcFull', imageData.urlOriginal, false);
				me.property('stretch', resize.width >= elementSize.width);
				me.property('vstretch', resize.height >= elementSize.height);
				me.property('gifImage', imageData.gif);
				clearTimeout(me.cropTimer);
				me.cropTimer = false;
			});

			return promise;
		},

		saveResizing: function() {
			var me = this;
			if(this.cropTimer){
				clearTimeout(this.cropTimer);
				this.cropTimer = false;

				this.saveTemporaryResizing().done(function(){
					var saveData = {
						element: JSON.stringify(Upfront.Util.model_to_json(me.model)),
						action: 'upfront_update_layout_element'
					};
					Upfront.Util.post(saveData);
				});
			}
		},

		setElementSize: function(ui) {
			var me = this,
				parent = this.parent_module_view.$('.upfront-editable_entity:first'),
				resizer = ui ? $('.upfront-resize') : parent
			;

			me.elementSize = {
				width: resizer.width() - (2 * breakpointColumnPadding) + 2,
				height: resizer.height() - (2 * breakpointColumnPadding)
			};

			if(this.property('caption_position') === 'below_image') {
				this.elementSize.height -= parent.find('.wp-caption').outerHeight();
			}

			if(this.property('image_status') === 'starting') {
				this.$('.upfront-object-content').height(me.elementSize.height);
			}

		},

		openImageSelector: function(e){
			var me = this;
			if(e) {
				e.preventDefault();
			}
			Upfront.Views.Editor.ImageSelector.open().done(function(images){
				var sizes = {};
				_.each(images, function(image, id){
					sizes = image;
					me.imageId = id;
				});

				var	imageInfo = {
						src: sizes.medium ? sizes.medium[0] : sizes.full[0],
						srcFull: sizes.full[0],
						srcOriginal: sizes.full[0],
						fullSize: {width: sizes.full[1], height: sizes.full[2]},
						size: sizes.medium ? {width: sizes.medium[1], height: sizes.medium[2]} : {width: sizes.full[1], height: sizes.full[2]},
						position: false,
						rotation: 0,
						id: me.imageId
					}
				;
				$('<img>').attr('src', imageInfo.srcFull).load(function(){
					Upfront.Views.Editor.ImageSelector.close();
					me.openEditor(true, imageInfo);
				});
			});
		},

		handleEditorResult: function(result){
			this.property('image_status', 'ok', true);
			this.property('has_settings', 1);
			this.property('src', result.src, true);
			this.property('srcFull', result.srcFull, true);
			this.property('srcOriginal', result.srcOriginal, true);
			this.property('size', result.imageSize, true);
			this.property('position', result.imageOffset, true);
			var marginTop = result.mode === 'horizontal' || result.mode === 'small' ? result.imageOffset.top * -1 : 0;
			this.property('marginTop', marginTop, true);
			this.property('rotation', result.rotation, true);
			this.property('fullSize', result.fullSize, true);

			this.property('element_size', result.maskSize, true);

			this.property('align', result.align, true);
			this.property('stretch', result.stretch, true);
			this.property('vstretch', result.vstretch, true);
			this.property('quick_swap', false, true);
			if(result.imageId) {
				this.property('image_id', result.imageId, true);
			}

			this.property('gifImage', result.gif);


			if(result.elementSize){
				this.set_element_size(result.elementSize.columns, result.elementSize.rows, 'all', true);
			}

			this.temporaryProps = false;
			this.render();
		},

		editRequest: function () {
			if(this.property('image_status') === 'ok' && this.property('image_id')) {
				return this.openEditor();
			}

			Upfront.Views.Editor.notify(l10n.external_nag, 'error');
		},

		getElementColumns: function(){
			var module = this.$el.closest('.upfront-module'),
				classes,
				found = false
			;

			if(!module.length) {
				return -1;
			}

			classes = module.attr('class').split(' ');

			_.each(classes, function(c){
				if(c.match(/^c\d+$/)) {
					found = c.replace('c', '');
				}
			});
			return found || -1;
		},

		openEditor: function(newImage, imageInfo){
			if(Upfront.Application.responsiveMode !== 'desktop') {
				return Upfront.Views.Editor.notify(l10n.desktop_nag, 'error');
			}

			var me = this,
				options = {
					setImageSize: newImage,
					saveOnClose: newImage,
					editElement: this
				}
			;

			this.setElementSize();
			this.setImageInfo();

			if(imageInfo) {
				_.extend(options, this.imageInfo, imageInfo);
			} else {
				_.extend(options, this.imageInfo);
			}

			if(this.cropTimer){
				this.stoppedTimer = true;
				clearTimeout(this.cropTimer);
				this.cropTimer = false;
			}

			options.element_id = me.model.get_property_value_by_name('element_id');

			Upfront.Views.Editor.ImageEditor.open(options)
				.done(function(result){
					me.handleEditorResult(result);
					this.stoppedTimer = false;
				})
				.fail(function(data){
					if(data && data.reason === 'changeImage') {
						me.openImageSelector();
					} else if(me.stoppedTimer) {
						me.saveTemporaryResizing();
						me.stoppedTimer = false;
					}
				})
			;
		},

		openLightboxRegion: function(e){
			if(e) {
				e.preventDefault();
			}

			var link = e.currentTarget,
				href = link.href.split('#')
			;

			if(href.length !== 2) {
				return;
			}

			Upfront.Application.LayoutEditor.openLightboxRegion(href[1]);
		},

		cleanup: function(){
			//the default images on a new theme installation do not have controlls created, so putting a check here.
			if(this.controls)
				this.controls.remove();
			// if(this.bodyEventHandlers){
			// 	_.each(this.bodyEventHandlers, function(f, ev){
			// 		$('body').off(ev, f);
			// 	});
			// }
		},

		property: function(name, value, silent) {
			if(typeof value !== 'undefined'){
				if(typeof silent === 'undefined') {
					silent = true;
				}
				return this.model.set_property(name, value, silent);
			}
			return this.model.get_property_value_by_name(name);
		}
	});

	Upfront.Application.LayoutEditor.add_object('Uimage', {
		'Model': UimageModel,
		'View': UimageView,
		'Element': ImageElement,
		'Settings': ImageSettings,
		'ContextMenu': ImageContextMenu,
		cssSelectors: {
			'.upfront-image': {label: l10n.css.image_label, info: l10n.css.image_info},
			'.wp-caption': {label: l10n.css.caption_label, info: l10n.css.caption_info},
			'.upfront-image-container': {label: l10n.css.wrapper_label, info: l10n.css.wrapper_info}
		},
		cssSelectorsId: Upfront.data.uimage.defaults.type
	});

	Upfront.Views.Editor.ImageEditor = new ImageEditor();
	Upfront.Views.Editor.ImageSelector = new ImageSelector();
	Upfront.Models.UimageModel = UimageModel;
	Upfront.Views.UimageView = UimageView;

});
})(jQuery);
