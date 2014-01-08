//stage
KISSY.add(function (S, RectSprite) {
	
	var Stage = RectSprite.extend({
		initialize: function (canvas) {
			if (typeof canvas === 'string') {
				canvas = document.getElementById(canvas) || document.querySelector(canvas);
			}
			if (typeof canvas.getContext === 'function') {
				this.type = 'stage';
				this.supr(canvas);
			}
		}
	});

	return Stage;

}, {
	requires: ['cec/sprite/rectsprite']
})