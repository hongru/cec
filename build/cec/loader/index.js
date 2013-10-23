/*
combined files : 

cec/klass
cec/notifier/index
cec/loader/index

*/
//klass: a classical JS OOP façade

KISSY.add('cec/klass',function (S) {

    var context = S || this,
        old = context.klass,
        f = 'function',
        fnTest = /xyz/.test(function () {
            xyz
        }) ? /\bsupr\b/ : /.*/,
        proto = 'prototype';

        function klass(o) {
            return extend.call(isFn(o) ? o : function () {}, o, 1)
        }

        function isFn(o) {
            return typeof o === f
        }

        function wrap(k, fn, supr) {
            return function () {
                var tmp = this.supr;
                this.supr = supr[proto][k];
                var undef = {}.fabricatedUndefined;
                var ret = undef;
                try {
                    ret = fn.apply(this, arguments);
                } finally {
                    this.supr = tmp;
                }
                return ret;
            }
        }

        function process(what, o, supr) {
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    what[k] = isFn(o[k]) && isFn(supr[proto][k]) && fnTest.test(o[k]) ? wrap(k, o[k], supr) : o[k];
                }
            }
        }

        function extend(o, fromSub) {
            // must redefine noop each time so it doesn't inherit from previous arbitrary classes
            function noop() {}
            noop[proto] = this[proto];
            var supr = this,
                prototype = new noop(),
                isFunction = isFn(o),
                _constructor = isFunction ? o : this,
                _methods = isFunction ? {} : o;

                function fn() {
                    if (this.initialize) this.initialize.apply(this, arguments)
                    else {
                        fromSub || isFunction && supr.apply(this, arguments);
                        _constructor.apply(this, arguments);
                    }
                }

            fn.methods = function (o) {
                process(prototype, o, supr);
                fn[proto] = prototype;
                return this;
            }

            fn.methods.call(fn, _methods).prototype.constructor = fn;

            fn.extend = arguments.callee;
            fn[proto].implement = fn.statics = function (o, optFn) {
                o = typeof o == 'string' ? (function () {
                    var obj = {};
                    obj[o] = optFn;
                    return obj;
                }()) : o;
                process(this, o, supr);
                return this;
            }

            return fn;
        }

    klass.noConflict = function () {
        context.klass = old;
        return this;
    }

    return klass;

});
KISSY.add('cec/notifier/index',function (S, Klass) {
    
    var Notifier = Klass({
        fire: function (ev, data) {
            this._events = this._events || {};
            var evs = this._events[ev];
            var args = Array.prototype.slice.call(arguments, 1);
            if (evs && evs.length) {
                for (var i = 0; i < evs.length; i ++) {
                    evs[i].apply(this, args);
                }
            }
            return this;
        },
        on: function (ev, callback) {
            this._events = this._events || {};
            if (!this._events[ev]) {
                this._events[ev] = [];
            }
            this._events[ev].push(callback);
            return this;
        },
        off: function (ev, callback) {
            this._events = this._events || {};
            if (!callback) {
                delete this._events[ev];
            } else {
                for (var i = 0; i < this._events[ev].length; i ++) {
                    if (callback == this._events[ev][i]) {
                        this._events[ev].splice(i, 1);
                        break;
                    }
                }
            }
            return this;
        },
        mix: function () {
            var target, source;
            if (arguments.length == 1) {
                target = this;
                source = arguments[0];
            }
            for (var k in source) {
                target[k] = source[k];
            }

            return target;
        }
    });
    Notifier.singleton = new Notifier();

    return Notifier;

}, {
    requires: ['cec/klass']
});
KISSY.add('cec/loader/index',function (S, Notifier) {
	
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
			img.src = src;
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
