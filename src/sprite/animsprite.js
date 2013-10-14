//Frame Animation Sprite
KISSY.add(function (S, RectSprite) {
	/**
	 * animConfig: {
	 * 		autoPlay: true,
	 * 		loop: true,
	 * 		frameNum:,
	 *		frameRate:,
 	 *		frameData: []
	 * }
	 */

	var AnimSprite = RectSprite.extend({
		initialize: function (options) {
			this.supr(options);

			this._autoPlay = this.animConfig.autoPlay == undefined ? true : this.animConfig.autoPlay;
			this._loop = this.animConfig.loop == undefined ? true : this.animConfig.loop;
			this._frameNum = this.animConfig.frameNum;
			this._frameRate = this.animConfig.frameRate;
			this._frames = this.animConfig.frameData;
			this._time = 0;

			this.playing = false;
			this.currentFrame = 0;
			this.frameWidth = this._frames[0][2];
			this.frameHeight = this._frames[0][3];
			this.animationLength = this._frameNum/this._frameRate;

			this._autoPlay && this.play();
		},

		_drawBackgroundImage: function (dt) {
			// get current frame
			if (this.playing) {
				this._time += dt;
				if (this._time > this.animationLength && this._loop) {
					this._time -= this.animationLength;
				}
				this.currentFrame = Math.min(Math.floor(this._time * this._frameRate), this._frameNum-1);

			}

			if (this.backgroundImageElement) {
                var iw = this.backgroundImageElement.width,
                    ih = this.backgroundImageElement.height,
                    bgPos = this.backgroundPosition || [0, 0],
                    frame = this._frames[this.currentFrame];

                if (this.shape == 'rect') {
                	// frame 0
                    this.ctx.drawImage(this.backgroundImageElement, frame[0], frame[1], frame[2], frame[3], bgPos[0]-this.width/2, bgPos[1]-this.height/2, this.width, this.height);
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
			return this;
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