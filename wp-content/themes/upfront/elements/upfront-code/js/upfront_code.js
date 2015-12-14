;(function ($, undefined) {
define([
	'text!elements/upfront-code/css/editor.css',
	'elements/upfront-code/js/views',
	'elements/upfront-code/js/model',
	'elements/upfront-code/js/element'
], function (style, Views, CodeModel, CodeElement) {

$("head").append('<style>' + style + '</style>');

var l10n = Upfront.Settings.l10n.code_element;

var CodeView = Upfront.Views.ObjectView.extend({

	on_render: function () {
		var type = this.model.get_property_value_by_name("code_selection_type"),
			me = this,
			view = false
		;
		this.$el.empty().append("Loading...");
		require([
			'//cdnjs.cloudflare.com/ajax/libs/ace/1.1.01/ace.js'
		], function () {
			if (!type) view = me.render_initial_view();
			else view = me.render_code_view();
		});
		if (!this.parent_module_view.$el.data("dragHandler")) {
			this.parent_module_view.$el.on('dragstart', this.cover_iframes);
			this.parent_module_view.$el.data("dragHandler", true);
		}
	},

	cover_iframes: function (e, ui) {
		ui.helper.append('<div class="upfront-iframe-draggable" style="width:100%;height:100%;position:absolute;top:0;left:0:z-index:1"></div>');
	},

	render_initial_view: function () {
		var view = new Views.Start({
			model: this.model
		});
		view.render();

		view.parent_view = this.parent_view;
		view.parent_module_view = this.parent_module_view;

		view.on("code:selection:selected", this.render_code_view, this);
		this.$el.empty().append(view.$el);
		return view;
	},

	render_code_view: function () {
		var type = this.model.get_property_value_by_name("code_selection_type");
		if (!type) {
			Upfront.Util.log("Missing type");
			return this.render_initial_view();
		}
		var view = new Views[type]({
			model: this.model
		});
		view.render();

		view.parent_view = this.parent_view;
		view.parent_module_view = this.parent_module_view;

		view.on("code:model:updated", this.propagate_model_update, this);
		this.$el.empty().append(view.$el);
		return view;
	},

	propagate_model_update: function () {
		Upfront.Events.trigger("upfront:element:edit:stop");
	}
});


Upfront.Application.LayoutEditor.add_object("Code", {
	"Model": CodeModel,
	"View": CodeView,
	"Element": CodeElement,
	//"Settings": CodeSettings
});
Upfront.Models.CodeModel = CodeModel;
Upfront.Views.CodeView = CodeView;

});
})(jQuery);
