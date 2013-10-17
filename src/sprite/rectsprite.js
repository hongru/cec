//RectSprite
KISSY.add(function (S, Sprite) {
	
	var RectSprite = Sprite.extend({
		initialize: function (options) {
			this.supr(options);
			this.shape = 'rect';
		},
        _checkImgs: function () {
            this.supr();
            this.backgroundImageReady && this._getBackgrondPosition();
        },
        _updatePoints: function () {
            this.points = [[0,0], [this.width, 0], [this.width, this.height], [0, this.height]];
        },
		set: function (param, autoRender) {
			this._set(param);
            if (/^([\+\-\*\/])?\d+$/.test(param['width']) || /^([\+\-\*\/])?\d+$/.test(param['height'])) {
                this._updatePoints();
            	this._updateBounding();	
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
        setBackgroundPosition: function (x, y, autoRender) {
            if (!this.backgroundImageReady) return this;
            return this.set({backgroundPosition:[x, y]}, autoRender);
        },
        setBackgroundPositionX: function (x, autoRender) {
            if (!this.backgroundImageReady) return this;
            this.set({backgroundPositionX:x});
            return this.setBackgroundPosition(this.backgroundPositionX, this.backgroundPositionY, autoRender);
        },
        setBackgroundPositionY: function (y, autoRender) {
            if (!this.backgroundImageReady) return this;
            this.set({backgroundPositionY:y});
            return this.setBackgroundPosition(this.backgroundPositionX, this.backgroundPositionY, autoRender);
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
                    bgPos = this._getBackgrondPosition(),
                    fixPos = this.borderWidth ? this.borderWidth/2 : 0;

                //rect sprite support image
                if (this.shape == 'rect') {
                    //this.ctx.drawImage(this.backgroundImageElement, sx, sy, iw-sx, ih-sy, bgPos[0] + fixPos, bgPos[1] + fixPos, iw, ih);
                    //var pat = this.ctx.createPattern(this.backgroundImageElement, this.backgroundRepeat);
                    //this.ctx.fillStyle = pat;
                    //this.ctx.fillRect(bgPos[0] - 10, bgPos[1], this.width, this.height);
                    if (this.backgroundRepeat == 'no-repeat') {
                        if (bgPos[0] < 0) sx = -bgPos[0];
                        if (bgPos[1] < 0) sy = -bgPos[1];
                        var cx = bgPos[0] < 0 ? 0 : bgPos[0],
                            cy = bgPos[1] < 0 ? 0 : bgPos[1],
                            cw = iw-sx,
                            ch = ih-sy;
                        if (cx + iw > this.width) cw = this.width - cx;
                        if (cy + ih > this.height) ch = this.height - cy;
                        this.ctx.drawImage(this.backgroundImageElement, sx, sy, cw, ch, cx, cy, cw, ch);

                    } else if (this.backgroundRepeat == 'repeat-x') {
                        var col = Math.ceil(this.width/iw) + 1,
                            row = 1,
                            fixX = bgPos[0]%iw;

                        if (fixX > 0) fixX = fixX - iw;
                        if (bgPos[1] < 0) sy = -bgPos[1];
                        for (var c = 0; c < col; c ++) {
                            var sx = c == 0 ? -fixX : 0,
                                cx = c*iw+fixX,
                                cy = bgPos[1] < 0 ? 0 : bgPos[1],
                                cw = iw-sx,
                                ch = ih-sy;
                            if (cx + cw > this.width) {
                                cw = this.width - cx;
                            }
                            if (cy + ch > this.height) {
                                ch = this.height - cy;
                            }
                            this.ctx.drawImage(this.backgroundImageElement, sx, sy, cw, ch, Math.max(cx, 0), cy, cw, ch);
                    
                        } 
                    } else if (this.backgroundRepeat == 'repeat-y') {

                        var col = 1,
                            row = Math.ceil(this.height/ih) + 1,
                            fixY = bgPos[1]%ih;
                        if (bgPos[0] < 0) sx = -bgPos[0];
                        if (fixY > 0) fixY = fixY - ih;

                        for (var r = 0; r < row; r ++) {
                            var sy = r == 0 ? -fixY : 0,
                                cx = bgPos[0] < 0 ? 0 : bgPos[0],
                                cy = r*ih+fixY,
                                cw = iw-sx,
                                ch = ih-sy;
                            if (cx + cw > this.width) {
                                cw = this.width - cx;
                            }
                            if (cy + ch > this.height) {
                                ch = this.height - cy;
                            }
                            this.ctx.drawImage(this.backgroundImageElement, sx, sy, cw, ch, Math.max(cx, 0), Math.max(cy, 0), cw, ch);
                        }
                        

                    } else if (this.backgroundRepeat == 'repeat') {
                        var col = Math.ceil(this.width/iw) + 1,
                            row = Math.ceil(this.height/ih) + 1,
                            fixX = bgPos[0]%iw,
                            fixY = bgPos[1]%ih;
                        if (fixX > 0) fixX = fixX - iw;
                        if (fixY > 0) fixY = fixY - ih;

                        for (var c = 0; c < col; c ++) {
                            for (var r = 0; r < row; r ++) {
                                var sx = c == 0 ? -fixX : 0,
                                    sy = r == 0 ? -fixY : 0,
                                    cx = c*iw+fixX,
                                    cy = r*ih+fixY,
                                    cw = iw-sx,
                                    ch = ih-sy;
                                if (cx + cw > this.width) {
                                    cw = this.width - cx;
                                }
                                if (cy + ch > this.height) {
                                    ch = this.height - cy;
                                }
                                this.ctx.drawImage(this.backgroundImageElement, sx, sy, cw, ch, Math.max(cx, 0), Math.max(cy, 0), cw, ch);
                            }
                        } 
                    }
                }
            }
		},
        _getBackgrondPosition: function () {
            var pos = [0, 0],
                imgEl = this.backgroundImageElement,
                imgWidth = imgEl.width,
                imgHeight = imgEl.height;

            if (typeof this.backgroundPosition == 'string') {
                pos = this.backgroundPosition.split(' ');
                if (pos[0] == 'left') pos[0] = '0%';
                if (pos[0] == 'center') pos[0] = '50%';
                if (pos[0] == 'right') pos[0] = '100%';
                if (pos[1] == 'top') pos[1] = '0%';
                if (pos[1] == 'center') pos[1] = '50%'
                if (pos[1] == 'bottom') pos[1] = '100%';

                pos[0] = /^[\+\-]?\d+\%$/.test(pos[0]) ? ((this.width - imgWidth) * parseFloat(pos[0])/100) : parseFloat(pos[0]);
                pos[1] = /^[\+\-]?\d+\%$/.test(pos[1]) ? ((this.height - imgHeight) * parseFloat(pos[1])/100) : parseFloat(pos[1]);

            } else if (Object.prototype.toString.call(this.backgroundPosition) == '[object Array]') {
                pos = this.backgroundPosition;
            }

            this.backgroundPositionX = pos[0];
            this.backgroundPositionY = pos[1];
            return pos;
        }
	});

	return RectSprite;

}, {
	requires: ['./sprite']
});