KISSY.add(function (S, Notifier) {
	
	var Loader = Notifier.extend({
		loadedImages: {},
		initialize: function (assets, cb) {
			this.load(assets, cb);
		},
		_tryLoadImg: function (img) {
			var src, tryTime, me = this, timeout = [5000, 3000, 2000];
			if (typeof img == 'string') {
				src = img;
				tryTime = 1;
			} else {
				src = img.originalSrc;
				tryTime = parseInt(img.tryTime) + 1;
			}

			if (tryTime > 3) {
				me.loaded ++;
				me.loadedImages[src] = img;
				me.invoke(img);
				img = null;
				return ;
			}

			tryTime > 1 && console.log('retry: ' + src);

			var img = new Image();
			
			img.originalSrc = src;
			img.tryTime = tryTime;
			img.onload = function () {
				clearTimeout(img._timer);
				me.loaded ++;
				me.loadedImages[src] = img;
				me.invoke(img);
				img = null;
			}

			img.onerror = function () {
				clearTimeout(img._timer);
				me._tryLoadImg(img);
			}

			img._timer = setTimeout(function () {
				me._tryLoadImg(img);
			}, (timeout[tryTime - 1] || 5000));

			img.src = src;
		},
		/**
		 * [load description]
		 * @param  {[Array]}   assets [description]
		 * @param  {Function} cb     [description]
		 * @return {[type]}          [description]
		 */
		load: function (assets, cb) {
			var me = this;

			this.loaded = 0;
			this.assets = assets;
			this.cb = cb;
			this.loadLength = assets.length;

			this.invoke()

			for (var i = 0; i < this.loadLength; i ++) {
				var src = assets[i],
					img = this.loadedImages[src];
				if (img) {
					this.loaded++;
					this.invoke(img);
				} else {
					me._tryLoadImg(src);
				}
			}
		},
		invoke: function (img) {
			this.cb && this.cb.call(this, this.loaded/this.loadLength, img);
		}
	});

	Loader.belongto = function (Sprite) {
		Loader.prototype.mix(Sprite.prototype.__cache__.images, Loader.prototype.loadedImages);
		Loader.prototype.loadedImages = Sprite.prototype.__cache__.images;
	}

	return Loader;

}, {
	requires: ['cec/notifier/']
});