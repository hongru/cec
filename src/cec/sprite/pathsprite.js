KISSY.add(function (S, Sprite) {
	
	var PathSprite = Sprite.extend({
		initialize: function (options) {
			this.supr(options);
			this.parent = null;
			this.children = [];
		},

		_render: function (dt) {
			var p = this.points,
				lineWidth = this.lineWidth || this.borderWidth,
				lineColor = this.lineColor || this.borderColor;
            
            this.ctx.rotate(this.angle * Math.PI/180);
            this.ctx.scale(this.scaleX, this.scaleY);

            this.ctx.beginPath();
            this.ctx.moveTo(p[0][0], p[0][1]);
            for (var i = 1, len = p.length; i < len; i ++) {
                this.ctx.lineTo(p[i][0], p[i][1]);
            }

            this.ctx.globalAlpha = this.opacity;

            if (lineWidth && lineWidth > 0) {
                this.ctx.lineWidth = lineWidth;
                this.ctx.strokeStyle = lineColor;
                //fix lineWidth=1
                this.ctx.stroke();
            }

            this.ctx.closePath();
		},
		setWidth: function (w, autoRender) {
			return this.set({lineWidth: w}, autoRender);
		},
		setColor: function (c, autoRender) {
			return this.set({lineColor: c}, autoRender);
		},
        setPoint: function (i, p, autoRender) {
            if (i > 0 && i < this.points.length) {
                this.points[i] = p;
            }
            this._updateBounding();
            autoRender && this.render();
            return this;
        }
	});

	return PathSprite;

}, {
	requires: ['cec/sprite/sprite']
})