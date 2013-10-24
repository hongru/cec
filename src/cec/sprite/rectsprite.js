//RectSprite
KISSY.add(function (S, Sprite) {
	
	var RectSprite = Sprite.extend({

		initialize: function (options) {
			
			this.shape = 'rect';
            this._backgroundCanvas = document && document.createElement('canvas');
            if (typeof FlashCanvas != "undefined") {
                FlashCanvas.initElement(this._backgroundCanvas);
            }
            this._backgroundCanvasCtx = this._backgroundCanvas.getContext('2d');

            this.supr(options);
		},
        _checkImgs: function () {
            this.supr();
            if (this.backgroundImageReady) {
                this._getBackgroundPosition();
                this._updateBackgroundCanvas();
            }
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
        setBackgroundPosition: function (pos, autoRender) {
            if (!this.backgroundImageReady) return this;
            this.set({backgroundPosition: (typeof pos == 'string' ? pos : pos.join(' '))}, autoRender);
            this._getBackgroundPosition();
            return this;
        },
        setBackgroundPositionX: function (x, autoRender) {
            if (!this.backgroundImageReady) return this;
            this.set({backgroundPositionX:x});
            return this.setBackgroundPosition([this.backgroundPositionX, this.backgroundPositionY], autoRender);
        },
        setBackgroundPositionY: function (y, autoRender) {
            if (!this.backgroundImageReady) return this;
            this.set({backgroundPositionY:y});
            return this.setBackgroundPosition([this.backgroundPositionX, this.backgroundPositionY], autoRender);
        },
        setBackgroundSize: function (size, autoRender) {
            if (!this.backgroundImageReady) return this;
            this.set({backgroundSize: (typeof size == 'string' ? size : size.join(' '))}, autoRender);
            this._getBackgroundPosition();
            this._updateBackgroundCanvas();
            return this;
        },
        setBackgroundWidth: function (w, autoRender) {
            if (!this.backgroundImageReady) return this;
            this.set({backgroundWidth:w});
            return this.setBackgroundSize([this.backgroundWidth, this.backgroundHeight], autoRender);
        },
        setBackgroundHeight: function (h, autoRender) {
            if (!this.backgroundImageReady) return this;
            this.set({backgroundHeight:h});
            return this.setBackgroundSize([this.backgroundWidth, this.backgroundHeight], autoRender);
        },
		_render: function (dt) {
			this.supr(dt);
			this._drawBackgroundImage(dt);
		},
		_drawBackgroundImage: function (dt) {
			//images
            if (this.backgroundImageElement) {
                var bgPos = [this.backgroundPositionX, this.backgroundPositionY],
                    imgEl = typeof FlashCanvas != 'undefined' ? this.backgroundImageElement : (this._backgroundCanvas || this.backgroundImageElement),
                    iw = imgEl.width,
                    ih = imgEl.height,
                    fixPos = this.borderWidth ? this.borderWidth/2 : 0;

                //rect sprite support image
                if (this.shape == 'rect') {

                    if (this.backgroundRepeat == 'no-repeat') {
                        this.ctx.beginPath();
                        this.ctx.rect(0, 0, this.width, this.height);
                        this.ctx.closePath();
                        this.ctx.clip();
                        this.ctx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, bgPos[0], bgPos[1], imgEl.width, imgEl.height);

                    } else if (this.backgroundRepeat == 'repeat-x') {
 
                        var col = Math.ceil(this.width/iw) + 1,
                            row = 1,
                            fixX = bgPos[0]%iw;
                        if (fixX > 0) fixX = fixX - iw;

                        this.ctx.beginPath();
                        this.ctx.rect(0, 0, this.width, this.height);
                        this.ctx.closePath();
                        this.ctx.clip();

                        for (var c = 0; c < col; c ++) {
                            this.ctx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, c*imgEl.width+fixX, bgPos[1], imgEl.width, imgEl.height);
                        }

                    } else if (this.backgroundRepeat == 'repeat-y') {

                        var col = 1,
                            row = Math.ceil(this.height/ih) + 1,
                            fixY = bgPos[1]%ih;
                        if (fixY > 0) fixY = fixY - ih;

                        this.ctx.beginPath();
                        this.ctx.rect(0, 0, this.width, this.height);
                        this.ctx.closePath();
                        this.ctx.clip();

                        for (var r = 0; r < row; r ++) {
                            this.ctx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, bgPos[0], r*ih+fixY, iw, ih);
                        }

                    } else if (this.backgroundRepeat == 'repeat') {
                        var col = Math.ceil(this.width/iw) + 1,
                            row = Math.ceil(this.height/ih) + 1,
                            fixX = bgPos[0]%iw,
                            fixY = bgPos[1]%ih;
                        if (fixX > 0) fixX = fixX - iw;
                        if (fixY > 0) fixY = fixY - ih;

                        this.ctx.beginPath();
                        this.ctx.rect(0, 0, this.width, this.height);
                        this.ctx.closePath();
                        this.ctx.clip();

                        for (var c = 0; c < col; c ++) {
                            for (var r = 0; r < row; r ++) {
                                this.ctx.drawImage(imgEl, 0, 0, iw, ih, c*iw+fixX, r*ih+fixY, iw, ih);
                            }
                        } 
                    }
                }
            }
		},
        _getBackgroundPosition: function () {
            var pos = [0, 0],
                bgsize = this._getBackgroundSize(),
                imgEl = this._backgroundCanvas,
                imgWidth = bgsize[0] || imgEl.width,
                imgHeight = bgsize[1] || imgEl.height;

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
        },
        _getBackgroundSize: function () {
            var imgEl = this.backgroundImageElement,
                imgWidth = this.frameWidth || imgEl.width,
                imgHeight = this.frameHeight || imgEl.height,
                bgsize = [imgWidth, imgHeight];
            if (typeof this.backgroundSize == 'string') {
                bgsize = this.backgroundSize.split(' ');
                if (bgsize.length == 1) bgsize[1] = 'auto';
                if (bgsize[0] == 'auto' && bgsize[1] == 'auto') {
                    bgsize[0] = imgWidth;
                    bgsize[1] = imgHeight;
                } else if (bgsize[0] == 'auto') {
                    bgsize[1] = /^[\+\-]?\d+\%$/.test(bgsize[1]) ? (this.height * parseFloat(bgsize[1])/100) : parseFloat(bgsize[1]);
                    bgsize[0] = imgWidth*bgsize[1]/imgHeight;
                } else if (bgsize[1] == 'auto') {
                    bgsize[0] = /^[\+\-]?\d+\%$/.test(bgsize[0]) ? (this.width * parseFloat(bgsize[0])/100) : parseFloat(bgsize[0]);
                    bgsize[1] = imgHeight*bgsize[0]/imgWidth;
                } else {
                    bgsize[0] = /^[\+\-]?\d+\%$/.test(bgsize[0]) ? (this.width * parseFloat(bgsize[0])/100) : parseFloat(bgsize[0]);
                    bgsize[1] = /^[\+\-]?\d+\%$/.test(bgsize[1]) ? (this.height * parseFloat(bgsize[1])/100) : parseFloat(bgsize[1]);
                }
                bgsize[0] = Math.floor(Math.max(0, bgsize[0]));
                bgsize[1] = Math.floor(Math.max(0, bgsize[1]));
            }
            this.backgroundWidth = bgsize[0];
            this.backgroundHeight = bgsize[1];

            return bgsize;
        },
        _updateBackgroundCanvas: function () {
            var imgEl = this.backgroundImageElement,
                imgWidth = imgEl.width,
                imgHeight = imgEl.height;
            if (this._backgroundCanvas) {
               this._backgroundCanvas.width = this.backgroundWidth;
                this._backgroundCanvas.height = this.backgroundHeight;
                this._backgroundCanvasCtx.drawImage(this.backgroundImageElement, 0, 0, imgWidth, imgHeight, 0, 0, this.backgroundWidth, this.backgroundHeight); 
            }
            
        }
	});

	return RectSprite;

}, {
	requires: ['cec/sprite/sprite']
});