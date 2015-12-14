;(function($){define(["upfront/post-editor/upfront-post-edit"], function(Edit){

// Replaces the tags in the templates
var PartMarkupCreator = function(){
	this.parts = {
		title: {replacements: ['%title%', '%permalink%'], editable:['%title%']},
		contents: {replacements: ['%contents%', '%excerpt%'], editable:['%contents%', '%excerpt%']},
		excerpt: {replacements: ['%excerpt%'], editable:['%excerpt%']}, 
		author: {replacements: ['%author%', '%author_url%', '%author_meta%'], editable:['%author%'], withParameters: ['%author_meta_', '%avatar_']},
		categories: {replacements: ['%categories%'], editable:[]},
		tags: {replacements: ['%tags%'], editable:[]},
		comments_count: {replacements: ['%comments_count%'], editable:[]},
		featured_image: {replacements: ['%image%', '%permalink%'], editable:['%image%']},
		date: {replacements: ['%date%', '%date_iso%'], editable:['%date%']},
		update: {replacements: ['%update%', '%date_iso%'], editable:['%update%']},
		author_gravatar: {replacements: ['%avatar_%'], editable:['%avatar%'], withParameters: ['%avatar_']}
	};

	this.markup = function(part, partContents, template, partOptions){
		var me = this,
		extraClasses = partOptions && partOptions.extraClasses ? partOptions.extraClasses : '',
		attributes = partOptions && partOptions.attributes ? partOptions.attributes : {},
		attrs = ''
		;

		_.each(attributes, function(value, key){
			attrs += key +'="' + value + '" ';
		});

		if (this.parts[part] && this.parts[part].replacements) {
			_.each(this.parts[part].replacements, function(tag){
				var markup = partContents[tag];
				if(me.parts[part].editable.indexOf(tag) !== -1){
					markup = '<div class="upfront-content-marker upfront-content-marker-' + part + ' ' + extraClasses + '" ' + attrs + '>' + markup + '</div>';
				}
				template = template.replace(tag, markup);
			});
		}

		if (this.parts[part] && this.parts[part].withParameters) {
			var withParameters = this.parts[part].withParameters;
			if(withParameters){
				_.each(withParameters, function(replacement){
					var regexp = new RegExp(replacement + "[^%]+%", 'gm'),
					tags = regexp.exec(template)
					;

					_.each(tags, function(tag){
						template = typeof partContents[tag] == 'undefined' ? '' : template.replace(tag, partContents[tag]);
					});
				});
			}
		}
		return template;
	};
};
var markupper = new PartMarkupCreator();

var PostContentEditor = Backbone.View.extend({
	events: {
		'click a': 'preventLinkNavigation',
		'click .upfront-content-marker-author' : 'editAuthor',
		'click .upfront-content-marker-date' : 'editDate',
		'click .upost_thumbnail_changer': 'editThumb',
		//'click .upfront-postpart-tags': 'editTags',
		//'click .upfront-postpart-categories': 'editCategories',
		'click .ueditor-action-pickercancel': 'editDateCancel',
		'click .ueditor-action-pickerok': 'editDateOk'
	},

	initialize: function(opts){
		this.post = opts.post;
		this.postView = opts.postView;
		this.triggeredBy = opts.triggeredBy || this.$('.upfront-content-marker').first();

		this.parts = {};
		this.partOptions = opts.partOptions;

		this.postAuthor = this.post.get('post_author');
		this.authorTpl = opts.authorTpl;

		this.contentMode = opts.content_mode;

		this.inserts = this.post.meta.getValue('_inserts_data') || {};

		this.$el.addClass('clearfix').css('padding-bottom', '60px');

		this.rawContent = opts.rawContent;
		this.rawExcerpt = opts.rawExcerpt;

		// prevent link navigation
		this.$('a').data('bypass', true);

		//Prevent dragging from editable areas
		var draggable = this.$el.closest('.ui-draggable');
		if(draggable.length)
			cancel = draggable.draggable('disable');

        this.$el.closest(".upfront-module-view").append("<div class='editing-overlay'></div>");
        this.$el.closest(".upfront-module").addClass("editing-content");
        $(".upfront-module").not(".editing-content").addClass("fadedOut").fadeTo( "slow" , 0.3 );
        $(".change_feature_image").addClass("ueditor-display-block");
		this.prepareEditableRegions();
		this.prepareBox();
	},
    title_blurred: function(){
        if( this.post.is_new && !this.box.urlEditor.hasDefinedSlug && !_.isEmpty(this.parts.titles.html()) ){
            this.post.set("post_name",  this.parts.titles.html().toLowerCase().replace(/\ /g,'-'));
            this.box.urlEditor.render();
        }
    },
	prepareEditableRegions: function(){
		var me = this;
		//Title
		this.parts.titles = this.$('.upfront-content-marker-title');

		if(this.parts.titles.length){
			var parent = this.parts.titles.parent();
			if (parent.is("a")) {
				parent.replaceWith(this.parts.titles);
			}
			this.onTitleEdited = _.bind(this.titleEdited, this);

			this.parts.titles
				.attr('contenteditable', true)
                .off("blur")
                .on("blur", _.bind(me.title_blurred, me) )
				/*.on('keyup', this.onTitleEdited)
				.on('keydown', function(e){
					if(e.which != 9) //TAB
						return;

					e.preventDefault();
					me.focus(me.$('.upfront-content-marker-contents'), true);
				})*/
			;
		}

		//Content
		this.parts.contents = this.$('.upfront-content-marker-contents');
		if(this.parts.contents.length){
			var isExcerpt = this.contentMode == 'post_excerpt',
			content = isExcerpt ? this.rawExcerpt: this.rawContent,
			editorOptions = isExcerpt ? this.getExcerptEditorOptions() : this.getContentEditorOptions()
			;
			this.onContentsEdited = _.bind(this.contentEdited, this);
			this.editors = [];
			this.parts.contents.html(content).ueditor(editorOptions);
			this.parts.contents.on('keyup', this.onContentsEdited);

			this.parts.contents.each(function(){
				me.editors.push($(this).data('ueditor'));
			});
			//There may be more than one editor, store the last one edited
			this.currentContent = this.parts.contents[0];
		}

		//Author
		this.parts.authors = this.$('.upfront-content-marker-author');
		if(this.parts.authors.length){
			var me = this,
			authors = Upfront.data.ueditor.authors,
			options = []
			;

			_.each(authors, function(a){
				options.push({value: a.ID, name: a.display_name});
			});

			this.authorSelect = new MicroSelect({options: options});
			this.authorSelect.on('select', function(authorId){
				me.changeAuthor(authorId);
			});

			this.$el.append(this.authorSelect.$el);
		}


        //Author Gravatar
        this.parts.author_gravatars = this.$('.upfront-content-marker-author-gravatar');
        if(this.parts.authors.length){
            var me = this,
                authors = Upfront.data.ueditor.authors,
                options = []
                ;

            _.each(authors, function(a){
                options.push({value: a.ID, name: a.display_name});
            });

            this.authorSelect = new MicroSelect({options: options});
            this.authorSelect.on('select', function(authorId){
                me.changeAuthor(authorId);
            });

            this.$el.append(this.authorSelect.$el);
        }
		//Date
		this.parts.dates = this.$('.upfront-content-marker-date');
		if(this.parts.dates.length){
			var me = this,
				datepickerData = {},
				options = [],
				date = this.post.get("post_date"),
				dateFormat = this.getDateFormat()
				 //dateFormatUI = Upfront.Util.date.php_format_to_jquery( this.partOptions.date && this.partOptions.date.format ? this.partOptions.date.format : Upfront.data.date.format )
			;

			datepickerData.minutes = _.range(0,60);
			datepickerData.hours = _.range(0,24);

			datepickerData.currentHour = date.getHours();
			datepickerData.currentMinute = date.getHours();

			this.datepickerTpl = _.template($(Upfront.data.tpls.popup).find('#datepicker-tpl').html());
			this.$el.prepend(this.datepickerTpl(datepickerData));

			this.datepicker = this.$('.upfront-bar-datepicker');

			this.datepicker.datepicker({
				changeMonth: true,
				changeYear: true,
				dateFormat: dateFormat,
				onChangeMonthYear: function(year, month, inst){
					var day = inst.selectedDay,
						prev_date = new Date(  me.parts.dates.text()  ),
						d = new Date ( year, month - 1, day, prev_date.getHours(), prev_date.getMinutes() )
					;

					me.parts.dates.html($.datepicker.formatDate(dateFormat, d));

					me.post.set("post_date", d);
					me.datepicker.datepicker("setDate", d);
				},
				onSelect : function(dateText){
					me.parts.dates.html(dateText);
				}
			});
		}

		//Featured image
		this.parts.featured = this.$('.upfront-content-marker-featured_image');
		if(this.parts.featured.length){
			var thumbId = this.post.meta.getValue('_thumbnail_id'),
			height = this.partOptions.featured_image && this.partOptions.featured_image.height ? this.partOptions.featured_image.height : 60
			;

			this.parts.featured.addClass('ueditor_thumb ueditable')
				.css({position:'relative', 'min-height': height + 'px', width: '100%'})
				.append('<div class="upost_thumbnail_changer" ><div>' + Upfront.Settings.l10n.global.content.trigger_edit_featured_image + '</div></div>')
				.find('img').css({'z-index': '2', position: 'relative'})
			;
		}


		//Taxonomies
		this.parts.tags = this.$('.upfront-postpart-tags');
		this.parts.categories = this.$('.upfront-postpart-categories');

		setTimeout(function(){
			if (me.triggeredBy.length) me.focus(me.triggeredBy, true);
		}, 200);
	},

	getExcerptEditorOptions: function(){
		return {
			linebreaks: false,
			autostart: true,
			focus: false,
			pastePlainText: true,
			inserts: [],
			airButtons: ['bold', 'italic']
		};
	},

	getContentEditorOptions: function(){
		return {
			linebreaks: false,
            replaceDivs: false,
			autostart: true,
			focus: false,
			inserts: ["postImage", "embed"],
			insertsData: this.inserts,
			pastePlainText: false
		};
	},

	editThumb: function(e){
		e.preventDefault();
		var me = this,
		target = $(e.target),
		postId = this.postId,
		img = target.parent().find('img'),
		loading = new Upfront.Views.Editor.Loading({
			loading: Upfront.Settings.l10n.global.content.starting_img_editor,
			done: Upfront.Settings.l10n.global.content.here_we_are,
			fixed: false
		}),
		imageId = this.post.meta.getValue('_thumbnail_id'),
		full_image = this.postView.property('full_featured_image')
		;

		if(!imageId || full_image == '1')
			return me.openImageSelector();

		loading.render();
		target.parent().append(loading.$el);
		me.getImageInfo(me.post).done(function(imageInfo){
			loading.$el.remove();
			me.openImageEditor(false, imageInfo, me.post.id);
		});
	},

	getImageInfo: function(post){
		var me = this,
		imageData = post.meta.get('_thumbnail_data'),
		imageId = post.meta.get('_thumbnail_id'),
		deferred = $.Deferred(),
		$img = this.$('.ueditor_thumb').find('img')
		;

		if(!imageData || !_.isObject(imageData.get('meta_value')) || imageData.get('meta_value').imageId != imageId.get('meta_value')){
			if(!imageId)
				return false;
			Upfront.Views.Editor.ImageEditor.getImageData([imageId.get('meta_value')]).done(function(response){
				var images = response.data.images,
				sizes = {},
				imageId = 0
				;
				_.each(images, function(image, id){
					sizes = image;
					imageId = id;
				});

				deferred.resolve({
					src: sizes.medium ? sizes.medium[0] : sizes.full[0],
					srcFull: sizes.full[0],
					srcOriginal: sizes.full[0],
					fullSize: {width: sizes.full[1], height: sizes.full[2]},
					size: {width: $img.width(), height: $img.height()},
					position: {top: 0, left: 0},
					rotation: 0,
					id: imageId
				});
			});
		}
		else {
			var data = imageData.get('meta_value'),
			factor = $img.width() / data.cropSize.width
			;
			deferred.resolve({
				src: data.src,
				srcFull: data.srcFull,
				srcOriginal: data.srcOriginal,
				fullSize: data.fullSize,
				size: {width: data.imageSize.width * factor, height: data.imageSize.height * factor},//data.imageSize,
				position: {top: data.imageOffset.top * factor, left: data.imageOffset.left * factor},//data.imageOffset,
				rotation: data.rotation,
				id: data.imageId
			});
		}
		return deferred.promise();
	},

	openImageSelector: function(postId){
		var me = this,
			full_image = this.postView.property('full_featured_image');
		Upfront.Views.Editor.ImageSelector.open().done(function(images){
			var sizes = {},
			imageId = 0
			;
			_.each(images, function(image, id){
				sizes = image;
				imageId = id;
			});
			var imageInfo = {
				src: sizes.medium ? sizes.medium[0] : sizes.full[0],
				srcFull: sizes.full[0],
				srcOriginal: sizes.full[0],
				fullSize: {width: sizes.full[1], height: sizes.full[2]},
				size: sizes.medium ? {width: sizes.medium[1], height: sizes.medium[2]} : {width: sizes.full[1], height: sizes.full[2]},
				position: false,
				rotation: 0,
				id: imageId
			}
			;
			$('<img>').attr('src', imageInfo.srcFull).load(function(){
				Upfront.Views.Editor.ImageSelector.close();
				if ( full_image == '1' ){
					var img = me.$('.ueditor_thumb img'),
						newimg = $('<img style="z-index:2;position:relative">');
					me.post.meta.add([
						{meta_key: '_thumbnail_id', meta_value: imageId},
						{meta_key: '_thumbnail_data', meta_value: ''}
						], {merge: true});
					if (!img.length)
						img = newimg.appendTo(me.$('.ueditor_thumb'));
					else{
						img.replaceWith(newimg);
						img = newimg;
					}
					img.attr('src', imageInfo.srcFull);
					return;
				}
				me.openImageEditor(true, imageInfo, postId);
			});
		});
	},

	openImageEditor: function(newImage, imageInfo, postId){
		var me = this,
		mask = this.$('.ueditor_thumb'),
		height = this.partOptions.featured_image && this.partOptions.featured_image.height ? this.partOptions.featured_image.height : 60
		editorOptions = _.extend({}, imageInfo, {
			element_id: 'post_' + postId,
			maskOffset: mask.offset(),
			maskSize: {width: mask.width(), height: height},
			setImageSize: newImage,
			extraButtons: [
			{
				id: 'image-edit-button-swap',
				text: Upfront.Settings.l10n.global.content.swap_image,
				callback: function(e, editor){
					editor.cancel();
					me.openImageSelector(postId);
				}
			}
			]
		})
		;

		Upfront.Views.Editor.ImageEditor.open(editorOptions).done(function(imageData){
			var post = me.post,
			img = mask.find('img'),
			newimg = $('<img style="z-index:2;position:relative">')
			;

			me.post.meta.add([
				{meta_key: '_thumbnail_id', meta_value: imageData.imageId},
				{meta_key: '_thumbnail_data', meta_value: imageData}
				], {merge: true});
			//post.meta.save();
			if(!img.length)
				img = newimg.appendTo(mask);
			else{
				img.replaceWith(newimg);
				img = newimg;
			}

			img.attr('src', imageData.src);
		});
	},

	focus: function(el, selectAll){
		var marker = 'upfront-content-marker-';
		if(typeof el.length == 'undefined')
			el = $(el);

		if(el.hasClass(marker + 'title') || el.hasClass(marker + 'contents')){
			el.get(0).focus();
			this.setSelection(el[0], selectAll);
		}
	},

	changeAuthor: function(authorId){
		var me = this,
			authorData = me.getAuthorData(authorId)
		;

		this.$('.upfront-content-marker-author').html(authorData.display_name);
		this.postAuthor = authorId;
	},

	editAuthor: function(e) {
		e.preventDefault();
		var target = $(e.target);

		this.authorSelect.open();

		this.authorSelect.$el.css({
			top: e.offsetY + 50,
			left: e.offsetX + target.width(),
			display: 'block'
		});
	},

	editDate: function(e) {
		e.preventDefault();
		var $target = $(e.target);
		if(this.datepicker.is(':visible')){
			// just update datepicker position
			this.datepicker.offset({
				top : $target.offset().top + 30,
				left : $target.offset().left + $target.width()
			});
		}

		var date = this.selectedDate || this.post.get('post_date');

	  /**
		* Show date picker
		*/
		this.datepicker.parent()
			.show()
			.offset({
				top : $target.offset().top + 30,
				left : $target.offset().left + $target.width()
			})
		;

		if(date){
			/**
			* update date in the date picker and the time picker
			*/

			var hours = date.getHours(),
				minutes = date.getMinutes()
			;
			this.datepicker.datepicker('setDate', date);

			this.$('.ueditor-hours-select').val(hours);
			this.$('.ueditor-minutes-select').val(minutes);
		}
	},

	getDateFormat: function(){
		return Upfront.Util.date.php_format_to_js(this.partOptions.date && this.partOptions.date.format ? this.partOptions.date.format : Upfront.data.date.format);
	},

	updateDateParts: function(date){
		this.parts.dates.html($.datepicker.formatDate(this.getDateFormat(), date));
	},

	editDateCancel : function(){
		// User has cancelled the date edition, restore previous date.
		this.updateDateParts(this.selectedDate || this.post.get('post_date'));
		this.$('.upfront-date_picker').hide();
	},

	editDateOk: function(){
		var chosen_date = this.datepicker.datepicker('getDate'),
			parent = this.datepicker.parent(),
			hours = parent.find(".ueditor-hours-select").val(),
			minutes = parent.find(".ueditor-minutes-select").val()
		;
		chosen_date.setHours( hours );
		chosen_date.setMinutes( minutes );

		this.dateOk(chosen_date);
		this.$('.upfront-date_picker').hide();
	},

	dateOk: function(date){
		this.selectedDate = date;
	},

	updateDateFromBar: function(date){
		this.updateDateParts(date);
		this.dateOk(date);
	},

	editTags: function(e){
		this.box.editTaxonomies(e, 'post_tag');
	},

	editCategories: function(e){
		this.box.editTaxonomies(e, 'category');
	},

	getAuthorData: function(authorId){
		var i = -1,
		found = false,
		authors = Upfront.data.ueditor.authors
		;

		while(++i < authors.length && !found){
			if(authors[i].ID == authorId)
				found = authors[i];
		}

		return found;
	},

	updateStatus: function(status){
		this.postStatus = status;
	},

	updateVisibility: function(visibility, password){
		this.postVisibility = visibility;
		this.postPassword = password;
	},

	// Thanks to http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity/3866442#3866442
	setSelection: function(el, selectAll) {
		var range,selection;
		if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
		{
			range = document.createRange();//Create a range (a range is a like the selection but invisible)
			range.selectNodeContents(el);//Select the entire contents of the element with the range
			if(!selectAll)
				range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
			selection = window.getSelection();//get the selection object (allows you to change selection)
			selection.removeAllRanges();//remove any selections already made
			selection.addRange(range);//make the range you have just created the visible selection
		}
		else if(document.selection)//IE 8 and lower
		{
			range = document.body.createTextRange();//Create a range
			range.moveToElementText(el);//Select the entire contents of the element with the range
			if(!selectall)
			range.collapse(false);//collapse the range to the end point.
			range.select();//Select the range (make it the visible selection)
		}
	},

	titleEdited: function(e){
		var content = e.target.innerHTML;
		this.parts.titles.each(function(){
			if(this != e.target)
				this.innerHTML = content;
		});
	},

	contentEdited: function(e){
		var contents = e.currentTarget.innerHTML;
		this.parts.contents.each(function(){
			if(this != e.currentTarget)
				$(this).redactor('set', contents, false);
		});

		this.currentContent = e.currentTarget;
	},

	prepareBox: function(){
        var self = this;
		if(this.box) return;
		this.box = new Edit.Box({post: this.post});
		this.bindBarEvents();
		this.box.render();
        this.$el.append(this.box.$el);
        _.delay(  _.bind(this.box.setPosition, this.box), 10 );
        this.box.toggleRegionClass(true);
		return this;
	},

	bindBarEvents: function(){
		var me = this,
			events = ['cancel', 'publish', 'draft', 'trash', 'auto-draft']
		;
		_.each(events, function(e){
			me.listenTo(me.box, e, function(){
				var results = {};
				if(e=='publish' || e=='draft' || e=='auto-draft'){
					//if(me.parts.titles) results.title = $.trim(me.parts.titles.html());
					if(me.parts.titles) results.title = $.trim(me.parts.titles.text());
					if(me.currentContent){
						var editor = $(me.currentContent).data('ueditor');

                        // cleanup inserts markup
                        me.$el.find(".upfront-inline-panel").remove();
                        me.$el.find(".ueditor-insert-remove").remove();

						results.content = $.trim( editor.getValue() );
						results.content = results.content.replace(/(\n)*?<br\s*\/?>\n*/g, "<br/>");
						results.inserts = editor.getInsertsData();
						results.author = me.postAuthor;
					}
					if(me.selectedDate)
						results.date = me.selectedDate;
					if(me.postStatus)
						results.status = me.postStatus;
					if(me.postVisibility)
						results.visibility = me.postVisibility;
					if(me.postPassword)
						results.pass = me.postPassword;
				}
				me.trigger(e, results);
			});
		});


		this
			.listenTo(me.box.scheduleSection, 'date:updated', me.updateDateFromBar)
			//.listenTo(me.box.scheduleSection, 'date:cancel', me.editDateCancel)
			.listenTo(me.box.statusSection, 'status:change', me.updateStatus)
			.listenTo(me.box.visibilitySection , 'visibility:change', me.updateVisibility)
		;

        Upfront.Events.on("editor:post:tax:updated", _.bind(me.refreshTaxonomies, me));
	},

	refreshTaxonomies: function(){
		if(!this.parts.tags.length && !this.parts.categories.length)
			return;

		if(this.taxLoading)
			return;

		var me = this,
			options = this.postView.partOptions || {},
			templates = this.postView.partTemplates || {},
			request = {
				action: 'content_part_markup',
				post_id: this.post.get('ID'),
				parts: [],
				templates: {}
			}
		;

		if(this.parts.tags.length){
			request.parts.push({slug: 'tags', options: options.tags || {}});
			request.templates.tags = templates.tags || '';
		}

		if(this.parts.categories.length){
			request.parts.push({slug: 'categories', options: options.categories || {}});
			request.templates.categories = templates.categories || '';
		}

		request.parts = JSON.stringify(request.parts);

		// Wait a bit to finish storing any pending taxonomy
		setTimeout(function(){
			me.taxLoading = Upfront.Util.post(request).done(function(response){
				var partContents = me.postView.partContents;

				_.extend(partContents.replacements, response.data.replacements);
				_.extend(partContents.tpls, response.data.tpls);

				me.parts.tags.html(response.data.tpls.tags);
				me.parts.categories.html(response.data.tpls.categories);

				me.taxLoading = false;
			});
		}, 300);
	},

	stop: function(){
		if (this.box && this.box.element_stop_prop) { // Let's be sure we don't end up removing all listeners, that's no fun
			Upfront.Events.off("upfront:element:edit:stop", this.box.element_stop_prop);
		}

		if(this.onTitleEdited)
			this.parts.titles.off('change', this.onTitleEdited);

		if(this.editors)
			_.each(this.editors, function(e){e.stop()});

		var draggable = this.$el.closest('.ui-draggable');
		if(draggable.length)
			cancel = draggable.draggable('enable');

		this.$('a').data('bypass', false);
	},

	preventLinkNavigation: function(e){
		e.preventDefault();
	}
});

var MicroSelect = Backbone.View.extend({
    tpl: false,
    className: 'ueditor-select ueditor-popup upfront-ui',
    events: {
        'blur input': 'close',
        'click .ueditor-select-option': 'select'
    },
    initialize: function(options){
        this.opts = options.options;
        this.render();
    },
    render: function() {
        if(!this.tpl)
            this.tpl = this.getTpl();
        if(this.tpl)
            this.$el.html(this.tpl({options: this.opts}));
    },
    open: function(){
        var me = this;
        if(!this.tpl)
            this.render();
        this.$el.css('display', 'inline-block');
        this.delegateEvents();
        $(document).one('click', function(e){
            var parent = me.$el.parent().length ? me.$el.parent() : me.$el,
                $target = $(e.target)
                ;
            if(!$target.is(parent[0]) && !$target.closest(parent[0]).length)
                me.close();
        });
    },
    close: function(e){
        var me = this;
        setTimeout(function(){
            me.$el.hide();
        }, 200);
    },
    select: function(e){
        e.preventDefault();
        var value = $(e.target).data('id');
        this.trigger('select', value);
        this.$('input').val('value');
        this.$el.hide();
    },
    getTpl: function(){
        if(this.tpl)
            return this.tpl;

        if(Upfront.data && Upfront.data.tpls)
            return _.template($(Upfront.data.tpls.popup).find('#microselect-tpl').html());
        return false;
    }
});



return {
	PostContentEditor: PostContentEditor,
	getMarkupper: function getMarkupper(){return markupper;}
}


//End define
});})(jQuery);
