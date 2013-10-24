//Frame Animation Sprite
KISSY.add(function (S, RectSprite) {
	/**
	 * animConfig: {
	 * 		autoPlay: true,
	 * 		loop: true,
	 * 		frameNum:,
	 *		frameRate:,
	 		imgWidth:,
	 		imgHeight:,
	 		arrangeDir:,
	 		//if `imgWidth & imgWidth` in `animConfig`, you can do without `frameData`
 	 *		frameData: []
	 * }
	 */

	var AnimSprite = RectSprite.extend({
		initialize: function (options) {
			this.supr(options);

			this.backgroundRepeat = 'no-repeat';

			this._autoPlay = this.animConfig.autoPlay == undefined ? true : this.animConfig.autoPlay;
			this._loop = this.animConfig.loop == undefined ? true : this.animConfig.loop;
			this._frameNum = this.animConfig.frameNum;
			this._frameRate = this.animConfig.frameRate || 10;
			this._arrangeDir = this.animConfig.arrangeDir || 'h'; // or 'v'
			this._frames = this._getFrames();
			this._time = 0;

			this.playing = false;
			this.currentFrame = 0;
			this.frameWidth = this._frames[0][2];
			this.frameHeight = this._frames[0][3];
			this.animationLength = this._frameNum/this._frameRate;

			this._autoPlay && this.play();
		},

		_getFrames: function () {
			var frames = [];
			if (Object.prototype.toString.call(this.animConfig.frameData) == '[object Array]' && this.animConfig.frameData.length) {
				frames = this.animConfig.frameData;
			} else if (this.animConfig.imgWidth && this.animConfig.imgHeight) {
				var _x = 0, _y = 0;
				for (var i = 0; i < this._frameNum; i ++) {
					if (this._arrangeDir == 'h') {
						var fw = this.animConfig.imgWidth/this._frameNum,
							fh = this.animConfig.imgHeight;
						var f = [_x, 0, fw, fh];
						_x += fw;
						_x = Math.min((this.animConfig.imgWidth - fw), _x);
						frames.push(f);
					} else if (this._arrangeDir == 'v') {
						var fw = this.animConfig.imgWidth,
							fh = this.animConfig.imgHeight/this._frameNum;
						var f = [0, _y, fw, fh];
						_y += fh;
						_y = Math.min((this.animConfig.imgHeight - fh), _y);
						frames.push(f);
					}
				}
			}
			this._frames = frames;
			return frames;
		},

		_drawBackgroundImage: function (dt) {
			// get current frame
			if (this.playing) {
				this._time += dt;
				if (this._time > this.animationLength && this._loop) {
					this._time -= this.animationLength;
				}
				this.currentFrame = Math.min(Math.floor(this._time * this._frameRate), this._frameNum-1);
				this.setFrame(this.currentFrame);
			}

			if (this.backgroundImageElement) {
                var iw = this.backgroundImageElement.width,
                    ih = this.backgroundImageElement.height,
                    bgPos = this.backgroundPosition || [0, 0],
                    frame = this._frames[this.currentFrame];
                if (typeof bgPos == 'string') bgPos = bgPos.split(' ');

                if (this.shape == 'rect') {
                	// frame 0
                    this.ctx.drawImage(this.backgroundImageElement, frame[0], frame[1], frame[2], frame[3], bgPos[0], bgPos[1], this.width, this.height);
                }
            }
		},
		play: function () {
			this._time = this.currentFrame/this._frameRate;
			this.playing = true;
			return this;
		},
		stop: function () {
			this.playing = false;
			return this;
		},
		setLoop: function (f) {
			this._loop = !!f;
			return this;
		},
		isLoop: function () {
			return this._loop;
		},
		isPlaying: function () {
			return this.playing;
		},
		setFrame: function (ind) {
			this.currentFrame = Math.min(this._frameNum, Math.max(parseInt(ind), 0));
			this.frameWidth = this._frames[this.currentFrame][2];
			this.frameHeight = this._frames[this.currentFrame][3];
			return this;
		},
		nextFrame: function () {
			var nf = this.currentFrame + 1;
			if (this._loop && nf > this._frameNum - 1) nf = 0;
			return this.setFrame(nf);
		},
		prevFrame: function () {
			var pf = this.currentFrame - 1;
			if (this._loop && pf < 0) pf = this._frameNum - 1;
			return this.setFrame(pf);
		},
		setSpeed: function (sp) {
			var _oldRate = this._frameRate;
			this._frameRate = parseFloat(sp);
			this.animationLength = this._frameNum/this._frameRate;
			this._time *= _oldRate/this._frameRate
			return this;
		},
		getSpeed: function () {
			return this._frameRate;
		},
		getFrameNum: function () {
			return this._frameNum;
		},
		getAnimationLength: function () {
			return this.animationLength;
		}
	});

	return AnimSprite;

}, {
	requires: ['./rectsprite']
})