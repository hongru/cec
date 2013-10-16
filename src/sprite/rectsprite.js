//RectSprite
KISSY.add(function (S, Sprite) {
	
	var RectSprite = Sprite.extend({
		initialize: function (options) {
			this.supr(options);
			this.updatePoints();
			this.shape = 'rect';
		},
		updatePoints: function () {
			this.points = [
				[-this.width/2, -this.height/2],
				[this.width/2, -this.height/2],
				[this.width/2, this.height/2],
				[-this.width/2, this.height/2]
			];
		},
		set: function (param, autoRender) {
			this._set(param);
            if (/^([\+\-\*\/])?\d+$/.test(param['width']) || /^([\+\-\*\/])?\d+$/.test(param['height'])) {
            	this.updatePoints();	
            }
            if (autoRender && this.stage) {
                this.stage.clear();
                this.stage.render();
            }
            return this;
		},
		setDim: function (w, h, autoRender) {
			if (w == undefined) w = '+0';
			if (h == undefined) h = '+0';
			return this.set({width:w, height:h}, autoRender);
		},
		setWidth: function (w, autoRender) {
			return this.setDim(w, '+0', autoRender);
		},
		setHeight: function (h, autoRender) {
			return this.setDim('+0', h, autoRender);
		},
		_render: function (dt) {
			this.supr(dt);
			this._drawBackgroundImage(dt);
		},
		_drawBackgroundImage: function (dt) {
			//images
            if (this.backgroundImageElement) {
                var iw = this.backgroundImageElement.width,
                    ih = this.backgroundImageElement.height,
                    sx = 0,
                    sy = 0,
                    bgPos = this.backgroundPosition || [0, 0];

                if (bgPos[0] < 0) sx = -bgPos[0];
                if (bgPos[1] < 0) sy = -bgPos[1];
                //rect sprite support image
                if (this.shape == 'rect') {
                    this.ctx.drawImage(this.backgroundImageElement, sx, sy, iw-sx, ih-sy, bgPos[0]-this.width/2, bgPos[1]-this.height/2, iw, ih);
                }
            }
		}
	});

	return RectSprite;

}, {
	requires: ['./sprite']
});