;(function($){

    var deps = [
        'text!scripts/redactor/ueditor-templates.html'
    ];

    var l10n = Upfront.Settings && Upfront.Settings.l10n
        ? Upfront.Settings.l10n.global.ueditor
        : Upfront.mainData.l10n.global.ueditor
    ;

define("redactor_plugins", deps, function(tpl){

var UeditorEvents = _.extend({}, Backbone.Events);
    /* Panel helper
     ------------------------------*/

var UeditorPanel = Backbone.View.extend({
    initialize: function(options){
        var me = this;

        me.redactor = options.redactor;
        me.button = options.button;
        me.panel = options.panel;

        this.on('open', function(redactor){
            me.$el.trigger('open', redactor);
        });
        this.on('closed', function(redactor){
            me.$el.trigger('closed', redactor);
        });

        if( typeof this.init === "function" ){
            this.init();
        }
        this.render();
    },

    openToolbar: function(openPanel){
        var me = this;
        //me.redactor.$air.show();
        //if(openPanel){
        //    setTimeout(function(){
        //        if(!me.panel.is(':visible'))
        //            me.button.click();
        //    }, 300);
        //}
    },

    closeToolbar: function(){
        this.redactor.$air.fadeOut(100);
        this.redactor.dropdown.hideAll();
        this.$el.trigger('toolbarClosed', this.redactor);
    },

    closePanel: function(){
        if(this.panel.is(':visible'))
            this.button.click();
    },

    disableEditorStop: function(){
        this.redactor.ueditor.disableStop = true;
    },

    enableEditorStop: function(){
        var me = this;
        setTimeout(function(){
            me.redactor.ueditor.disableStop = false;
        }, 300);
    },
    appendOkButton: function(text){
        var me = this;
        if(!me.$el.siblings('.ueditor-ok').length){
            text = text || 'Ok';
            var button = $('<a class="ueditor-ok">' + text + '</a>').on('click', function(e){
                me.$el.trigger('ok');
            });
            button.insertAfter(me.$el);
        }
    }
});


    /*-----------------------------
     PLUGINS
     -------------------------------*/

if (!RedactorPlugins) var RedactorPlugins = {};


/*
 STATE BUTTONS PLUGIN
 */
RedactorPlugins.stateButtons = function() {

    return {
        init: function () {
            if( !this.$toolbar  ) return;
            this.$air = this.$toolbar.closest(".redactor_air");
            this.stateButtons.addStateButtons();
            this.stateButtons.startStateObserver();
        },
        addStateButtons: function () {
            //if (this.stateButtons)
            //    return;

            var me = this;
            //this.stateButtons = {};
            $.each(this.opts.stateButtons, function (id, data) {
                if ($.inArray(id, me.opts.airButtons) !== -1) {
                    var button = new me.stateButtons.StateButton(id, data);
                    var btn = me.button.add(id, data.title);
                    me.button.addCallback( btn, function () {
                        me.stateButtons.stateCallback(id, button)
                    });
                    // set state of button
                    me.$air.on("show", function () {
                        button.guessState(me);
                    });
                }

            });
        },
        stateCallback: function (id, button) {
            button.guessState(this);
            button.callback(id, this.button.get(id), button);
        },
        startStateObserver: function () {
            var observer = $.proxy(this.stateObserver, this);
            this.$element.on('mouseup.redactor keyup.redactor', observer);
        },

        stateObserver: function () {
            var me = this;
            $.each(this.stateButtons.stateButtons, function (id, button) {
                button.guessState(me);
            });
            me.waitForMouseUp = false; //Prevent handler bound to document.mouseup
        },

        StateButton: function (id, data) {
            var me = this,
                nextStates = {},
                previousState = false;
            firstState = false;
            ;

            me.id = id;
            me.currentState = data.defaultState;
            me.states = data.states;
            me.iconClasses = '';
            me.defaultState = data.defaultState;

            $.each(me.states, function (id, state) {
                if (previousState) {
                    nextStates[previousState] = id;
                }
                else
                    firstState = id;
                me.iconClasses += ' ' + state.iconClass;
                previousState = id;
            });
            nextStates[previousState] = firstState;

            me.nextStates = nextStates;

            me.nextState = function (el) {
                this.setState(me.nextStates[this.currentState], el);
            };
            me.setState = function (id, el) {
                this.currentState = id;
                el.removeClass(this.iconClasses)
                    .addClass(this.states[this.currentState].iconClass)
                ;
            };
            me.triggerState = function (redactor, name, el, button) {
                var callback = $.proxy(this.states[this.currentState].callback, redactor);
                callback(name, el, button);
            };
            me.guessState = function (redactor) {
                var found = false;
                $.each(this.states, function (id, state) {
                    found = state.isActive(redactor) ? id : found;
                });
                if (!found)
                    found = this.defaultState;
                this.setState(found, redactor.button.get(this.id));
            };
            me.getElement = function (redactor) {
                return redactor.button.get(this.id);
                return redactor.$toolbar.find('.re-' + this.id);
            };
            return {
                id: id,
                title: data.title,
                callback: function (name, el, button) {
                    button.nextState(el);
                    button.triggerState(this, name, el, button);
                },
                nextState: $.proxy(me.nextState, me),
                setState: $.proxy(me.setState, me),
                triggerState: $.proxy(me.triggerState, me),
                guessState: $.proxy(me.guessState, me)
            }
        }
    }
};



/*--------------------
 ALIGMENT BUTTON
 --------------------- */
RedactorPlugins.stateAlignment = function() {
    return {
        init: function(){
            if( !this.$toolbar  ) return;
            var self = this;
            this.opts.stateButtons.stateAlign = {
                title: l10n.text_align,
                defaultState: 'left',
                states: {
                    left: {
                        iconClass: 'ueditor-left',
                        isActive: function(redactor){
                            var $parent = $(redactor.selection.getBlock());
                            if($parent.length && $parent[0].nodeType == 3)
                                $parent = $parent.parent();
                            return $parent.length && $parent.css('text-align') == 'left';
                        },
                        callback: function(name, el , button){
                            self.alignment.left();
                        }
                    },
                    center: {
                        iconClass: 'ueditor-center',
                        isActive: function(redactor){
                            var $parent = $(redactor.selection.getBlock());
                            if($parent.length && $parent[0].nodeType == 3)
                                $parent = $parent.parent();
                            return $parent.length && $parent.css('text-align') == 'center';
                        },
                        callback: function(name, el , button){
                            self.alignment.center();
                        }
                    },
                    right: {
                        iconClass: 'ueditor-right',
                        isActive: function(redactor){
                            var $parent = $(redactor.selection.getBlock());
                            if($parent.length && $parent[0].nodeType == 3)
                                $parent = $parent.parent();
                            return $parent.length && $parent.css('text-align') == 'right';
                        },
                        callback: function(name, el , button){
                            self.alignment.right();
                        }
                    },
                    justify: {
                        iconClass: 'ueditor-justify',
                        isActive: function(redactor){
                            var $parent = $(redactor.selection.getBlock());
                            if($parent.length && $parent[0].nodeType == 3)
                                $parent = $parent.parent();
                            return $parent.length && $parent.css('text-align') == 'justify';
                        },
                        callback: function(name, el , button){
                            self.alignment.justify();
                        }
                    }
                }
            }
        }
    }
};

RedactorPlugins.stateAlignmentCTA = {
    beforeInit: function(){
        if( !this.$toolbar  ) return;
        var self = this;
        this.opts.stateButtons.stateAlignCTA = {
            title: l10n.text_align,
            defaultState: 'left',
            states: {
                left: {
                    iconClass: 'ueditor-left',
                    isActive: function(redactor){
                        return self.$element.length && self.$element.css('text-align') == 'left';

                    },
                    callback: function(name, el , button){

                        self.$element.css('text-align', 'left');
                        //.alignmentLeft();
                    }
                },
                center: {
                    iconClass: 'ueditor-center',
                    isActive: function(redactor){

                        return self.$element.length && self.$element.css('text-align') == 'center';

                    },
                    callback: function(name, el , button){

                        self.$element.css('text-align', 'center');

                    }
                },
                right: {
                    iconClass: 'ueditor-right',
                    isActive: function(redactor){

                        return self.$element.length && self.$element.css('text-align') == 'right';

                    },
                    callback: function(name, el , button){

                        self.$element.css('text-align', 'right');
                    }
                },
                justify: {
                    iconClass: 'ueditor-justify',
                    isActive: function(redactor){

                        return self.$element.length && self.$element.css('text-align') == 'justify';

                    },
                    callback: function(name, el , button){
                        self.$element.css('text-align', 'justify');
                    }
                }
            }
        }
    }
};

RedactorPlugins.stateLists = function() {

    return {
        init: function () {
            var self = this;
            this.opts.stateButtons.stateLists = {
                title: l10n.list_style,
                defaultState: 'none',
                states: {
                    none: {
                        iconClass: 'ueditor-nolist',
                        isActive: function (redactor) {
                            var $parent = $(redactor.selection.getParent());
                            return $parent.length && $parent.css('text-align') == 'left';
                        },
                        callback: function (name, el, button) {
                            self.list.toggle("orderedlist");
                        }
                    },
                    unordered: {
                        iconClass: 'ueditor-unorderedlist',
                        isActive: function (redactor) {
                            var $parent = $(redactor.selection.getParent());
                            if ($parent.length) {
                                var list = $parent.closest('ul');
                                if (list.length)
                                    return list.closest('.ueditable').length;
                            }
                            return false;
                        },
                        callback: function (name, el, button) {
                            self.list.toggle("unorderedlist");
                        }
                    },
                    ordered: {
                        iconClass: 'ueditor-orderedlist',
                        isActive: function (redactor) {
                            var $parent = $(redactor.selection.getParent());
                            if ($parent.length) {
                                var list = $parent.closest('ol');
                                if (list.length)
                                    return list.closest('.ueditable').length;
                            }
                            return false;
                        },
                        callback: function (name, el, button) {
                            self.list.toggle("orderedlist");
                        }

                    }
                }
            }
        }
    }
};


RedactorPlugins.upfrontImages = {

    beforeInit: function () {
        if( !this.$toolbar  ) return;
        var redactor = this;
        redactor.events.on("ueditor:stop", function () {
            ImagesHelper.Image.unbind_events();
        });
        redactor.events.on("ueditor:insert:media", function () {
            ImagesHelper.Gallery.to_html(redactor);
            ImagesHelper.Slider.to_html(redactor);
        });
        ImagesHelper.Image.redactor = redactor;
        ImagesHelper.Image.create_dialog();
        ImagesHelper.Image.bind_events();

        Upfront.Media.Transformations.add(ImagesHelper.Image.cleanup);
        Upfront.Media.Transformations.add(ImagesHelper.Gallery.from_html);
        Upfront.Media.Transformations.add(ImagesHelper.Slider.from_html);

        Upfront.Events.on("upfront:editor:image_align", function (el, align) { // Can we refactor upfront:editor:* events?
            var margin = false;
            if ("left" === align) margin = "margin-right";
            else if ("right" === align) margin = "margin-left";
            if (!margin) return false;
            $(el).css(margin, "15px");
        });
    }
};


RedactorPlugins.upfrontSink = {
    beforeInit: function(){
        var me = this;
        if(!Upfront.data.ueditor)
            Upfront.data.ueditor = {sink: false};
        this.opts.buttonsCustom.upfrontSink = {
            title: l10n.more_tools
        };
    },
    init: function(){
        if( !this.$toolbar  ) return;
        var me = this,
            $button = this.$toolbar.find('.redactor_btn_upfrontSink').parent().addClass('upfront-sink-button'),
            sinkElements = this.$toolbar.find('.upfront-sink-button ~ li'),
            sink = $('<div class="ueditor-sink"></div>')
            ;

        $button.on('click', function(){
            if(Upfront.data.ueditor.sink){
                me.closeSink();
            }
            else{
                me.openSink();
            }
        });

        sinkElements.detach().appendTo(sink);
        this.$toolbar.append(sink);
        if(Upfront.data.ueditor.sink)
            this.$toolbar.addClass('ueditor-sink-open');

        sinkElements.each(function(){
            var link = $(this).find('a').attr('class').match(/redactor_btn_[^\s]*/g),
                id = false,
                box = false
                ;
            if(link.length)
                id = link[0].replace('redactor_btn_', '');

            box = me.$toolbar.find('.redactor-dropdown-box-' + id);
            if(box.length)
                box.css({'margin-top': '40px'});
        });
        this.$air.on('show', function(){
            if(Upfront.data.ueditor.sink)
                me.$air.css({top: me.$air.offset().top - 40});
        });
    },
    openSink: function(){
        Upfront.data.ueditor.sink = true;
        this.$toolbar.addClass('ueditor-sink-open');
        this.$air.css({top: this.$air.offset().top - 40});
    },
    closeSink: function(){
        Upfront.data.ueditor.sink = false;
        this.$toolbar.removeClass('ueditor-sink-open');
        this.$air.css({top: this.$air.offset().top + 40});
    }
};


RedactorPlugins.upfrontPlaceholder = function() {
    return {
        init: function () {
            var me = this;
            var placeholder = this.placeholderText;//opts.placeholder;
            if (this.$element.attr('placeholder')) placeholder = this.$element.attr('placeholder');
            if (placeholder === '') placeholder = false;
            if (placeholder !== false)
            {
                //this.placeholderRemoveFromEditor();
                this.$editor.find('span.redactor_placeholder').remove();
                this.$editor.off('focus.redactor_placeholder');

                this.$placeholder = this.$editor.clone(false);

                this.$placeholder.attr('contenteditable', false).removeClass('ueditable redactor_editor').addClass('ueditor-placeholder').html( placeholder);//this.opts.linebreaks ? placeholder : placeholder );
                this.$editor.after(this.$placeholder);
                if ( this.$editor.css('position') == 'static' )
                    this.$editor.css('position', 'relative');
                this.$editor.css('z-index', 1);
                var editor_pos = this.$editor.position();
                this.$placeholder.css({
                    'position': 'absolute',
                    'z-index': '0',
                    'top': editor_pos.top,
                    'left': editor_pos.left,
                    'right': this.$box.outerWidth() - (editor_pos.left + this.$editor.outerWidth())
                });
                this.opts.placeholder = placeholder;
                function placeholderUpdate() {
                    me.code.sync(); // sync first before get

                    var html = me.$editor.text().trim();//$source.val();//this.get();

                    if ( html == '' || html == '&nbsp;' )
                        me.$placeholder.show();
                    else
                        me.$placeholder.hide();
                    }
                }
								var proxyPlaceholderUpdate = $.proxy(placeholderUpdate, this);
                this.$editor.on('keyup', proxyPlaceholderUpdate);
								this.events.on('cleanUpListeners', function() {
									me.$editor.off('keyup', proxyPlaceholderUpdate);
									me.events.off('cleanUpListeners');
								});
                placeholderUpdate();
        },
       /* placeholderUpdate: function () {
            this.code.sync(); // sync first before get
            var html = this.get();
            if ( html == '' )
                this.$placeholder.show();
            else
                this.$placeholder.hide();

        }*/
    }
};

/*-------------------
 Panel Buttons
 -------------------*/

RedactorPlugins.panelButtons = function () {

    return {
        init: function () {
            if( !this.$toolbar  ) return;
            var self = this;

            $.each(this.opts.buttonsCustom, function (id, b) {
                if (b.panel) {
                    var $panel = $('<div class="redactor-dropdown ueditor_panel redactor-dropdown-box-' + id + ' redactor-dropdown-' + self.uuid +' " style="display: none;">'),
                        $button = self.button.get(id),
                        addMethod = _.isUndefined(  b.first ) ? "add" : "addFirst"
                        ;
                    b.panel = new b.panel({redactor: self, button: $button, panel: $panel});
                    $panel.html(b.panel.$el);
                    $panel.appendTo( self.$toolbar );
                    b.dropdown = true;

                    $button.on('click', function () {
                        if ($button.hasClass('dropact')) {
                            self.selection.removeMarkers();
                            b.panel.trigger('open', self);
                        }
                        else {
                            b.panel.trigger('closed', self);
                        }
                    });
                    self.$editor.on('mouseup.redactor keyup.redactor', function () {
                        if ($button.hasClass('dropact')) { //It's open, so we close it
                            self.dropdownHideAll();
                            b.panel.trigger('closed', self);
                        }
                    });

                    $panel
                        .on('click keydown keyup', function (e) {
                            e.stopPropagation();
                        })
                    ;
                    if ($.inArray(id, self.opts.airButtons) === -1) return;
                    var btn = self.button[addMethod](id, b.title);
                    self.button.addCallback( btn, function () {
                        var $button = self.button.get(id),
                            left = $button.position().left;

                        $(".re-icon").removeClass("redactor_act dropact");
                        $button.addClass("redactor_act dropact");
                        $(".redactor-dropdown").not($panel).hide();

                        $panel.css("left", left + "px").toggle();


                        /**
                         * Triggers panel open or close events
                         */
                        if ($panel.is(":visible") && typeof b.panel.open === "function") {
                            b.panel.open.apply(b.panel, [jQuery.Event("open"), self]);
                        } else {
                            if (typeof b.panel.close === "function") {
                                b.panel.close.apply(jQuery.Event("close"), [$.Event, self]);
                            }
                        }

                        /**
                         * Makes sure the last button's panel is kept under the toolbar
                         * @type {[type]}
                         */
                        var $last = $(".redactor-dropdown.ueditor_panel").last(),
                            lastDropdownLeft = left - $last.innerWidth() + $button.width();
                        $last.css("left", lastDropdownLeft + "px");
                    } );

                }
            });
        }
    }
};

/*--------------------
 Font icons button
 -----------------------*/
RedactorPlugins.upfrontIcons = function() {
    return {
        $sel: false,
        init: function () {
            this.opts.buttonsCustom.upfrontIcons = {
                title: l10n.icons,
                panel: this.upfrontIcons.panel
            };
            UeditorEvents.on("ueditor:key:down", function (redactor, e) {
                if ($(redactor.selection.getParent()).hasClass("uf_font_icon") || $(redactor.selection.getCurrent()).hasClass("uf_font_icon")) {
                    if (!( e.keyCode < 48 || e.keyCode > 90 )) {
                        e.preventDefault();
                    }
                }
            });
        },
        panel: UeditorPanel.extend(_.extend({}, Upfront.Views.Mixins.Upfront_Scroll_Mixin, {
            $sel: false,
            tpl: _.template($(tpl).find('#font-icons').html()),
            events: {
                'click .ueditor-font-icon': 'insert_icon',
                'open': 'open',
                'toolbarClosed': "close",
                'change .upfront-font-icons-controlls input': "input_change"
            },
            render: function (options) {
                this.$el.html(this.tpl());
                this.stop_scroll_propagation(this.$el);
            },
            open: function (e, redactor) {
                this.redactor = redactor;
                this.redactor.selection.restore();
                this.redactor.buffer.set();
                this.redactor.selection.save();
                this.set_current_icon();
                this.$el.parent().css({
                    left: 193
                });
            },
            close: function () {
                if (this.redactor) {
                    //this.redactor.selection.restore();
                    this.$sel = false;
                }
            },
            insert_icon: function (e) {
                var $icon = $($(e.target).hasClass("ueditor-font-icon") ? $(e.target).html() : $(e.target).closest(".ueditor-font-icon").html()),
                    fontSize = this.$(".font-icons-size").val(),
                    top = this.$(".font-icons-top").val();
                $icon.css({
                    "font-size": fontSize + "px",
                    "top": top + "px"
                });
                var inserted = this.redactor.insert.node($icon[0], false); //inserted false instead of true to retain the selected content
                this.redactor.code.sync();

                //var offset = this.redactor.caret.getOffset(); //existing caret position

                this.redactor.selection.restore();

                this.closeToolbar();
                this.redactor.caret.setAfter($(inserted));
                //this.redactor.caret.setOffset(100);
            },
            input_change: function(e){
                var $sel = this.$sel;
                e.stopPropagation();
                e.preventDefault();
                var $input = $(e.target),
                    val = $input.val() + "px";

                if ($input.hasClass("font-icons-size")) {
                    $sel.css("font-size", val);
                }

                if ($input.hasClass("font-icons-top")) {
                    $sel.css("top", val);
                }
                this.redactor.code.sync();
            },
            set_current_icon: function () {
                var $sel = $(this.redactor.selection.getCurrent()).last(),
                    self = this;

                if (!$sel.hasClass("uf_font_icon")) {
                    $sel = $(this.redactor.selection.getInlines()).filter( ".uf_font_icon").last();
                }
                if ($sel.hasClass("uf_font_icon")) {
                    this.$sel = $sel;
                    this.$(".font-icons-size").val(parseFloat($sel.css("font-size")));
                    this.$(".font-icons-top").val(parseFloat($sel.css("top")));
                }
            }

        }))
    }
};

/*--------------------
 Upfront link panel button
 -----------------------*/
RedactorPlugins.upfrontLink = function() {

	return {
		init: function () {
			this.opts.buttonsCustom.upfrontLink = {
				title: l10n.link,
				panel: this.upfrontLink.panel
			};
		},
		openPanel: function () {
			var left = this.button.get("link").position().left;
			$(".redactor-dropdown-box-upfrontLink").css("left", left + "px").toggle();
		},
		panel: UeditorPanel.extend({
			tpl: _.template($(tpl).find('#link-tpl').html()),
			events: {
				open: 'open'
			},
			initialize: function () {
				UeditorPanel.prototype.initialize.apply(this, arguments);
			},
			render: function (options) {
				var linkTypes = {};
				options = options || {};

				if (this.redactor.$element.hasClass('mfp-title')) {
					linkTypes = {
						anchor: false,
						lightbox: false
					};
					// Prevent magnific focus handler to mess up everything
					$(document).off('focusin');
				}

				this.linkPanel = new Upfront.Views.Editor.LinkPanel({
					linkUrl: options.url,
					linkType: options.link || this.guessLinkType(options.url),
					linkTarget: options.target || '_self',
					linkTypes: linkTypes,
					button: true
				});

				this.listenTo(this.linkPanel, 'change change:target', function (data) {
					if (data.type == 'unlink') {
						this.unlink();
					} else {
						this.link(data.url, data.type, data.target);
					}

					this.closeToolbar();
				});

				this.linkPanel.render();
				this.$el.html(this.linkPanel.el);
				this.linkPanel.delegateEvents();
			},
			open: function (e, redactor) {
				this.redactor = redactor;
				redactor.selection.save();
				var link = redactor.utils.isCurrentOrParent('A');
				var url = false;

				if (link || url) {
					this.render({
						url: link ? $(link).attr('href') : url,
						link: this.guessLinkType(link ? $(link).attr('href') : url),
						target: $(link).attr('target')
					});//this.render({url: $(link).attr('href'), link: $(link).attr('rel') || 'external'});
				} else {
					this.render({
						url: '',
						link: 'external',
						target: '_blank'
					});
				}
			},
			close: function (e, redactor) {
				redactor.selection.restore();
			},
			unlink: function (e) {
				if (e) {
					e.preventDefault();
				}

				var text = this.redactor.selection.getHtml();
				this.redactor.selection.restore();
				if (text !== '' && $.parseHTML(text).length > 1) {// there is html inside
					this.redactor.insert.html(text, true);
				} else {
					this.redactor.link.unlink();
				}
				this.redactor.$element.focus();
                this.updateMissingLightboxFlag();
			},
			link: function (url, type, target) {
				this.redactor.selection.restore();
				if (url) {
					var caption = this.redactor.selection.getHtml();
					var link = this.redactor.utils.isCurrentOrParent('A');
					if (link) {
						$(link).attr('href', url).attr('rel', type).attr('target', target);
					} else {
						this.redactor.link.set(caption, url, target);
					}
					this.redactor.$element.focus();
				}
                this.updateMissingLightboxFlag();
				this.redactor.code.sync();

			},
			bindEvents: function () {
			},
			guessLinkType: function(url){
				if(!$.trim(url) || $.trim(url) == '#')
					return 'unlink';
				if(url.length && url[0] == '#')
					return url.indexOf('#ltb-') > -1 ? 'lightbox' : 'anchor';
				if(url.substring(0, location.origin.length) == location.origin)
					return 'entry';
				if (url.match(/^mailto/)) {
					return 'email';
				}

				return 'external';
			},
            updateMissingLightboxFlag: function() {
                var link = this.redactor.utils.isCurrentOrParent('A');

                if(link && $(link).attr('href').indexOf('#ltb-') > -1 ) {
                    if(!Upfront.Util.checkLightbox($(link).attr('href')))
                        $(link).addClass('missing-lightbox-warning');
                    else
                        $(link).removeClass('missing-lightbox-warning');
                }
            }
		})
	}
};

RedactorPlugins.upfrontColor = function() {

    return {
        init: function () {
            this.opts.buttonsCustom.upfrontColor = {
                title: l10n.color,
                panel: this.upfrontColor.panel
            };
        },
        panel: UeditorPanel.extend({
            current_color: false,
            current_bg: false,
            events: {
                'open': 'open'
            },
            init: function(){
              this.listenTo( UeditorEvents, "ueditor:air:show", this.on_air_show );
							var me = this;
							this.listenTo( UeditorEvents, 'cleanUpListeners', function() {
								me.stopListening();
							});
            },
            on_air_show: function(e){
                this.redactor.selection.save();
                this.updateIcon();
            },
            close: function (e, redactor) {
                redactor.selection.restore();
            },
            setCurrentColors: function () {
                var current = this.redactor.selection.getCurrent();
                current = $(current).prop('tagName') ? current : $(current).parent();
                if ( current && ( ['SPAN', 'DIV', 'INLINE'].indexOf(  $(current).prop('tagName')  ) !== -1 || $(current).hasClass(".upfront_theme_colors") ) ) {

                    var bg_color = tinycolor($(current).css('background-color'));
                    this.current_color = $(current).css('color');
                    if (bg_color.getAlpha() > 0)
                        this.current_bg = $(current).css('background-color');
                }
                else {
                    this.current_color = this.current_bg = false;
                }
            },
            open: function (e, redactor) {
                this.updateIcon();
                this.redactor.selection.save();
                var self = this,
                    theme_colors = Upfront.Views.Theme_Colors.colors.pluck("color").length ? Upfront.Views.Theme_Colors.colors.pluck("color") : [],
                    foreground_picker = new Upfront.Views.Editor.Field.Color({
                        spectrum: {
                            flat: true,
                            showAlpha: true,
                            appendTo: "parent",
                            showPalette: true,
                            localStorageKey: "spectrum.recent_colors",
                            palette: theme_colors,
                            maxSelectionSize: 10,
                            preferredFormat: "hex",
                            chooseText: "Ok",
                            showInput: true,
                            allowEmpty: true,
                            change: function (color) {
                                self.current_color = color;
                            },
                            move: function (color) {
                                self.current_color = color;
                            }
                        }
                    }),
                    background_picker = new Upfront.Views.Editor.Field.Color({
                        blank_alpha: 0,
                        spectrum: {
                            flat: true,
                            showAlpha: true,
                            appendTo: "parent",
                            showPalette: true,
                            palette: theme_colors,
                            localStorageKey: "spectrum.recent_bgs",
                            maxSelectionSize: 10,
                            preferredFormat: "hex",
                            chooseText: "Ok",
                            showInput: true,
                            allowEmpty: true,
                            change: function (color) {
                                self.current_bg = color;
                            },
                            move: function (color) {
                                self.current_bg = color;
                            }
                        }
                    });

                foreground_picker.render();
                this.$("#tabforeground-content").html(foreground_picker.el);

                background_picker.render();
                this.$("#tabbackground-content").html(background_picker.el);

                if (this.current_color) {
                    var color = tinycolor(self.current_color);
                    foreground_picker.$(".upfront-field-color").spectrum("option", "color", self.current_color);
                    foreground_picker.$(".upfront-field-color").spectrum("set", color);
                    foreground_picker.$(".sp-input").css({
                        "border-left-color": self.current_color
                    });
                    foreground_picker.render_sidebar_rgba(color.toRgb());
                    foreground_picker.update_input_val(color.toHexString());
                }
                else {
                    var color = tinycolor("#000000");
                    foreground_picker.$(".upfront-field-color").spectrum("option", "color", "#000000");
                    foreground_picker.$(".upfront-field-color").spectrum("set", color);
                    background_picker.$(".sp-input").css({
                        "border-left-color": "#000000"
                    });
                    foreground_picker.render_sidebar_rgba(color.toRgb());
                    foreground_picker.update_input_val(color.toHexString());
                }

                if (this.current_bg) {
                    var color = tinycolor(self.current_bg);
                    background_picker.$(".upfront-field-color").spectrum("option", "color", self.current_bg);
                    background_picker.$(".upfront-field-color").spectrum("set", color);
                    background_picker.$(".sp-input").css({
                        "border-left-color": self.current_bg
                    });
                    background_picker.render_sidebar_rgba(color.toRgb());
                    background_picker.update_input_val(color.toHexString());
                }
                else {
                    var color = tinycolor("rgba(0, 0, 0, 0)");
                    background_picker.$(".upfront-field-color").spectrum("option", "color", "rgba(0, 0, 0, 0)");
                    background_picker.$(".upfront-field-color").spectrum("set", color);
                    background_picker.$(".sp-input").css({
                        "border-left-color": "rgba(0, 0, 0, 0)"
                    });
                    background_picker.render_sidebar_rgba(color.toRgb());
                    background_picker.update_input_val(color.toHexString());
                }


                this.$(".sp-choose").on("click", function ( e ) {
                    e.preventDefault();
                    self.updateColors();
                    self.closePanel();
                    self.closeToolbar();
                    self.redactor.dropdown.hideAll();
                });
            },
            render: function () {

                var tabforeground = $('<li id="tabforeground" class="active">').html(l10n.text_color);
                var tabbackground = $('<li id="tabbackground">').html(l10n.text_background);
                var tablist = $('<ul class="tablist">').append(tabforeground).append(tabbackground);

                var tabs = $('<ul class="tabs">').append($('<li id="tabforeground-content" class="active">').html('<input class="foreground" type="text">')).append($('<li id="tabbackground-content">').html('<input class="background" type="text">'));

                var redac = this.redactor;
                var self = this;

                //redac.bufferAirBindHide = this.redactor.airBindHide;

                //redac.airBindHide = function () {
                //    self.updateIcon();
                //    redac.bufferAirBindHide();
                //};

                tablist.children('li').on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    tablist.children('li').removeClass('active');
                    $(this).addClass('active');
                    tabs.children('li').removeClass('active');
                    tabs.children('li#' + $(this).attr('id') + '-content').addClass('active');

                    self.$('input.foreground').spectrum('option', 'color', typeof(self.current_color) == 'object' ? self.current_color.toRgbString() : self.current_color);
                    self.$('input.background').spectrum('option', 'color', typeof(self.current_bg) == 'object' ? self.current_bg.toRgbString() : self.current_bg);
                });

                this.$el.html(tablist).append(tabs);
                //redac.selectionSave();

            },
            updateIcon: function () {
                var self = this;
                self.setCurrentColors();
                if (self.current_bg) {
                    var color = tinycolor(self.current_bg);
                    if (color.getAlpha() === 0) {
                        this.redactor.$toolbar.find('.re-icon.re-upfrontColor').addClass('transparent').css('border-color', "");
                    } else {
                        this.redactor.$toolbar.find('.re-icon.re-upfrontColor').removeClass('transparent').css('border-color', color.toRgbString());
                    }
                }
                else {
                    this.redactor.$toolbar.find('.re-icon.re-upfrontColor').addClass('transparent').css('border-color', '');
                }


                if (self.current_color)
                    this.redactor.$toolbar.find('.re-icon.re-upfrontColor').css('color', self.current_color);
                else
                    this.redactor.$toolbar.find('.re-icon.re-upfrontColor').css('color', '');

            },
            updateColors: function () {
                this.redactor.buffer.set();
                this.redactor.selection.save();
                var theme_color_index = Upfront.Views.Theme_Colors.colors.is_theme_color(this.current_color);
                if( theme_color_index !== false ){
                    this.current_color.is_theme_color = true;
                    this.current_color.theme_color = "#ufc" + theme_color_index;
                    this.current_color.theme_color_code = Upfront.Util.colors.convert_string_ufc_to_color( this.current_color.theme_color);
                }else{
                    this.current_color.is_theme_color = false;
                }

                theme_color_index = Upfront.Views.Theme_Colors.colors.is_theme_color(this.current_bg);
                if( theme_color_index !== false ){
                    this.current_bg.is_theme_color = true;
                    this.current_bg.theme_color = "#ufc" + theme_color_index;
                    this.current_bg.theme_color_code = Upfront.Util.colors.convert_string_ufc_to_color(this.current_bg.theme_color);
                }else{
                    this.current_bg.is_theme_color = false;
                }

                var self = this,
                    current = self.redactor.selection.getText(),
                    bg_cleanup = "color",
                    font_cleanup = "color",
                    change_color = false,
                    change_bgcolor = false,
                    class_set = function( cls ){
                        self.redactor.inline.format('div', 'class', cls);
                    },
                    color_set = function(rule, raw_value) {
                        var theme_color = false, cls = false, is_bg = !!rule.match(/background/);
                        if (raw_value.is_theme_color) {
                            cls = Upfront.Views.Theme_Colors.colors.get_css_class(raw_value, is_bg);
                            if (!cls) theme_color = raw_value.theme_color;
                        } else {
                            theme_color = raw_value.toRgbString();
                        }

                        var wrapper = document.createElement("span"),
                            contents = self.redactor.range.extractContents(),
                            range = self.redactor.range,
                            $range = range.commonAncestorContainer ? $(range.commonAncestorContainer) : false
                        ;

                        if ($range && $range.length && $range.is("span")) {
                            range.selectNode(range.commonAncestorContainer);
                            Upfront.Views.Theme_Colors.colors.remove_theme_color_classes($range, is_bg);
                            $range.attr("style", "");
                            wrapper = $range.get(0);
                        }
                        wrapper.appendChild(contents);
                        self.redactor.range.insertNode(wrapper);

                        if (cls) {
                            $(wrapper)
                                .addClass(cls)
                            ;
                        } else if (!!theme_color) {
                            $(wrapper)
                                .attr("style", rule + ':' + theme_color) // use color otherwise
                            ;
                        }


                        self.redactor.selection.restore();
                        self.redactor.code.sync();
                    },
                    color_remove = function(rule)
                    {
                        //self.redactor.inline.removeStyleRule(rule);
                    };


                /**
                 * Background color
                 */
                if (self.current_bg && typeof(self.current_bg) == 'object') {

                    change_bgcolor = true;
                    var bg_class = Upfront.Views.Theme_Colors.colors.get_css_class(self.current_bg.toHexString(), true);
                    //color_remove( 'background-color' );
                    //if (bg_class) {
                    //    class_set( bg_class );
                    //    bg_cleanup = "theme_color";
                    //} else {
                    //
                    //}
                    if(self.current_bg.reset === true){
                        self.reset_bg_color();
                    }else{
                        color_set( 'background-color', self.current_bg  );
                    }
                }

                /**
                 * Font color
                 */
                if (self.current_color && typeof(self.current_color) == 'object') {
                    change_color = true;
                    var theme_color_classname = Upfront.Views.Theme_Colors.colors.get_css_class(self.current_color.toHexString());
                    color_remove( 'color' );
                    //if (theme_color_classname) {
                    //    class_set( theme_color_classname );
                    //}else{
                    //    color_set( 'color',  self.current_color.toRgbString() );
                    //}
                    if( self.current_color.reset === true ){
                        this.reset_color();
                    }else{
                        color_set( 'color', self.current_color );
                    }
                }

                /**
                 * Clean up
                 */
                if( change_color && !change_bgcolor){
                    var replacees = [];
                    $(this.redactor.selection.getCurrent()).parents("[data-redactor-style^='color']").each( function(){
                        var $this = $(this);
                        if( $this.text() === self.redactor.selection.getText() ){
                            replacees.push( this );
                        }
                    } );

                    var current = this.redactor.selection.getCurrent(),
                        $last_el = $( _.last( replacees ) ),
                        $bg_children = $last_el.children("[data-redactor-style^='background-color'], [ style^='background-color']");


                    $bg_children = $bg_children.length === 0 &&  $last_el.is("[data-redactor-style^='background-color'], [ style^='background-color']") ? $last_el : $bg_children;

                    if( $bg_children.length > 0 ){
                        var bg_color = $( _.first( $bg_children )).css("background-color");
                        current = $( current).css( { backgroundColor: bg_color } );
                    }

                    $( $last_el ).replaceWith( current );
                }

                if( change_bgcolor && !change_color){
                    var replacees = [];
                    $(this.redactor.selection.getCurrent()).parents("[data-redactor-style^='background-color']").each( function(){
                        var $this = $(this);
                        if( $this.text() === self.redactor.selection.getText() ){
                            replacees.push( this );
                        }
                    } );

                    var current = this.redactor.selection.getCurrent(),
                        $last_el = $( _.last( replacees ) ),
                        $color_children = $last_el.children("[data-redactor-style^='color'], [ style^='color']");

                    $color_children = $color_children.length === 0 &&  $last_el.is("[data-redactor-style^='color'], [ style^='color']") ? $last_el : $color_children;

                    if( $color_children.length > 0 ){
                        var color = $( _.first( $bg_children )).css("color");
                        current = $( current ).css( { color: color } );
                    }

                    $( $last_el ).replaceWith( current );
                }

                if( change_bgcolor && change_color){
                    var replacees = [];
                    $(this.redactor.selection.getCurrent()).parents("[data-redactor-style^='color'], [data-redactor-style^='background-color']").each( function(){
                        var $this = $(this);
                        if( $this.text() === self.redactor.selection.getText() ){
                            replacees.push( this );
                        }
                    } );

                    $( _.last( replacees ) ).replaceWith( $( this.redactor.selection.getCurrent()).css( {
                        backgroundColor: self.current_bg.is_theme_color ? self.current_bg.theme_color_code : self.current_bg.toHexString()
                    } ) );
                }

                /**
                 * End of clean up
                 */

                self.updateIcon();
            },
            reset_bg_color: function(){
                this.redactor.inline.removeFormat("backgroundColor");
                return;
            },
            reset_color: function(){
                this.redactor.selection.removeMarkers();
                var current = this.redactor.selection.getCurrent(),
                    current_html = $(current).html(),
                    html = this.redactor.selection.getHtml();

                //if( html.replace(/(\r\n|\n|\r)/gm,"").trim() === $(current).html().replace(/(\r\n|\n|\r)/gm,"").trim() && !_.isEmpty( current.style.color ) ){
                    this.redactor.inline.removeFormat("color");
                //}else{
                //}
                $(this.redactor.selection.getCurrent()).find("font").each(function(){
                   var $this = $(this),
                        color = $this.attr("color"),
                        html = $this.html(),
                        span = document.createElement("span");
                    span.style.color = color;
                    span.innerHTML = html;
                    $this.replaceWith( span );
                });

                return;
            }
        })
    }
};


RedactorPlugins.upfrontFormatting = function() {

    return {

        init: function () {

            this.opts.buttonsCustom.upfrontFormatting = {
                title: l10n.formatting,
                panel: this.upfrontFormatting.panel,
                first: true
            };
        },
        panel: UeditorPanel.extend({
            selected_class: "",
            tpl: _.template($(tpl).find('#upfront-formatting').html()),
            className: "ufront-air-formatting",
            init: function(){
                this.custom_classes = ["first-class", "second-class", "third-class"];
            },
            events: {
                "click a" : "select_tag",
                "change .ufront-formatting-custom-class": "change_custom_class"
            },
            render: function (options) {
                this.$el.html(this.tpl({
                    custom_classes: this.custom_classes,
                    selected_class: this.selected_class
                }));
            },
            open: function (e, redactor) {
                this.redactor = redactor;
                this.set_previously_selected_tag();
                this.set_previously_selected_class();
            },
            close: function () {
                if (this.redactor) {
                    this.redactor.selection.restore();
                    this.$sel = false;
                }
            },
            set_previously_selected_tag: function(){
                var tag = $(this.redactor.selection.getBlock()).length ? $(this.redactor.selection.getBlock())[0].tagName : false;
                if (tag) {
                    tag = tag.toLowerCase();
                    this.$(".tags-list li a").removeClass("dropact");
                    this.$("a[data-tag='" + tag + "']").addClass("dropact");
                }
            },
            set_previously_selected_class: function(){
                var self = this,
                    selected_class = $(this.redactor.selection.getBlock()).length ? $(this.redactor.selection.getBlock())[0].className : false;
                if( selected_class ){
                    this.selected_class = selected_class.split(" ").filter( function(cls){
                        return self.custom_classes.indexOf( cls ) !== -1;
                    });

                    if( this.selected_class.length === 1){

                        this.$("option").map(function(){
                            var $this = $(this);
                            if($this.val() === self.selected_class[0]){
                                $this.attr("selected", true);
                            }else{
                                $this.attr("selected", false);
                            }
                        });
                    }
                }
            },
            select_tag: function( e ){
                e.preventDefault();
                this.redactor.buffer.set();
                this.redactor.$editor.focus();

                var tag = $(e.target).data("tag"),
                    selection = this.redactor.selection,
                    html = this.redactor.selection.getHtml(), // Gets selected html
                    //$html = $(html),
                    resulting_html = "",
                    css = this.redactor.selection.getParent() ? this.redactor.selection.getParent().style.cssText : false;


                var formatted = this.redactor.selection.wrap(tag);
                if (formatted === false) return;

                var $formatted = $(formatted);

                this.redactor.block.formatTableWrapping($formatted);

                if( this.redactor.selection.getParent() )
                    $(this.redactor.selection.getCurrent()).find(tag).unwrap();


                this.redactor.dropdown.hideAll();
            },
            change_custom_class: function(e){
                var self = this,
                    custom_class = $(e.target).val();

                this.redactor.buffer.set();
                this.redactor.$editor.focus();
                _(this.custom_classes).each( function(custom_class){
                    self.redactor.block.removeClass( custom_class );
                });
                this.redactor.block.setClass(custom_class);
                this.redactor.dropdown.hideAll();
            }
        })

    }
};

RedactorPlugins.blockquote = function() {

    return {
        init: function () {

            var me = this;
            this.opts.stateButtons.blockquote = {
                title: l10n.blockquote,
                defaultState: 'noquote',
                states: {
                    noquote: {
                        iconClass: 'ueditor-noquote',
                        isActive: function (redactor) {
                            var quote = redactor.blockquote.getQuote();
                            return !quote;
                        },
                        callback: function (name, el, button) {
                            if( me.utils.isCurrentOrParent(['BLOCKQUOTE']) ){
                                //me.block.formatBlockquote('blockquote');
                                //$( me.selection.getCurrent()).unwrap("<blockquote></blockquote>");
                                me.utils.replaceToTag(me.selection.getBlock(), 'p');
                            }
                        }
                    },
                    quote: {
                        iconClass: 'ueditor-quote',
                        isActive: function (redactor) {
                            var quote = redactor.blockquote.getQuote();
                            return quote && !$(quote).hasClass('upfront-quote-alternative');
                        },
                        callback: function (name, el, button) {
                            me.block.formatBlockquote('blockquote');
                        }
                    },
                    alternative: {
                        iconClass: 'ueditor-quote-alternative',
                        isActive: function (redactor) {
                            var quote = redactor.blockquote.getQuote();
                            return quote && $(quote).hasClass('upfront-quote-alternative');
                        },
                        callback: function (name, el, button) {
                            me.blockquote.getQuote().addClass('upfront-quote-alternative');
                        }
                    }
                }
            };

        },
        getQuote: function () {
            var quote = $(this.selection.getParent());
            if (quote.prop('tagName') == 'BLOCKQUOTE')
                return quote;
            quote = quote.closest('blockquote');
            return quote.closest('.redactor-box').length ? quote : false;
        }
    }
};

    window.RedactorPlugins = RedactorPlugins;
    return {
        UeditorEvents: UeditorEvents
    };
}); //End require

}(jQuery));
