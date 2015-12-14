(function ($) {
define([
	'elements/upfront-posts/js/post-list-settings-panels'
], function(Panels) {

var l10n = Upfront.Settings.l10n.posts_element;


var PostsSettings = Upfront.Views.Editor.Settings.Settings.extend({

	initialize: function (opts) {
		this.options = opts;
		var me = this,
			general = new Panels.General({model: this.model}),
			post_parts = new Panels.PostParts({model: this.model})
		;
		general.on("settings:dispatched", this.rerender, this);
		general.on("post:removed", this.rerender, this);
		post_parts.on("settings:dispatched", this.rerender, this);
		this.panels = _([
			general,
			post_parts
		]);
	},

	rerender: function () {
		var active_panel = false;
		this.panels.each(function (pl, idx) {
			if (pl.is_active()) active_panel = idx;
		});
		this.initialize(this.options);
		this.$el.empty();
		this.render();
		if (active_panel) this.toggle_panel(this.panels.compact()[active_panel]);
	},

	get_title: function () {
		return l10n.settings;
	}
});

return PostsSettings;

});
})(jQuery);