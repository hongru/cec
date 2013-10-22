KISSY.add(function (S, Notifier) {
	
	var Loader = Notifier.extend({
		loadedImages: {},
		initialize: function (assets, cb) {
			this.load(assets, cb);
		},
		load: function (assets, cb) {
			
		}
	});

	return Loader;

}, {
	requires: ['cec/notifier/']
});