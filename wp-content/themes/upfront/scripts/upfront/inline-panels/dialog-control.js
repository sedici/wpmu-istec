(function ($) {
define([
	'scripts/upfront/inline-panels/control',
	'text!scripts/upfront/inline-panels/templates/panel-control-template.html'
], function (Control, panelControlTemplate) {
	var l10n = Upfront.mainData.l10n.image_element;

	var DialogControl = Control.extend({
		multiControl: true,
		hideOnClick: true,

		events: {
			'click': 'onClickControl',
			'click button': 'onClickOk'
		},

		initialize: function(options) {
			var me = this;
			this.options = options || {};

			// Allow only one control to be open at a time
			this.listenTo(Upfront.Events, 'dialog-control:open', function(dialogControl) {
				if (me === dialogControl) {
					return;
				}

				me.close();
			});
		},

		render: function(){
			Control.prototype.render.call(this, arguments);
			var me = this,
				panel;

			if(!this.$el.hasClass('uimage-control-panel-item')) {
				this.$el.addClass('uimage-control-panel-item');
			}

			if(this.view){
				this.view.render();
				this.view.delegateEvents();
			}

			if(!this.panel){
				//this is like initialize
				panel = $(_.template(panelControlTemplate, {l10n: l10n.template, hideOkButton: this.hideOkButton}));
				panel.addClass('inline-panel-control-dialog');
				this.$el.append(panel);
				panel.find('.uimage-control-panel-content').html('').append(this.view.$el);
				this.panel = panel;
				$(document).on('click', me.onDocumentClick);
			}

			return this;
		},

		remove: function() {
			$(document).off('click', this.onDocumentClick);
		},

		onDocumentClick: function(e) {
			var	target = $(e.target);

			if(target.closest('#page').length && target[0] !== this.el && !target.closest(this.el).length && this.isopen) {
				this.close();
			}
		},

		onClickControl: function(e){
			
			this.$el.siblings('.upfront-control-dialog-open').removeClass('upfront-control-dialog-open');

			if(!$(e.target).hasClass('upfront-icon') || $(e.target).hasClass('upfront-icon-media-label-delete')) {
				return;
			}

			e.preventDefault();

			if(this.isopen) {
				this.close();
			} else {
				this.open();
			}
		},

		onClickOk: function(e){
			e.preventDefault();
			this.trigger('panel:ok', this.view);
		},

		bindEvents: function(){
			this.panel.find('button').on('click', function(){
			});
		},

		open: function() {
			this.isopen = true;
			this.$el.addClass('upfront-control-dialog-open');
			this.trigger('panel:open');
			Upfront.Events.trigger('dialog-control:open', this);
			return this;
		},
		close: function() {
			this.isopen = false;
			this.$el.removeClass('upfront-control-dialog-open');
			this.trigger('panel:close');
			return this;
		}
	});

	return DialogControl;
});
})(jQuery);
