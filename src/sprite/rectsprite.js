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
			for (var k in param) {
                var matchSymbol = (''+param[k]).match(/^([\+\-\*\/])(\d+(\.\d+)?)$/);
                if (matchSymbol) { 
                    var symbol = matchSymbol[1],
                        num = parseFloat(matchSymbol[2]);
                    switch(symbol) {
                        case '+':
                            param[k] = parseFloat(this[k]) + num;
                            break;
                        case '-':
                            param[k] = parseFloat(this[k]) - num;
                            break;
                        case '*':
                            param[k] = parseFloat(this[k]) * num;
                            break;
                        case '/':
                            param[k] = parseFloat(this[k]) / num;
                            break;
                    }
                }
                this[k] = param[k];
            }
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
		}
	});

	return RectSprite;

}, {
	requires: ['./sprite']
});