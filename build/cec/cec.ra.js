var CEC;

;(function () {
    
    var mods = {},
        KISSY;
mods['cec/utils/prototypefix'] = (function (S) {
    if ( !Array.prototype.forEach ) {
        Array.prototype.forEach = function(fn, scope) {
            for(var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope || this, this[i], i, this);
            }
        }
    }
})(KISSY);
mods['cec/klass'] = (function (S) {

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

})(KISSY,mods['cec/utils/prototypefix']);
mods['cec/notifier/index'] = (function (S, Klass) {
    
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

})(KISSY,mods['cec/klass']);
mods['cec/loader/index'] = (function (S, Notifier) {
	
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

})(KISSY,mods['cec/notifier/index']);
mods['cec/sprite/cobject'] = (function (S, Notifier) {
    
    var Cobject = Notifier.extend({
        points: null,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        fillColor: 'rgba(0,0,0,0)',
        borderWidth: 0,
        borderColor: null,
        opacity: 1,
        zIndex: 0,
        visible: true,
        backgroundImage: null,
        backgroundRepeat: 'repeat', // repeat|repeat-x|repeat-y|no-repeat
        backgroundPosition: '0 0', // '0 0'
        backgroundPositionX: 0,
        backgroundPositionY: 0,
        backgroundSize: null, // 'auto auto'
        backgroundWidth: 'auto',
        backgroundHeight: 'auto',

        initialize: function (options) {
            if (!options) return;
            if (typeof options == 'string') {
                options = (document && document.getElementById) ? document.getElementById(options) : options;
            }

            if (options.getContext) {
                this.canvas = options;
                this.ctx = options.getContext('2d');
                this.width = this.canvas.width;
                this.height = this.canvas.height;
                this.points = [[0,0], [this.width, 0], [this.width, this.height], [0, this.height]];

                this.type = 'stage';
                this.shape = 'rect';
            } else {
                //this.mix(options);
                
                for (var k in options) {
                    if (options[k] === undefined) continue;
                    this[k] = options[k];
                }
                
                this.type = 'sprite';
            }

            this._getUniqueId();
        },
        _getUniqueId: function () {
            var i = 0;
            return function () {
                this.id = (i++);
            }
        }(),
        getId: function () {
            return this.id;
        },
        _getFixZIndex: function () {
            var map = {}
            return function (z) {
                if (typeof map[z] != 'number') {
                    map[z] = 0;
                }
                map[z] ++;
                return (z + map[z]/10000);
            }
        }()
    });

    return Cobject;

})(KISSY,mods['cec/notifier/index']);
mods['cec/sprite/sprite'] = (function (S, Cobject) {
    
    var Sprite = Cobject.extend({
        __cache__: {
            images: {},
            audio: {}
        },
        _htmlevents: 'click,dblclick,mousedown,mousemove,mouseover,mouseout,mouseenter,mouseleave,mouseup,keydown,keypress,keyup,touchstart,touchend,touchcancel,touchleave,touchmove',
        initialize: function (options) {
            this.supr(options);

            this.parent = null;
            this.children = [];
            this.boundingRect = [];
            
            this._imgLength = -1;
            this.backgroundImageReady = false;
            this.loadedImgs = [];

            this._updateBounding();
            this._dealImgs();

            this._ev_map = {};
            
        },
        _updateBounding: function () {
            // get bounding rect
            if (this.points) {
                var xs = [],
                    ys = [],
                    minX, maxX, minY, maxY;
                this.points.forEach(function (o) {
                    xs.push(o[0]);
                    ys.push(o[1]);
                });

                minX = Math.min.apply(null, xs);
                maxX = Math.max.apply(null, xs);
                minY = Math.min.apply(null, ys);
                maxY = Math.max.apply(null, ys);

                this.boundingRect = [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]];
                this.width = Math.abs(maxX - minX);
                this.height = Math.abs(maxY - minY);

            } else if (this.width && this.height) {
                this.points = [[0, 0], [this.width, 0], [this.width, this.height], [0, this.height]];
                this.boundingRect = this.points;
            }
        },
        _dealImgs: function () {
            var self = this,
                hasFC = typeof FlashCanvas != 'undefined';
            if (typeof this.backgroundImage == 'string') {
                //hack flashcanvas
                if (hasFC) {
                    //console.log(this.backgroundImage)
                    //this.backgroundImage += /\?/.test(this.backgroundImage) ? ('&t=' + Math.random()) : ('?t='+Math.random());
                }

                //one img url
                this._imgLength = 1;

                var src = this.backgroundImage,
                    cacheImg = this.__cache__.images[src]; //console.log(cacheImg)
                if (cacheImg) { //debugger;
                    self.loadedImgs.push(cacheImg);
                    self._checkImgs();
                    return;
                }

                function imgOnload () {
                    self.loadedImgs.push(img);
                    self._checkImgs();
                    self.__cache__.images[src] = img;
                }
                var img = new Image();
                img.onload = imgOnload;
                img.src = src;

                // fix flashcanvas load image
                // if (typeof FlashCanvas != 'undefined') {
                //     img = {};
                //     img.src = src;
                //     imgOnload();
                // }
            } else if (this.backgroundImage && this.backgroundImage.nodeType == 1 && this.backgroundImage.nodeName == 'IMG') {
                //one img el
                this._imgLength = 1;
                if (this.backgroundImage.width > 0 || this.backgroundImage.height > 0) {
                    self.loadedImgs.push(this.backgroundImage);
                    self._checkImgs();
                } else {
                    self.backgroundImage.onload = function () {
                        self.loadedImgs.push(self.backgroundImage);
                        self._checkImgs();
                    }
                }

            } else if (Object.prototype.toString.call(this.img) == '[object Array]') {
                // img array
                this._imgLength = this.backgroundImage.length;
                //todo ...
            }
        },
        _checkImgs: function () {
            if (this.loadedImgs.length == this._imgLength) {
                this.backgroundImageReady = true;

                if (this._imgLength == 1) {
                    this.backgroundImageElement = this.loadedImgs[0];
                    this.fire('img:ready', this.backgroundImageElement);
                } else if (this._imgLength > 1) {
                    this.fire('img:ready', this.loadedImgs);
                }

            }
        },
        _getWindowScroll: function () {
            var win = window,
                self = this,
                html = document.documentElement || {scrollLeft:0, scrollTop: 0};
            return {
                x: (win.pageXOffset || html.scrollLeft),
                y: (win.pageYOffset || html.scrollTop)
            };
        },
        _getOffset: function (el) {
            var self = this;

            el = el || self.canvas;
            var width = el.offsetWidth || el.width,
                height = el.offsetHeight || el.height,
                top = el.offsetTop || 0,
                left = el.offsetLeft || 0;
            while (el = el.offsetParent) {
                top = top + el.offsetTop;
                left = left + el.offsetLeft;
            }
            return {
                top: top,
                left: left,
                width: width,
                height: height
            };
        },
        trigger: function (e, context) {
            var ev = e.type,
                self = this;

            var stageOffsetX, stageOffsetY, targetOffsetX, targetOffsetY,
                of = self._getOffset(self.canvas),
                winScroll = self._getWindowScroll();

            if (/touch/.test(ev) && e.touches[0]) {
                var touch = e.touches[0];
                stageOffsetX = touch.pageX - of.left;
                stageOffsetY = touch.pageY - of.top;
            } else {
                stageOffsetX = e.clientX + winScroll.x - of.left;
                stageOffsetY = e.clientY + winScroll.y - of.top;
            }

            //console.log(stageOffsetX, stageOffsetY)
            var target = self._findTarget(stageOffsetX, stageOffsetY);
            e.targetSprite = target;
            //e._target = target;
            e.stageOffsetX = stageOffsetX;
            e.stageOffsetY = stageOffsetY;
            e.spriteOffsetX = target._ev_offsetX;
            e.spriteOffsetY = target._ev_offsetY;
            //console.log(stageOffsetX,stageOffsetY,e.spriteOffsetX,e.spriteOffsetY)

            delete target._ev_offsetX;
            delete target._ev_offsetY;

            var callbackList = this._ev_map[ev] || [];
            for (var i = 0, len = callbackList.length; i < len; i ++) {
                callbackList[i].call(context, e);
            }

        },
        _delegateHtmlEvents: function (ev, callback) {
            //private 
            var win = window,
                self = this;

            if (this.type == 'stage') {
                if (!this._ev_map[ev]) {
                    this._ev_map[ev] = [];
                    this._ev_map[ev].push(callback);

                    var self = this;
                    this.canvas.addEventListener(ev, function (e) {
                        e = e || window.event;
                        self.trigger(e);
                    });
                } else {
                    this._ev_map[ev].push(callback);
                }

            } else {
                //console && console.warn('only `stage` type can delegate HTMLEvents!');
            }
        },
        _findTarget: function (x, y) {
            var hoverSprites = [];
            hoverSprites.push(this);

            var computedStyle = window.getComputedStyle(this.canvas, null);
            var _sx = (parseInt(computedStyle.width))/this.canvas.width || 1;
            var _sy = (parseInt(computedStyle.height))/this.canvas.height || 1;

            function find (o, l, t) {
                if (o.children && o.children.length) {
                    for (var i = 0, len = o.children.length; i < len; i ++) {
                        if (o.children[i].eventPenetrate) continue;

                        var c = o.children[i],
                            posc = [(l + c.x)*_sx, (t + c.y)*_sy, (l + c.x + c.width)*_sx, (t + c.y + c.height)*_sy];
                        if (c.visible && x > posc[0] && x < posc[2] && y > posc[1] && y < posc[3]) {
                            c._ev_offsetX = x - (l + c.x);
                            c._ev_offsetY = y - (t + c.y);
                            hoverSprites.push(c);
                        }
                        find(c, posc[0], posc[1]);
                    }
                }
            }
            find(this, this.x, this.y);

            //console.log(hoverSprites[hoverSprites.length-1]);
            return hoverSprites[hoverSprites.length-1];
        },

        add: function (o) {
            o.parent = this;
            o.stage = this.type == 'stage' ? this : this.stage;
            o.canvas = this.canvas;
            o.ctx = this.ctx;
            o._zindex = this._getFixZIndex(parseInt(o.zIndex));

            this.children.push(o);
            this.children.sort(function (a, b) {
                return a._zindex - b._zindex;
            });

            o.fire('added:after', o);
            return this;
        },
        setZIndex: function (z) {
            this.zIndex = parseInt(z);
            this._zindex = this._getFixZIndex(this.zIndex);
        },
        appendTo: function (o) {
            //console.log(o instanceof Sprite);
            if (o instanceof Sprite) {
                o.add(this);
            }
            return this;
        },
        remove: function (o) {
            var target, parent;
            if (!o) {
                target = this;
                parent = this.parent;
            } else {
                target = o;
                parent = this;
            }
            for (var i = 0; i < parent.children.length; i ++) {
                if (target == parent.children[i]) {
                    target.parent = null;
                    target.stage = null;
                    parent.children.splice(i, 1);
                    return target;
                }
            }

        },
        getIndex: function () {
            if (this.parent) {
                for (var i = 0; i < this.parent.children.length; i ++) {
                    if (this == this.parent.children[i]) {
                        return i;
                    }
                }
            }
            return -1;
        },
        getChildIndex: function (c) {
            for (var i = 0; i < this.children.length; i ++) {
                if (this.children[i] == c) {
                    return i;
                }
            }
            return -1;
        },
        contains: function (c) {
            return (this.getChildIndex(c) > -1);
        },
        containsPoint: function (p) {
            var x, y;
            if (Object.prototype.toString.call(p) == '[object Array]') {
                x = p[0];
                y = p[1];
            } else if (typeof p == 'object') {
                x = p.x;
                y = p.y;
            }

            var cross = 0;
            for (var i = 0, len = this.points.length; i < len; i ++) {
                var p0 = this.points[i],
                    p1 = i == len -1 ? this.points[0] : this.points[i + 1],
                    p0p1 = Math.sqrt(Math.pow(p1[0]-p0[0], 2) + Math.pow(p1[1]-p0[1], 2)),
                    pp0 = Math.sqrt(Math.pow(p0[0]-x, 2) + Math.pow(p0[1]-y, 2)),
                    pp1 = Math.sqrt(Math.pow(p1[0]-x, 2) + Math.pow(p1[1]-y, 2)),
                    maxY = Math.max(p0[1], p1[1]),
                    minY = Math.min(p0[1], p1[1]);

                if (pp0 + pp1 == p0p1) {
                    return true;
                } else if (y < minY || y > maxY) {
                    continue;
                } else {
                    var _x = (y-minY)*(p1[0]-p0[0])/(p1[1]-p0[1]);
                    if (_x > x) {
                        cross ++
                    }
                }
            }

            return (cross%2 == 1);
        },
        isVisible: function () {
            var self = this;
            while (self) {
                if (!self.visible) {
                    return false;
                }
                self = self.parent;
            }
            return true;
        },
        show: function () {
            this.visible = true;
            return this;
        },
        hide: function () {
            this.visible = false;
            return this;
        },
        render: function (dt) {
            var self = this;
            dt = dt || 0.016;

            if (!self.visible || !self.points || !self.points.length) {return}

            self.ctx.save();
            self.type == 'stage' && self.ctx.translate(self.x, self.y)
            self.fire('render:before', dt);
            self._render(dt);
            this.fire('render', dt);
            
            for (var i = 0, len = self.children.length; i < len ; i++) {
                self.ctx.save();
                self.ctx.translate(self.children[i].x, self.children[i].y);
                self.children[i].render(dt);
                self.ctx.restore();
            }
            
            self.fire('render:after', dt);
            self.ctx.restore();

            return this;
        },
        _render: function (dt) {
            var p = this.points,
                relativeX = this.width/2,
                relativeY = this.height/2;
            
            this.ctx.fillStyle = this.fillColor;

            this.ctx.translate(relativeX, relativeY);
            this.ctx.rotate(this.angle * Math.PI/180);
            this.ctx.scale(this.scaleX, this.scaleY);

            this.ctx.beginPath();
            this.ctx.moveTo(p[0][0]-relativeX, p[0][1]-relativeY);
            for (var i = 1, len = p.length; i < len; i ++) {
                this.ctx.lineTo(p[i][0]-relativeX, p[i][1]-relativeY);
            }
            this.ctx.lineTo(p[0][0]-relativeX, p[0][1]-relativeY);
            this.ctx.closePath();

            this.ctx.translate(-relativeX, -relativeY);

            this.ctx.globalAlpha = this.opacity;
            this.fillColor && this.ctx.fill();

            if (this.borderWidth && this.borderWidth > 0) {
                this.ctx.lineWidth = parseFloat(this.borderWidth);
                this.ctx.strokeStyle = this.borderColor;
                //fix lineWidth=1

                this.ctx.stroke();
            }

            
        },
        clear: function (x, y, w, h) {
            if (x == undefined) x = 0;
            if (y == undefined) y = 0;
            if (w == undefined) w = this.width;
            if (h == undefined) h = this.height;
            this.ctx.clearRect(x, y, w, h);

            return this;
        },
        on: function (ev, callback) {
            var self = this;
            if ((','+this._htmlevents+',').indexOf(','+ev+',') > -1) {
                // bubble events binding
                if (ev == 'mouseover'
                    || ev == 'mouseout'
                    || ev == 'mouseenter'
                    || ev == 'mouseleave') {
                    this.stage.delegate('mousemove', function (e) {
                        var lastKey = '_last_isSelf_'+ev,
                            key = '_isSelf_' + ev;
                        self[lastKey] = !!self[key];
                        self[key] = e.targetSprite == self;
                        if ((self[key] && !self[lastKey] && (ev == 'mouseover' || ev == 'mouseenter'))
                            || (self[lastKey] && !self[key] && (ev == 'mouseout' || ev == 'mouseleave'))
                        ) {
                            callback && callback.call(self, e);
                        } 

                    });
                } else {
                    this.stage.delegate(ev, function (e) {
                        e.targetSprite == self && callback && callback.call(self, e);
                    });
                }
            } else {
                this.supr(ev, callback);
            }
            return this;
        },
        delegate: function (ev, callback) {
            this._delegateHtmlEvents(ev, callback);
            return this;
        },
        _set: function (param) {
            for (var k in param) {
                if (typeof param[k] == 'string') {
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
                }
                this[k] = param[k];
            }
            return this;
        },
        // set 
        set: function (param, autoRender) {
            this._set(param);
            if (autoRender && this.stage) {
                this.stage.clear();
                this.stage.render();
            }
            return this;
        },
        //setAngle
        setAngle: function (angle, autoRender) {
            return this.set({angle:angle}, autoRender);
        },
        //rotate - alias of setAngle
        rotate: function (angle, autoRender) {
            return this.setAngle(angle, autoRender);
        },
        setFillColor: function (fillColor, autoRender) {
            return this.set({fillColor: fillColor}, autoRender);
        },
        setXY: function (x, y, autoRender) {
            if (x == undefined) x = '+0';
            if (y == undefined) y = '+0';
            return this.set({x:x, y:y}, autoRender);
        },
        //alias of setXY
        moveTo: function (x, y, autoRender) {
            return this.setXY(x, y, autoRender);
        },
        setX: function (x, autoRender) {
            return this.setXY(x, '+0', autoRender);
        },
        setY: function (y, autoRender) {
            return this.setXY('+0', y, autoRender);
        },
        setScale: function (scalex, scaley, autoRender) {
            if (scalex == undefined) scalex = '+0';
            if (scaley == undefined) scaley = '+0';
            return this.set({scaleX:scalex, scaleY: scaley}, autoRender);
        },
        setScaleX: function (scalex, autoRender) {
            return this.setScale(scalex, '+0', autoRender);
        },
        setScaleY: function (scaley, autoRender) {
            return this.setScale('+0', scaley, autoRender);
        },
        setOpacity: function (op, autoRender) {
            this.set({opacity: op}, autoRender); 
            this.opacity = Math.min(1, Math.max(this.opacity, 0));
            return this;  
        } 

    });

    return Sprite;

})(KISSY,mods['cec/sprite/cobject']);
mods['cec/sprite/rectsprite'] = (function (S, Sprite) {

    var supportBackgroundSize = true;
	
	var RectSprite = Sprite.extend({

		initialize: function (options) {
			
			this.shape = 'rect';
            this._bs = (supportBackgroundSize && !!options.backgroundSize);

            if (this._bs) {
                this._backgroundCanvas = document && document.createElement('canvas');
                if (typeof FlashCanvas != "undefined") {
                    FlashCanvas.initElement(this._backgroundCanvas);
                    this._backgroundCanvas.style.position = 'absolute';
                    this._backgroundCanvas.style.left = 0;
                    this._backgroundCanvas.style.top = 0;
                    //document.body.appendChild(this._backgroundCanvas);
                }

                if (this._backgroundCanvas.getContext) {
                    this._backgroundCanvasCtx = this._backgroundCanvas.getContext('2d');
                }
            }
                

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
            if (!this.backgroundImageReady || !this._bs) return this;
            this.set({backgroundSize: (typeof size == 'string' ? size : size.join(' '))}, autoRender);
            this._getBackgroundPosition();
            this._updateBackgroundCanvas();
            return this;
        },
        setBackgroundWidth: function (w, autoRender) {
            if (!this.backgroundImageReady || !this._bs) return this;
            this.set({backgroundWidth:w});
            return this.setBackgroundSize([this.backgroundWidth, this.backgroundHeight], autoRender);
        },
        setBackgroundHeight: function (h, autoRender) {
            if (!this.backgroundImageReady || !this._bs) return this;
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
                    imgEl = (typeof FlashCanvas != 'undefined' || !this._bs) ? this.backgroundImageElement : (this._backgroundCanvas || this.backgroundImageElement),
                    //imgEl = (this._backgroundCanvas || this.backgroundImageElement),
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
            if (typeof this.backgroundSize == 'string' && this._bs) {
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
            if (!this._bs) return ;
            
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

})(KISSY,mods['cec/sprite/sprite']);
mods['cec/sprite/textsprite'] = (function (S, RectSprite) {
    
    var TextSprite = RectSprite.extend({
        text: null,
        textType: 'fill', //'stroke'
        textColor: '#000',
        //font: 'normal normal 14px Arial', // style weight size family
        fontSize: 14,
        fontFamily: 'Arial',
        fontStyle: 'normal',
        fontWeight: 'normal',
        lineHeight: 21,
        textAlign: 'left',
        verticalAlign: 'top',
        //textOffset: '0 0 0 0',
        textOffsetTop: 0,
        textOffsetRight: 0,
        textOffsetBottom: 0,
        textOffsetLeft: 0,

        initialize: function (options) {
            options = this._prepare(options);
            this.supr(options);

            this._textCanvas = document.createElement('canvas');
            if (typeof FlashCanvas != "undefined") {
                FlashCanvas.initElement(this._textCanvas);
                this._textCanvas.style.position = 'absolute';
                this._textCanvas.style.left = 0;
                this._textCanvas.style.top = 0;
                //document.body.appendChild(this._textCanvas);
            }
            this._textCtx = this._textCanvas.getContext('2d');
            this._updateTextCanvas();
        },
        _prepare: function (opt) {
            opt = this._prepareFont(opt);
            opt = this._prepareTextOffset(opt);
            return opt;
        },
        _prepareFont: function (opt) {
            var style = {
                normal: 1,
                italic: 1,
                oblique: 1
            },
            weight = {
                normal: 1,
                bold: 1,
                bolder: 1,
                lighter: 1
            };

            if (opt.font) {
                var arr = opt.font.split(' ');
                if (arr.length == 1) {
                    //family
                    if (!opt.fontFamily) opt.fontFamily = arr[0];

                } else if (arr.length == 2) {
                    // size family
                    if (!opt.fontFamily) opt.fontFamily = arr[1];
                    var k = arr[0];
                    if (/\d+px|\d+pt/.test(k) && opt.fontSize == undefined) {
                        var size = parseInt(k);
                        if (/pt/.test(k)) size = size*4/3;
                        opt.fontSize = size;
                    }
                } else if (arr.length == 3) {
                    // style|weight size family
                    var s = arr[0];
                    if (style[s] || weight[s]) {
                        if (style[s] && !opt.fontStyle) opt.fontStyle = s;
                        if (weight[s] && !opt.fontWeight) opt.fontWeight = s;
                    } else if (/\d+/.test(s) && opt.fontWeight == undefined) {
                        opt.fontWeight = s;
                    }

                    if (!opt.fontFamily) opt.fontFamily = arr[2];
                    var k = arr[1];
                    if (/\d+px|\d+pt/.test(k) && opt.fontSize == undefined) {
                        var size = parseInt(k);
                        if (/pt/.test(k)) size = size*4/3;
                        opt.fontSize = size;
                    }
                } else if (arr.length == 4) {
                    if (style[arr[0]]) {
                        if (!opt.fontStyle) opt.fontStyle = arr[0];
                        if (!opt.fontWeight) opt.fontWeight = arr[1];
                    } else {
                        if (!opt.fontStyle) opt.fontStyle = arr[1];
                        if (!opt.fontWeight) opt.fontWeight = arr[0];
                    }
                    if (!opt.fontSize) opt.fontSize = /pt/.test(arr[2]) ? parseInt(arr[2]) * 4/3 : parseInt(arr[2]);
                    if (!opt.fontFamily) opt.fontFamily = arr[3];
                }
            }
            delete opt.font;

            //line height
            if (typeof opt.lineHeight == 'string' && /%$/.test(opt.lineHeight)) {
                opt.lineHeight = (opt.fontSize || this.fontSize) * parseFloat(opt.lineHeight) / 100;
            }

            return opt;
        },
        _prepareTextOffset: function (opt) {
            if (typeof opt.textOffset == 'string') {
                var arr = opt.textOffset.split(' ');
                if (arr.length == 1) {
                    var k = parseFloat(arr[0]);
                    arr = [k, k, k, k];
                } else if (arr.length == 2) {
                    var l = parseFloat(arr[0]),
                        t = parseFloat(arr[1]);
                    arr = [t, l, t, l];
                } else if (arr.length == 3) {
                    var t = parseFloat(arr[0]),
                        r = parseFloat(arr[1]),
                        b = parseFloat(arr[2]),
                        l = r;
                    arr = [t, r, b, l];
                } else if (arr.length == 4) {
                    var t = parseFloat(arr[0]),
                        r = parseFloat(arr[1]),
                        b = parseFloat(arr[2]),
                        l = parseFloat(arr[3]);
                    arr = [t, r, b, l];
                }

                opt.textOffsetTop = arr[0];
                opt.textOffsetRight = arr[1];
                opt.textOffsetBottom = arr[2];
                opt.textOffsetLeft = arr[3];

                delete opt.textOffset;
            }
            return opt;
        },
        _render: function (dt) {
            this.supr(dt);
            typeof this.text == 'string' && this.text.length > 0 && this._drawText(dt);
        },
        _drawText: function (dt) {
            dt = dt || 0.016;
            var ctx = this.ctx,
                textCanvas = this._textCanvas,
                x = this.textOffsetLeft,
                y = this.textOffsetTop;

            if (this.verticalAlign == 'middle') {
                y += (textCanvas.height/2 - textCanvas._textWrapHeight/2);
            } else if (this.verticalAlign == 'bottom') {
                y += (textCanvas.height - textCanvas._textWrapHeight);
            }

            ctx.drawImage(textCanvas, 0, 0, textCanvas.width, textCanvas.height, x, y, textCanvas.width, textCanvas.height);
        },
        _updateTextCanvas: function () {
            if (typeof this.text == 'string' && this.text.length > 0) {
                var maxWidth = this.width - this.textOffsetLeft - this.textOffsetRight,
                    maxHeight = this.height - this.textOffsetTop - this.textOffsetBottom,
                    cvs = this._textCanvas,
                    ctx = this._textCtx,
                    text = this.text,
                    me = this;

                cvs.width = maxWidth;
                cvs.height = maxHeight; 
                ctx.font = [this.fontStyle, this.fontWeight, (this.fontSize + 'px'), this.fontFamily].join(' ');

                if (this.textType == 'stroke') {
                    ctx.strokeStyle = this.textColor;
                } else if (this.textType == 'fill') {
                    ctx.fillStyle = this.textColor;
                }

                var line = '',
                    x = 0,
                    y = this.fontSize + Math.max(0, (this.lineHeight-this.fontSize)/2),
                    lh = this.lineHeight;

                if (this.textAlign == 'left') {
                    ctx.textAlign = 'left';
                    x = 0;
                } else if (this.textAlign == 'center') {
                    ctx.textAlign = 'center';
                    x = maxWidth/2;
                } else if (this.textAlign == 'right') {
                    ctx.textAlign = 'right';
                    x = maxWidth;
                }

                function drawText () {
                    for (var i = 0, len = text.length; i < len; i ++) {
                        var testLine = line + text[i],
                            metrics = ctx.measureText(testLine);
                        //console.log(testLine, metrics.width)
                        if (metrics.width > maxWidth && i > 0) {
                            me.textType == 'stroke' ? ctx.strokeText(line, x, y) : ctx.fillText(line, x, y);
                            line = text[i] + '';
                            y += lh;
                        }
                        else {
                            line = testLine;
                        }
                    }
                    me.textType == 'stroke' ? ctx.strokeText(line, x, y) : ctx.fillText(line, x, y);    
                }
                 
                drawText();
                cvs._textWrapHeight = y + lh;
                
            }

        },
        setText: function (t) {
            if (t != undefined) {
                this.text = t;
                this._updateTextCanvas();
                return this;
            } else {
                return this.text;
            }
        }
    });

    return TextSprite;

})(KISSY,mods['cec/sprite/rectsprite']);
mods['cec/sprite/animsprite'] = (function (S, RectSprite) {
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

})(KISSY,mods['cec/sprite/rectsprite']);
mods['cec/sprite/pathsprite'] = (function (S, Sprite) {
	
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
        setLineWidth: function (w, autoRender) {
            return this.set({lineWidth: w}, autoRender);
        },
		setColor: function (c, autoRender) {
			return this.set({lineColor: c}, autoRender);
		},
        setPoint: function (i, p, autoRender) {
            if (i >= 0 && i < this.points.length) {
                this.points[i] = p;
            }
            this._updateBounding();
            autoRender && this.render();
            return this;
        },
        setPoints: function (pts, autoRender) {
            this.points = pts;
            autoRender && this.render();
            return this;
        }
	});

	return PathSprite;

})(KISSY,mods['cec/sprite/sprite']);
mods['cec/sprite/segmentsprite'] = (function (S, PathSprite) {
    
    var SegmentSprite = PathSprite.extend({
        initialize: function (options) {
            if (options.length > 0 && !options.points) {
                options.points = [[-options.length/2, 0], [options.length/2, 0]];
            }
            this.supr(options);

            this.normal = this.getNormal();
        },
        getLength: function () {
            return Math.sqrt(Math.pow(this.points[0][0] - this.points[1][0], 2) + Math.pow(this.points[0][1] - this.points[1][1], 2));
        },
        getNormal: function () {
            var l = this.getLength(),
                n = [this.points[1][0] - this.points[0][0], this.points[1][1] - this.points[0][1]];
            this.normal = [n[0]/l, n[1]/l];
            return this.normal;
        },
        setLength: function (l, autoRender) {
            var sp = this.points[0];
            this.points = [[sp[0], sp[1]], [sp[0] + l*this.normal[0], sp[1] + l*this.normal[1]]];
            autoRender && this.render();
            return this;
        },
        setPoint: function (i, p, autoRender) {
            this.supr(i, p, autoRender);
            this.getNormal();
            return this;
        }
    });

    return SegmentSprite;

})(KISSY,mods['cec/sprite/pathsprite']);
mods['cec/sprite/index'] = (function (S, Poly, Rect, Text, Anim, Path, Segment) {
    
    var Sprite = Poly;
    Sprite.Rect = Rect;
    Sprite.Text = Text;
    Sprite.Anim = Anim;
    Sprite.Path = Path;
    Sprite.Segment = Segment;

    return Sprite;
})(KISSY,mods['cec/sprite/sprite'],mods['cec/sprite/rectsprite'],mods['cec/sprite/textsprite'],mods['cec/sprite/animsprite'],mods['cec/sprite/pathsprite'],mods['cec/sprite/segmentsprite']);
mods['cec/sprite/stage'] = (function (S, RectSprite) {
	
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

})(KISSY,mods['cec/sprite/rectsprite']);
mods['cec/ticker/index'] = (function (S, Notifier) {
    
    var requestAnimFrame =  (function() {
      return window.requestAnimationFrame ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame ||
             window.oRequestAnimationFrame ||
             window.msRequestAnimationFrame ||
             function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
                setTimeout(callback, 1000/60);
             };
    })();

    var Ticker = Notifier.extend({
        initialize: function () {
            this._on = true;
            this._lastStepTime = (+new Date);
            this._loop();
            this.dt = 0.016;
        },
        _loop: function () {
            if (!this._on) { return }
            var me = this;
            requestAnimFrame(function () {
                me._loop();
            });

            var time = (+new Date),
                dt = (time - me._lastStepTime) / 1000;
            // get wrong 'dt' back
            if (dt >= 3) {
                dt = 1/30;
            }

            me.fire('tick', dt);
            me.dt = dt;
            me._lastStepTime = time;
        },
        stop: function () {
            this._on = false;
        },
        resume: function () {
            this._on = true;
            this._lastStepTime = (+new Date);
            this._loop();
        }

    });
    Ticker.singleton = new Ticker();

    return Ticker;

})(KISSY,mods['cec/notifier/index']);
mods['cec/tween/tween'] = (function () {
       
/**
 * @author sole / http://soledadpenades.com
 * @author mrdoob / http://mrdoob.com
 * @author Robert Eisele / http://www.xarg.org
 * @author Philippe / http://philippe.elsass.me
 * @author Robert Penner / http://www.robertpenner.com/easing_terms_of_use.html
 * @author Paul Lewis / http://www.aerotwist.com/
 * @author lechecacharro
 * @author Josh Faul / http://jocafa.com/
 * @author egraether / http://egraether.com/
 * @author endel / http://endel.me
 * @author Ben Delarre / http://delarre.net
 */

// Date.now shim for (ahem) Internet Explo(d|r)er
if ( Date.now === undefined ) {

        Date.now = function () {

                return new Date().valueOf();

        };

}

var TWEEN = TWEEN || ( function () {

        var _tweens = [];

        return {

                REVISION: '12',

                getAll: function () {

                        return _tweens;

                },

                removeAll: function () {

                        _tweens = [];

                },

                add: function ( tween ) {

                        _tweens.push( tween );

                },

                remove: function ( tween ) {

                        var i = _tweens.indexOf( tween );

                        if ( i !== -1 ) {

                                _tweens.splice( i, 1 );

                        }

                },

                update: function ( time ) {

                        if ( _tweens.length === 0 ) return false;

                        var i = 0;

                        time = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );

                        while ( i < _tweens.length ) {

                                if ( _tweens[ i ].update( time ) ) {

                                        i++;

                                } else {

                                        _tweens.splice( i, 1 );

                                }

                        }

                        return true;

                }
        };

} )();

TWEEN.Tween = function ( object ) {

        var _object = object;
        var _valuesStart = {};
        var _valuesEnd = {};
        var _valuesStartRepeat = {};
        var _duration = 1000;
        var _repeat = 0;
        var _yoyo = false;
        var _isPlaying = false;
        var _reversed = false;
        var _delayTime = 0;
        var _startTime = null;
        var _easingFunction = TWEEN.Easing.Linear.None;
        var _interpolationFunction = TWEEN.Interpolation.Linear;
        var _chainedTweens = [];
        var _onStartCallback = null;
        var _onStartCallbackFired = false;
        var _onUpdateCallback = null;
        var _onCompleteCallback = null;

        // Set all starting values present on the target object
        for ( var field in object ) {

                _valuesStart[ field ] = parseFloat(object[field], 10);

        }

        this.to = function ( properties, duration ) {

                if ( duration !== undefined ) {

                        _duration = duration;

                }

                _valuesEnd = properties;

                return this;

        };

        this.start = function ( time ) {

                TWEEN.add( this );

                _isPlaying = true;

                _onStartCallbackFired = false;

                _startTime = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
                _startTime += _delayTime;

                for ( var property in _valuesEnd ) {

                        // check if an Array was provided as property value
                        if ( _valuesEnd[ property ] instanceof Array ) {

                                if ( _valuesEnd[ property ].length === 0 ) {

                                        continue;

                                }

                                // create a local copy of the Array with the start value at the front
                                _valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

                        }

                        _valuesStart[ property ] = _object[ property ];

                        if( ( _valuesStart[ property ] instanceof Array ) === false ) {
                                _valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
                        }

                        _valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

                }

                return this;

        };

        this.stop = function () {

                if ( !_isPlaying ) {
                        return this;
                }

                TWEEN.remove( this );
                _isPlaying = false;
                this.stopChainedTweens();
                return this;

        };

        this.stopChainedTweens = function () {

                for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

                        _chainedTweens[ i ].stop();

                }

        };

        this.delay = function ( amount ) {

                _delayTime = amount;
                return this;

        };

        this.repeat = function ( times ) {

                _repeat = times;
                return this;

        };

        this.yoyo = function( yoyo ) {

                _yoyo = yoyo;
                return this;

        };


        this.easing = function ( easing ) {

                _easingFunction = easing;
                return this;

        };

        this.interpolation = function ( interpolation ) {

                _interpolationFunction = interpolation;
                return this;

        };

        this.chain = function () {

                _chainedTweens = arguments;
                return this;

        };

        this.onStart = function ( callback ) {

                _onStartCallback = callback;
                return this;

        };

        this.onUpdate = function ( callback ) {

                _onUpdateCallback = callback;
                return this;

        };

        this.onComplete = function ( callback ) {

                _onCompleteCallback = callback;
                return this;

        };

        this.update = function ( time ) {

                var property;

                if ( time < _startTime ) {

                        return true;

                }

                if ( _onStartCallbackFired === false ) {

                        if ( _onStartCallback !== null ) {

                                _onStartCallback.call( _object );

                        }

                        _onStartCallbackFired = true;

                }

                var elapsed = ( time - _startTime ) / _duration;
                elapsed = elapsed > 1 ? 1 : elapsed;

                var value = _easingFunction( elapsed );

                for ( property in _valuesEnd ) {

                        var start = _valuesStart[ property ] || 0;
                        var end = _valuesEnd[ property ];

                        if ( end instanceof Array ) {

                                _object[ property ] = _interpolationFunction( end, value );

                        } else {

                // Parses relative end values with start as base (e.g.: +10, -3)
                                if ( typeof(end) === "string" ) {
                                        end = start + parseFloat(end, 10);
                                }

                                // protect against non numeric properties.
                if ( typeof(end) === "number" ) {
                                        _object[ property ] = start + ( end - start ) * value;
                                }

                        }

                }

                if ( _onUpdateCallback !== null ) {

                        _onUpdateCallback.call( _object, value );

                }

                if ( elapsed == 1 ) {

                        if ( _repeat > 0 ) {

                                if( isFinite( _repeat ) ) {
                                        _repeat--;
                                }

                                // reassign starting values, restart by making startTime = now
                                for( property in _valuesStartRepeat ) {

                                        if ( typeof( _valuesEnd[ property ] ) === "string" ) {
                                                _valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
                                        }

                                        if (_yoyo) {
                                                var tmp = _valuesStartRepeat[ property ];
                                                _valuesStartRepeat[ property ] = _valuesEnd[ property ];
                                                _valuesEnd[ property ] = tmp;
                                                _reversed = !_reversed;
                                        }
                                        _valuesStart[ property ] = _valuesStartRepeat[ property ];

                                }

                                _startTime = time + _delayTime;

                                return true;

                        } else {

                                if ( _onCompleteCallback !== null ) {

                                        _onCompleteCallback.call( _object );

                                }

                                for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

                                        _chainedTweens[ i ].start( time );

                                }

                                return false;

                        }

                }

                return true;

        };

};


TWEEN.Easing = {

        Linear: {

                None: function ( k ) {

                        return k;

                }

        },

        Quadratic: {

                In: function ( k ) {

                        return k * k;

                },

                Out: function ( k ) {

                        return k * ( 2 - k );

                },

                InOut: function ( k ) {

                        if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
                        return - 0.5 * ( --k * ( k - 2 ) - 1 );

                }

        },

        Cubic: {

                In: function ( k ) {

                        return k * k * k;

                },

                Out: function ( k ) {

                        return --k * k * k + 1;

                },

                InOut: function ( k ) {

                        if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
                        return 0.5 * ( ( k -= 2 ) * k * k + 2 );

                }

        },

        Quartic: {

                In: function ( k ) {

                        return k * k * k * k;

                },

                Out: function ( k ) {

                        return 1 - ( --k * k * k * k );

                },

                InOut: function ( k ) {

                        if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
                        return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

                }

        },

        Quintic: {

                In: function ( k ) {

                        return k * k * k * k * k;

                },

                Out: function ( k ) {

                        return --k * k * k * k * k + 1;

                },

                InOut: function ( k ) {

                        if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
                        return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

                }

        },

        Sinusoidal: {

                In: function ( k ) {

                        return 1 - Math.cos( k * Math.PI / 2 );

                },

                Out: function ( k ) {

                        return Math.sin( k * Math.PI / 2 );

                },

                InOut: function ( k ) {

                        return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

                }

        },

        Exponential: {

                In: function ( k ) {

                        return k === 0 ? 0 : Math.pow( 1024, k - 1 );

                },

                Out: function ( k ) {

                        return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

                },

                InOut: function ( k ) {

                        if ( k === 0 ) return 0;
                        if ( k === 1 ) return 1;
                        if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
                        return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

                }

        },

        Circular: {

                In: function ( k ) {

                        return 1 - Math.sqrt( 1 - k * k );

                },

                Out: function ( k ) {

                        return Math.sqrt( 1 - ( --k * k ) );

                },

                InOut: function ( k ) {

                        if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
                        return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

                }

        },

        Elastic: {

                In: function ( k ) {

                        var s, a = 0.1, p = 0.4;
                        if ( k === 0 ) return 0;
                        if ( k === 1 ) return 1;
                        if ( !a || a < 1 ) { a = 1; s = p / 4; }
                        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
                        return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

                },

                Out: function ( k ) {

                        var s, a = 0.1, p = 0.4;
                        if ( k === 0 ) return 0;
                        if ( k === 1 ) return 1;
                        if ( !a || a < 1 ) { a = 1; s = p / 4; }
                        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
                        return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

                },

                InOut: function ( k ) {

                        var s, a = 0.1, p = 0.4;
                        if ( k === 0 ) return 0;
                        if ( k === 1 ) return 1;
                        if ( !a || a < 1 ) { a = 1; s = p / 4; }
                        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
                        if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
                        return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

                }

        },

        Back: {

                In: function ( k ) {

                        var s = 1.70158;
                        return k * k * ( ( s + 1 ) * k - s );

                },

                Out: function ( k ) {

                        var s = 1.70158;
                        return --k * k * ( ( s + 1 ) * k + s ) + 1;

                },

                InOut: function ( k ) {

                        var s = 1.70158 * 1.525;
                        if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
                        return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

                }

        },

        Bounce: {

                In: function ( k ) {

                        return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

                },

                Out: function ( k ) {

                        if ( k < ( 1 / 2.75 ) ) {

                                return 7.5625 * k * k;

                        } else if ( k < ( 2 / 2.75 ) ) {

                                return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

                        } else if ( k < ( 2.5 / 2.75 ) ) {

                                return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

                        } else {

                                return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

                        }

                },

                InOut: function ( k ) {

                        if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
                        return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

                }

        }

};

TWEEN.Interpolation = {

        Linear: function ( v, k ) {

                var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

                if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
                if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

                return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

        },

        Bezier: function ( v, k ) {

                var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

                for ( i = 0; i <= n; i++ ) {
                        b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
                }

                return b;

        },

        CatmullRom: function ( v, k ) {

                var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

                if ( v[ 0 ] === v[ m ] ) {

                        if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

                        return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

                } else {

                        if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
                        if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

                        return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

                }

        },

        Utils: {

                Linear: function ( p0, p1, t ) {

                        return ( p1 - p0 ) * t + p0;

                },

                Bernstein: function ( n , i ) {

                        var fc = TWEEN.Interpolation.Utils.Factorial;
                        return fc( n ) / fc( i ) / fc( n - i );

                },

                Factorial: ( function () {

                        var a = [ 1 ];

                        return function ( n ) {

                                var s = 1, i;
                                if ( a[ n ] ) return a[ n ];
                                for ( i = n; i > 1; i-- ) s *= i;
                                return a[ n ] = s;

                        };

                } )(),

                CatmullRom: function ( p0, p1, p2, p3, t ) {

                        var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
                        return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

                }

        }

};

    return TWEEN;

})(KISSY);
mods['cec/cec'] = (function (S, Loader, Sprite, Stage, Ticker, Notifier, TWEEN) {
    
    var CEC = {};
    CEC.Loader = Loader;
    CEC.Stage = Stage;
    CEC.Sprite = Sprite;
    CEC.Ticker = Ticker;
    CEC.Notifier = Notifier;
    CEC.TWEEN = TWEEN;

    //loader belongto
    CEC.Loader.belongto(CEC.Sprite);

    return CEC;

})(KISSY,mods['cec/loader/index'],mods['cec/sprite/index'],mods['cec/sprite/stage'],mods['cec/ticker/index'],mods['cec/notifier/index'],mods['cec/tween/tween']);
CEC = mods['cec/cec']; 

})();
/*
 * Raphael 1.5.2 - JavaScript Vector Library
 *
 * Copyright (c) 2010 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://raphaeljs.com/license.html) license.
 */

var Raphael;
(function(){function a(){if(a.is(arguments[0],G)){var b=arguments[0],d=bV[m](a,b.splice(0,3+a.is(b[0],E))),e=d.set();for(var g=0,h=b[w];g<h;g++){var i=b[g]||{};c[f](i.type)&&e[L](d[i.type]().attr(i))}return e}return bV[m](a,arguments)}a.version="1.5.2";var b=/[, ]+/,c={circle:1,rect:1,path:1,ellipse:1,text:1,image:1},d=/\{(\d+)\}/g,e="prototype",f="hasOwnProperty",g=document,h=window,i={was:Object[e][f].call(h,"Raphael"),is:h.Raphael},j=function(){this.customAttributes={}},k,l="appendChild",m="apply",n="concat",o="createTouch"in g,p="",q=" ",r=String,s="split",t="click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend orientationchange touchcancel gesturestart gesturechange gestureend"[s](q),u={mousedown:"touchstart",mousemove:"touchmove",mouseup:"touchend"},v="join",w="length",x=r[e].toLowerCase,y=Math,z=y.max,A=y.min,B=y.abs,C=y.pow,D=y.PI,E="number",F="string",G="array",H="toString",I="fill",J=Object[e][H],K={},L="push",M=/^url\(['"]?([^\)]+?)['"]?\)$/i,N=/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,O={"NaN":1,Infinity:1,"-Infinity":1},P=/^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,Q=y.round,R="setAttribute",S=parseFloat,T=parseInt,U=" progid:DXImageTransform.Microsoft",V=r[e].toUpperCase,W={blur:0,"clip-rect":"0 0 1e9 1e9",cursor:"default",cx:0,cy:0,fill:"#fff","fill-opacity":1,font:"10px \"Arial\"","font-family":"\"Arial\"","font-size":"10","font-style":"normal","font-weight":400,gradient:0,height:0,href:"http://raphaeljs.com/",opacity:1,path:"M0,0",r:0,rotation:0,rx:0,ry:0,scale:"1 1",src:"",stroke:"#000","stroke-dasharray":"","stroke-linecap":"butt","stroke-linejoin":"butt","stroke-miterlimit":0,"stroke-opacity":1,"stroke-width":1,target:"_blank","text-anchor":"middle",title:"Raphael",translation:"0 0",width:0,x:0,y:0},X={along:"along",blur:E,"clip-rect":"csv",cx:E,cy:E,fill:"colour","fill-opacity":E,"font-size":E,height:E,opacity:E,path:"path",r:E,rotation:"csv",rx:E,ry:E,scale:"csv",stroke:"colour","stroke-opacity":E,"stroke-width":E,translation:"csv",width:E,x:E,y:E},Y="replace",Z=/^(from|to|\d+%?)$/,$=/\s*,\s*/,_={hs:1,rg:1},ba=/,?([achlmqrstvxz]),?/gi,bb=/([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,bc=/(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,bd=/^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,be=function(a,b){return a.key-b.key};a.type=h.SVGAngle||g.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")?"SVG":"VML";if(a.type=="VML"){var bf=g.createElement("div"),bg;bf.innerHTML="<v:shape adj=\"1\"/>";bg=bf.firstChild;bg.style.behavior="url(#default#VML)";if(!(bg&&typeof bg.adj=="object"))return a.type=null;bf=null}a.svg=!(a.vml=a.type=="VML");j[e]=a[e];k=j[e];a._id=0;a._oid=0;a.fn={};a.is=function(a,b){b=x.call(b);if(b=="finite")return!O[f](+a);return b=="null"&&a===null||b==typeof a||b=="object"&&a===Object(a)||b=="array"&&Array.isArray&&Array.isArray(a)||J.call(a).slice(8,-1).toLowerCase()==b};a.angle=function(b,c,d,e,f,g){{if(f==null){var h=b-d,i=c-e;if(!h&&!i)return 0;return((h<0)*180+y.atan(-i/-h)*180/D+360)%360}return a.angle(b,c,f,g)-a.angle(d,e,f,g)}};a.rad=function(a){return a%360*D/180};a.deg=function(a){return a*180/D%360};a.snapTo=function(b,c,d){d=a.is(d,"finite")?d:10;if(a.is(b,G)){var e=b.length;while(e--)if(B(b[e]-c)<=d)return b[e]}else{b=+b;var f=c%b;if(f<d)return c-f;if(f>b-d)return c-f+b}return c};function bh(){var a=[],b=0;for(;b<32;b++)a[b]=(~(~(y.random()*16)))[H](16);a[12]=4;a[16]=(a[16]&3|8)[H](16);return"r-"+a[v]("")}a.setWindow=function(a){h=a;g=h.document};var bi=function(b){if(a.vml){var c=/^\s+|\s+$/g,d;try{var e=new ActiveXObject("htmlfile");e.write("<body>");e.close();d=e.body}catch(a){d=createPopup().document.body}var f=d.createTextRange();bi=bm(function(a){try{d.style.color=r(a)[Y](c,p);var b=f.queryCommandValue("ForeColor");b=(b&255)<<16|b&65280|(b&16711680)>>>16;return"#"+("000000"+b[H](16)).slice(-6)}catch(a){return"none"}})}else{var h=g.createElement("i");h.title="Raphaël Colour Picker";h.style.display="none";g.body[l](h);bi=bm(function(a){h.style.color=a;return g.defaultView.getComputedStyle(h,p).getPropertyValue("color")})}return bi(b)},bj=function(){return"hsb("+[this.h,this.s,this.b]+")"},bk=function(){return"hsl("+[this.h,this.s,this.l]+")"},bl=function(){return this.hex};a.hsb2rgb=function(b,c,d,e){if(a.is(b,"object")&&"h"in b&&"s"in b&&"b"in b){d=b.b;c=b.s;b=b.h;e=b.o}return a.hsl2rgb(b,c,d/2,e)};a.hsl2rgb=function(b,c,d,e){if(a.is(b,"object")&&"h"in b&&"s"in b&&"l"in b){d=b.l;c=b.s;b=b.h}if(b>1||c>1||d>1){b/=360;c/=100;d/=100}var f={},g=["r","g","b"],h,i,j,k,l,m;if(c){d<0.5?h=d*(1+c):h=d+c-d*c;i=2*d-h;for(var n=0;n<3;n++){j=b+1/3*-(n-1);j<0&&j++;j>1&&j--;j*6<1?f[g[n]]=i+(h-i)*6*j:j*2<1?f[g[n]]=h:j*3<2?f[g[n]]=i+(h-i)*(2/3-j)*6:f[g[n]]=i}}else f={r:d,g:d,b:d};f.r*=255;f.g*=255;f.b*=255;f.hex="#"+(16777216|f.b|f.g<<8|f.r<<16).toString(16).slice(1);a.is(e,"finite")&&(f.opacity=e);f.toString=bl;return f};a.rgb2hsb=function(b,c,d){if(c==null&&a.is(b,"object")&&"r"in b&&"g"in b&&"b"in b){d=b.b;c=b.g;b=b.r}if(c==null&&a.is(b,F)){var e=a.getRGB(b);b=e.r;c=e.g;d=e.b}if(b>1||c>1||d>1){b/=255;c/=255;d/=255}var f=z(b,c,d),g=A(b,c,d),h,i,j=f;{if(g==f)return{h:0,s:0,b:f,toString:bj};var k=f-g;i=k/f;b==f?h=(c-d)/k:c==f?h=2+(d-b)/k:h=4+(b-c)/k;h/=6;h<0&&h++;h>1&&h--}return{h:h,s:i,b:j,toString:bj}};a.rgb2hsl=function(b,c,d){if(c==null&&a.is(b,"object")&&"r"in b&&"g"in b&&"b"in b){d=b.b;c=b.g;b=b.r}if(c==null&&a.is(b,F)){var e=a.getRGB(b);b=e.r;c=e.g;d=e.b}if(b>1||c>1||d>1){b/=255;c/=255;d/=255}var f=z(b,c,d),g=A(b,c,d),h,i,j=(f+g)/2,k;if(g==f)k={h:0,s:0,l:j};else{var l=f-g;i=j<0.5?l/(f+g):l/(2-f-g);b==f?h=(c-d)/l:c==f?h=2+(d-b)/l:h=4+(b-c)/l;h/=6;h<0&&h++;h>1&&h--;k={h:h,s:i,l:j}}k.toString=bk;return k};a._path2string=function(){return this.join(",")[Y](ba,"$1")};function bm(a,b,c){function d(){var g=Array[e].slice.call(arguments,0),h=g[v]("►"),i=d.cache=d.cache||{},j=d.count=d.count||[];if(i[f](h))return c?c(i[h]):i[h];j[w]>=1000&&delete i[j.shift()];j[L](h);i[h]=a[m](b,g);return c?c(i[h]):i[h]}return d}a.getRGB=bm(function(b){if(!b||!(!((b=r(b)).indexOf("-")+1)))return{r:-1,g:-1,b:-1,hex:"none",error:1};if(b=="none")return{r:-1,g:-1,b:-1,hex:"none"};!(_[f](b.toLowerCase().substring(0,2))||b.charAt()=="#")&&(b=bi(b));var c,d,e,g,h,i,j,k=b.match(N);if(k){if(k[2]){g=T(k[2].substring(5),16);e=T(k[2].substring(3,5),16);d=T(k[2].substring(1,3),16)}if(k[3]){g=T((i=k[3].charAt(3))+i,16);e=T((i=k[3].charAt(2))+i,16);d=T((i=k[3].charAt(1))+i,16)}if(k[4]){j=k[4][s]($);d=S(j[0]);j[0].slice(-1)=="%"&&(d*=2.55);e=S(j[1]);j[1].slice(-1)=="%"&&(e*=2.55);g=S(j[2]);j[2].slice(-1)=="%"&&(g*=2.55);k[1].toLowerCase().slice(0,4)=="rgba"&&(h=S(j[3]));j[3]&&j[3].slice(-1)=="%"&&(h/=100)}if(k[5]){j=k[5][s]($);d=S(j[0]);j[0].slice(-1)=="%"&&(d*=2.55);e=S(j[1]);j[1].slice(-1)=="%"&&(e*=2.55);g=S(j[2]);j[2].slice(-1)=="%"&&(g*=2.55);(j[0].slice(-3)=="deg"||j[0].slice(-1)=="°")&&(d/=360);k[1].toLowerCase().slice(0,4)=="hsba"&&(h=S(j[3]));j[3]&&j[3].slice(-1)=="%"&&(h/=100);return a.hsb2rgb(d,e,g,h)}if(k[6]){j=k[6][s]($);d=S(j[0]);j[0].slice(-1)=="%"&&(d*=2.55);e=S(j[1]);j[1].slice(-1)=="%"&&(e*=2.55);g=S(j[2]);j[2].slice(-1)=="%"&&(g*=2.55);(j[0].slice(-3)=="deg"||j[0].slice(-1)=="°")&&(d/=360);k[1].toLowerCase().slice(0,4)=="hsla"&&(h=S(j[3]));j[3]&&j[3].slice(-1)=="%"&&(h/=100);return a.hsl2rgb(d,e,g,h)}k={r:d,g:e,b:g};k.hex="#"+(16777216|g|e<<8|d<<16).toString(16).slice(1);a.is(h,"finite")&&(k.opacity=h);return k}return{r:-1,g:-1,b:-1,hex:"none",error:1}},a);a.getColor=function(a){var b=this.getColor.start=this.getColor.start||{h:0,s:1,b:a||0.75},c=this.hsb2rgb(b.h,b.s,b.b);b.h+=0.075;if(b.h>1){b.h=0;b.s-=0.2;b.s<=0&&(this.getColor.start={h:0,s:1,b:b.b})}return c.hex};a.getColor.reset=function(){delete this.start};a.parsePathString=bm(function(b){if(!b)return null;var c={a:7,c:6,h:1,l:2,m:2,q:4,s:4,t:2,v:1,z:0},d=[];a.is(b,G)&&a.is(b[0],G)&&(d=bo(b));d[w]||r(b)[Y](bb,function(a,b,e){var f=[],g=x.call(b);e[Y](bc,function(a,b){b&&f[L](+b)});if(g=="m"&&f[w]>2){d[L]([b][n](f.splice(0,2)));g="l";b=b=="m"?"l":"L"}while(f[w]>=c[g]){d[L]([b][n](f.splice(0,c[g])));if(!c[g])break}});d[H]=a._path2string;return d});a.findDotsAtSegment=function(a,b,c,d,e,f,g,h,i){var j=1-i,k=C(j,3)*a+C(j,2)*3*i*c+j*3*i*i*e+C(i,3)*g,l=C(j,3)*b+C(j,2)*3*i*d+j*3*i*i*f+C(i,3)*h,m=a+2*i*(c-a)+i*i*(e-2*c+a),n=b+2*i*(d-b)+i*i*(f-2*d+b),o=c+2*i*(e-c)+i*i*(g-2*e+c),p=d+2*i*(f-d)+i*i*(h-2*f+d),q=(1-i)*a+i*c,r=(1-i)*b+i*d,s=(1-i)*e+i*g,t=(1-i)*f+i*h,u=90-y.atan((m-o)/(n-p))*180/D;(m>o||n<p)&&(u+=180);return{x:k,y:l,m:{x:m,y:n},n:{x:o,y:p},start:{x:q,y:r},end:{x:s,y:t},alpha:u}};var bn=bm(function(a){if(!a)return{x:0,y:0,width:0,height:0};a=bw(a);var b=0,c=0,d=[],e=[],f;for(var g=0,h=a[w];g<h;g++){f=a[g];if(f[0]=="M"){b=f[1];c=f[2];d[L](b);e[L](c)}else{var i=bv(b,c,f[1],f[2],f[3],f[4],f[5],f[6]);d=d[n](i.min.x,i.max.x);e=e[n](i.min.y,i.max.y);b=f[5];c=f[6]}}var j=A[m](0,d),k=A[m](0,e);return{x:j,y:k,width:z[m](0,d)-j,height:z[m](0,e)-k}}),bo=function(b){var c=[];if(!a.is(b,G)||!a.is(b&&b[0],G))b=a.parsePathString(b);for(var d=0,e=b[w];d<e;d++){c[d]=[];for(var f=0,g=b[d][w];f<g;f++)c[d][f]=b[d][f]}c[H]=a._path2string;return c},bp=bm(function(b){if(!a.is(b,G)||!a.is(b&&b[0],G))b=a.parsePathString(b);var c=[],d=0,e=0,f=0,g=0,h=0;if(b[0][0]=="M"){d=b[0][1];e=b[0][2];f=d;g=e;h++;c[L](["M",d,e])}for(var i=h,j=b[w];i<j;i++){var k=c[i]=[],l=b[i];if(l[0]!=x.call(l[0])){k[0]=x.call(l[0]);switch(k[0]){case"a":k[1]=l[1];k[2]=l[2];k[3]=l[3];k[4]=l[4];k[5]=l[5];k[6]=+(l[6]-d).toFixed(3);k[7]=+(l[7]-e).toFixed(3);break;case"v":k[1]=+(l[1]-e).toFixed(3);break;case"m":f=l[1];g=l[2];default:for(var m=1,n=l[w];m<n;m++)k[m]=+(l[m]-(m%2?d:e)).toFixed(3)}}else{k=c[i]=[];if(l[0]=="m"){f=l[1]+d;g=l[2]+e}for(var o=0,p=l[w];o<p;o++)c[i][o]=l[o]}var q=c[i][w];switch(c[i][0]){case"z":d=f;e=g;break;case"h":d+=+c[i][q-1];break;case"v":e+=+c[i][q-1];break;default:d+=+c[i][q-2];e+=+c[i][q-1]}}c[H]=a._path2string;return c},0,bo),bq=bm(function(b){if(!a.is(b,G)||!a.is(b&&b[0],G))b=a.parsePathString(b);var c=[],d=0,e=0,f=0,g=0,h=0;if(b[0][0]=="M"){d=+b[0][1];e=+b[0][2];f=d;g=e;h++;c[0]=["M",d,e]}for(var i=h,j=b[w];i<j;i++){var k=c[i]=[],l=b[i];if(l[0]!=V.call(l[0])){k[0]=V.call(l[0]);switch(k[0]){case"A":k[1]=l[1];k[2]=l[2];k[3]=l[3];k[4]=l[4];k[5]=l[5];k[6]=+(l[6]+d);k[7]=+(l[7]+e);break;case"V":k[1]=+l[1]+e;break;case"H":k[1]=+l[1]+d;break;case"M":f=+l[1]+d;g=+l[2]+e;default:for(var m=1,n=l[w];m<n;m++)k[m]=+l[m]+(m%2?d:e)}}else for(var o=0,p=l[w];o<p;o++)c[i][o]=l[o];switch(k[0]){case"Z":d=f;e=g;break;case"H":d=k[1];break;case"V":e=k[1];break;case"M":f=c[i][c[i][w]-2];g=c[i][c[i][w]-1];default:d=c[i][c[i][w]-2];e=c[i][c[i][w]-1]}}c[H]=a._path2string;return c},null,bo),br=function(a,b,c,d){return[a,b,c,d,c,d]},bs=function(a,b,c,d,e,f){var g=1/3,h=2/3;return[g*a+h*c,g*b+h*d,g*e+h*c,g*f+h*d,e,f]},bt=function(a,b,c,d,e,f,g,h,i,j){var k=D*120/180,l=D/180*(+e||0),m=[],o,p=bm(function(a,b,c){var d=a*y.cos(c)-b*y.sin(c),e=a*y.sin(c)+b*y.cos(c);return{x:d,y:e}});if(j){G=j[0];H=j[1];E=j[2];F=j[3]}else{o=p(a,b,-l);a=o.x;b=o.y;o=p(h,i,-l);h=o.x;i=o.y;var q=y.cos(D/180*e),r=y.sin(D/180*e),t=(a-h)/2,u=(b-i)/2,x=t*t/(c*c)+u*u/(d*d);if(x>1){x=y.sqrt(x);c=x*c;d=x*d}var z=c*c,A=d*d,C=(f==g?-1:1)*y.sqrt(B((z*A-z*u*u-A*t*t)/(z*u*u+A*t*t))),E=C*c*u/d+(a+h)/2,F=C*-d*t/c+(b+i)/2,G=y.asin(((b-F)/d).toFixed(9)),H=y.asin(((i-F)/d).toFixed(9));G=a<E?D-G:G;H=h<E?D-H:H;G<0&&(G=D*2+G);H<0&&(H=D*2+H);g&&G>H&&(G=G-D*2);!g&&H>G&&(H=H-D*2)}var I=H-G;if(B(I)>k){var J=H,K=h,L=i;H=G+k*(g&&H>G?1:-1);h=E+c*y.cos(H);i=F+d*y.sin(H);m=bt(h,i,c,d,e,0,g,K,L,[H,J,E,F])}I=H-G;var M=y.cos(G),N=y.sin(G),O=y.cos(H),P=y.sin(H),Q=y.tan(I/4),R=4/3*c*Q,S=4/3*d*Q,T=[a,b],U=[a+R*N,b-S*M],V=[h+R*P,i-S*O],W=[h,i];U[0]=2*T[0]-U[0];U[1]=2*T[1]-U[1];{if(j)return[U,V,W][n](m);m=[U,V,W][n](m)[v]()[s](",");var X=[];for(var Y=0,Z=m[w];Y<Z;Y++)X[Y]=Y%2?p(m[Y-1],m[Y],l).y:p(m[Y],m[Y+1],l).x;return X}},bu=function(a,b,c,d,e,f,g,h,i){var j=1-i;return{x:C(j,3)*a+C(j,2)*3*i*c+j*3*i*i*e+C(i,3)*g,y:C(j,3)*b+C(j,2)*3*i*d+j*3*i*i*f+C(i,3)*h}},bv=bm(function(a,b,c,d,e,f,g,h){var i=e-2*c+a-(g-2*e+c),j=2*(c-a)-2*(e-c),k=a-c,l=(-j+y.sqrt(j*j-4*i*k))/2/i,n=(-j-y.sqrt(j*j-4*i*k))/2/i,o=[b,h],p=[a,g],q;B(l)>"1e12"&&(l=0.5);B(n)>"1e12"&&(n=0.5);if(l>0&&l<1){q=bu(a,b,c,d,e,f,g,h,l);p[L](q.x);o[L](q.y)}if(n>0&&n<1){q=bu(a,b,c,d,e,f,g,h,n);p[L](q.x);o[L](q.y)}i=f-2*d+b-(h-2*f+d);j=2*(d-b)-2*(f-d);k=b-d;l=(-j+y.sqrt(j*j-4*i*k))/2/i;n=(-j-y.sqrt(j*j-4*i*k))/2/i;B(l)>"1e12"&&(l=0.5);B(n)>"1e12"&&(n=0.5);if(l>0&&l<1){q=bu(a,b,c,d,e,f,g,h,l);p[L](q.x);o[L](q.y)}if(n>0&&n<1){q=bu(a,b,c,d,e,f,g,h,n);p[L](q.x);o[L](q.y)}return{min:{x:A[m](0,p),y:A[m](0,o)},max:{x:z[m](0,p),y:z[m](0,o)}}}),bw=bm(function(a,b){var c=bq(a),d=b&&bq(b),e={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},f={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},g=function(a,b){var c,d;if(!a)return["C",b.x,b.y,b.x,b.y,b.x,b.y];!(a[0]in{T:1,Q:1})&&(b.qx=b.qy=null);switch(a[0]){case"M":b.X=a[1];b.Y=a[2];break;case"A":a=["C"][n](bt[m](0,[b.x,b.y][n](a.slice(1))));break;case"S":c=b.x+(b.x-(b.bx||b.x));d=b.y+(b.y-(b.by||b.y));a=["C",c,d][n](a.slice(1));break;case"T":b.qx=b.x+(b.x-(b.qx||b.x));b.qy=b.y+(b.y-(b.qy||b.y));a=["C"][n](bs(b.x,b.y,b.qx,b.qy,a[1],a[2]));break;case"Q":b.qx=a[1];b.qy=a[2];a=["C"][n](bs(b.x,b.y,a[1],a[2],a[3],a[4]));break;case"L":a=["C"][n](br(b.x,b.y,a[1],a[2]));break;case"H":a=["C"][n](br(b.x,b.y,a[1],b.y));break;case"V":a=["C"][n](br(b.x,b.y,b.x,a[1]));break;case"Z":a=["C"][n](br(b.x,b.y,b.X,b.Y));break}return a},h=function(a,b){if(a[b][w]>7){a[b].shift();var e=a[b];while(e[w])a.splice(b++,0,["C"][n](e.splice(0,6)));a.splice(b,1);k=z(c[w],d&&d[w]||0)}},i=function(a,b,e,f,g){if(a&&b&&a[g][0]=="M"&&b[g][0]!="M"){b.splice(g,0,["M",f.x,f.y]);e.bx=0;e.by=0;e.x=a[g][1];e.y=a[g][2];k=z(c[w],d&&d[w]||0)}};for(var j=0,k=z(c[w],d&&d[w]||0);j<k;j++){c[j]=g(c[j],e);h(c,j);d&&(d[j]=g(d[j],f));d&&h(d,j);i(c,d,e,f,j);i(d,c,f,e,j);var l=c[j],o=d&&d[j],p=l[w],q=d&&o[w];e.x=l[p-2];e.y=l[p-1];e.bx=S(l[p-4])||e.x;e.by=S(l[p-3])||e.y;f.bx=d&&(S(o[q-4])||f.x);f.by=d&&(S(o[q-3])||f.y);f.x=d&&o[q-2];f.y=d&&o[q-1]}return d?[c,d]:c},null,bo),bx=bm(function(b){var c=[];for(var d=0,e=b[w];d<e;d++){var f={},g=b[d].match(/^([^:]*):?([\d\.]*)/);f.color=a.getRGB(g[1]);if(f.color.error)return null;f.color=f.color.hex;g[2]&&(f.offset=g[2]+"%");c[L](f)}for(d=1,e=c[w]-1;d<e;d++){if(!c[d].offset){var h=S(c[d-1].offset||0),i=0;for(var j=d+1;j<e;j++){if(c[j].offset){i=c[j].offset;break}}if(!i){i=100;j=e}i=S(i);var k=(i-h)/(j-d+1);for(;d<j;d++){h+=k;c[d].offset=h+"%"}}}return c}),by=function(b,c,d,e){var f;if(a.is(b,F)||a.is(b,"object")){f=a.is(b,F)?g.getElementById(b):b;if(f.tagName)return c==null?{container:f,width:f.style.pixelWidth||f.offsetWidth,height:f.style.pixelHeight||f.offsetHeight}:{container:f,width:c,height:d}}else return{container:1,x:b,y:c,width:d,height:e}},bz=function(a,b){var c=this;for(var d in b){if(b[f](d)&&!(d in a))switch(typeof b[d]){case"function":(function(b){a[d]=a===c?b:function(){return b[m](c,arguments)}})(b[d]);break;case"object":a[d]=a[d]||{};bz.call(this,a[d],b[d]);break;default:a[d]=b[d];break}}},bA=function(a,b){a==b.top&&(b.top=a.prev);a==b.bottom&&(b.bottom=a.next);a.next&&(a.next.prev=a.prev);a.prev&&(a.prev.next=a.next)},bB=function(a,b){if(b.top===a)return;bA(a,b);a.next=null;a.prev=b.top;b.top.next=a;b.top=a},bC=function(a,b){if(b.bottom===a)return;bA(a,b);a.next=b.bottom;a.prev=null;b.bottom.prev=a;b.bottom=a},bD=function(a,b,c){bA(a,c);b==c.top&&(c.top=a);b.next&&(b.next.prev=a);a.next=b.next;a.prev=b;b.next=a},bE=function(a,b,c){bA(a,c);b==c.bottom&&(c.bottom=a);b.prev&&(b.prev.next=a);a.prev=b.prev;b.prev=a;a.next=b},bF=function(a){return function(){throw new Error("Raphaël: you are calling to method “"+a+"” of removed object")}};a.pathToRelative=bp;if(a.svg){k.svgns="http://www.w3.org/2000/svg";k.xlink="http://www.w3.org/1999/xlink";Q=function(a){return+a+(~(~a)===a)*0.5};var bG=function(a,b){if(b)for(var c in b)b[f](c)&&a[R](c,r(b[c]));else{a=g.createElementNS(k.svgns,a);a.style.webkitTapHighlightColor="rgba(0,0,0,0)";return a}};a[H]=function(){return"Your browser supports SVG.\nYou are running Raphaël "+this.version};var bH=function(a,b){var c=bG("path");b.canvas&&b.canvas[l](c);var d=new bN(c,b);d.type="path";bK(d,{fill:"none",stroke:"#000",path:a});return d},bI=function(a,b,c){var d="linear",e=0.5,f=0.5,h=a.style;b=r(b)[Y](bd,function(a,b,c){d="radial";if(b&&c){e=S(b);f=S(c);var g=(f>0.5)*2-1;C(e-0.5,2)+C(f-0.5,2)>0.25&&(f=y.sqrt(0.25-C(e-0.5,2))*g+0.5)&&f!=0.5&&(f=f.toFixed(5)-0.00001*g)}return p});b=b[s](/\s*\-\s*/);if(d=="linear"){var i=b.shift();i=-S(i);if(isNaN(i))return null;var j=[0,0,y.cos(i*D/180),y.sin(i*D/180)],k=1/(z(B(j[2]),B(j[3]))||1);j[2]*=k;j[3]*=k;if(j[2]<0){j[0]=-j[2];j[2]=0}if(j[3]<0){j[1]=-j[3];j[3]=0}}var m=bx(b);if(!m)return null;var n=a.getAttribute(I);n=n.match(/^url\(#(.*)\)$/);n&&c.defs.removeChild(g.getElementById(n[1]));var o=bG(d+"Gradient");o.id=bh();bG(o,d=="radial"?{fx:e,fy:f}:{x1:j[0],y1:j[1],x2:j[2],y2:j[3]});c.defs[l](o);for(var q=0,t=m[w];q<t;q++){var u=bG("stop");bG(u,{offset:m[q].offset?m[q].offset:q?"100%":"0%","stop-color":m[q].color||"#fff"});o[l](u)}bG(a,{fill:"url(#"+o.id+")",opacity:1,"fill-opacity":1});h.fill=p;h.opacity=1;h.fillOpacity=1;return 1},bJ=function(b){var c=b.getBBox();bG(b.pattern,{patternTransform:a.format("translate({0},{1})",c.x,c.y)})},bK=function(c,d){var e={"":[0],none:[0],"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},h=c.node,i=c.attrs,j=c.rotate(),k=function(a,b){b=e[x.call(b)];if(b){var c=a.attrs["stroke-width"]||"1",f=({round:c,square:c,butt:0})[a.attrs["stroke-linecap"]||d["stroke-linecap"]]||0,g=[],i=b[w];while(i--)g[i]=b[i]*c+(i%2?1:-1)*f;bG(h,{"stroke-dasharray":g[v](",")})}};d[f]("rotation")&&(j=d.rotation);var m=r(j)[s](b);if(m.length-1){m[1]=+m[1];m[2]=+m[2]}else m=null;S(j)&&c.rotate(0,true);for(var n in d){if(d[f](n)){if(!W[f](n))continue;var o=d[n];i[n]=o;switch(n){case"blur":c.blur(o);break;case"rotation":c.rotate(o,true);break;case"href":case"title":case"target":var t=h.parentNode;if(x.call(t.tagName)!="a"){var u=bG("a");t.insertBefore(u,h);u[l](h);t=u}n=="target"&&o=="blank"?t.setAttributeNS(c.paper.xlink,"show","new"):t.setAttributeNS(c.paper.xlink,n,o);break;case"cursor":h.style.cursor=o;break;case"clip-rect":var y=r(o)[s](b);if(y[w]==4){c.clip&&c.clip.parentNode.parentNode.removeChild(c.clip.parentNode);var z=bG("clipPath"),A=bG("rect");z.id=bh();bG(A,{x:y[0],y:y[1],width:y[2],height:y[3]});z[l](A);c.paper.defs[l](z);bG(h,{"clip-path":"url(#"+z.id+")"});c.clip=A}if(!o){var B=g.getElementById(h.getAttribute("clip-path")[Y](/(^url\(#|\)$)/g,p));B&&B.parentNode.removeChild(B);bG(h,{"clip-path":p});delete c.clip}break;case"path":c.type=="path"&&bG(h,{d:o?i.path=bq(o):"M0,0"});break;case"width":h[R](n,o);if(i.fx){n="x";o=i.x}else break;case"x":i.fx&&(o=-i.x-(i.width||0));case"rx":if(n=="rx"&&c.type=="rect")break;case"cx":m&&(n=="x"||n=="cx")&&(m[1]+=o-i[n]);h[R](n,o);c.pattern&&bJ(c);break;case"height":h[R](n,o);if(i.fy){n="y";o=i.y}else break;case"y":i.fy&&(o=-i.y-(i.height||0));case"ry":if(n=="ry"&&c.type=="rect")break;case"cy":m&&(n=="y"||n=="cy")&&(m[2]+=o-i[n]);h[R](n,o);c.pattern&&bJ(c);break;case"r":c.type=="rect"?bG(h,{rx:o,ry:o}):h[R](n,o);break;case"src":c.type=="image"&&h.setAttributeNS(c.paper.xlink,"href",o);break;case"stroke-width":h.style.strokeWidth=o;h[R](n,o);i["stroke-dasharray"]&&k(c,i["stroke-dasharray"]);break;case"stroke-dasharray":k(c,o);break;case"translation":var C=r(o)[s](b);C[0]=+C[0]||0;C[1]=+C[1]||0;if(m){m[1]+=C[0];m[2]+=C[1]}cz.call(c,C[0],C[1]);break;case"scale":C=r(o)[s](b);c.scale(+C[0]||1,+C[1]||+C[0]||1,isNaN(S(C[2]))?null:+C[2],isNaN(S(C[3]))?null:+C[3]);break;case I:var D=r(o).match(M);if(D){z=bG("pattern");var E=bG("image");z.id=bh();bG(z,{x:0,y:0,patternUnits:"userSpaceOnUse",height:1,width:1});bG(E,{x:0,y:0});E.setAttributeNS(c.paper.xlink,"href",D[1]);z[l](E);var F=g.createElement("img");F.style.cssText="position:absolute;left:-9999em;top-9999em";F.onload=function(){bG(z,{width:this.offsetWidth,height:this.offsetHeight});bG(E,{width:this.offsetWidth,height:this.offsetHeight});g.body.removeChild(this);c.paper.safari()};g.body[l](F);F.src=D[1];c.paper.defs[l](z);h.style.fill="url(#"+z.id+")";bG(h,{fill:"url(#"+z.id+")"});c.pattern=z;c.pattern&&bJ(c);break}var G=a.getRGB(o);if(G.error)if((({circle:1,ellipse:1})[f](c.type)||r(o).charAt()!="r")&&bI(h,o,c.paper)){i.gradient=o;i.fill="none";break}else{delete d.gradient;delete i.gradient;!a.is(i.opacity,"undefined")&&a.is(d.opacity,"undefined")&&bG(h,{opacity:i.opacity});!a.is(i["fill-opacity"],"undefined")&&a.is(d["fill-opacity"],"undefined")&&bG(h,{"fill-opacity":i["fill-opacity"]})}G[f]("opacity")&&bG(h,{"fill-opacity":G.opacity>1?G.opacity/100:G.opacity});case"stroke":G=a.getRGB(o);h[R](n,G.hex);n=="stroke"&&G[f]("opacity")&&bG(h,{"stroke-opacity":G.opacity>1?G.opacity/100:G.opacity});break;case"gradient":(({circle:1,ellipse:1})[f](c.type)||r(o).charAt()!="r")&&bI(h,o,c.paper);break;case"opacity":i.gradient&&!i[f]("stroke-opacity")&&bG(h,{"stroke-opacity":o>1?o/100:o});case"fill-opacity":if(i.gradient){var H=g.getElementById(h.getAttribute(I)[Y](/^url\(#|\)$/g,p));if(H){var J=H.getElementsByTagName("stop");J[J[w]-1][R]("stop-opacity",o)}break}default:n=="font-size"&&(o=T(o,10)+"px");var K=n[Y](/(\-.)/g,function(a){return V.call(a.substring(1))});h.style[K]=o;h[R](n,o);break}}}bM(c,d);m?c.rotate(m.join(q)):S(j)&&c.rotate(j,true)},bL=1.2,bM=function(b,c){if(b.type!="text"||!(c[f]("text")||c[f]("font")||c[f]("font-size")||c[f]("x")||c[f]("y")))return;var d=b.attrs,e=b.node,h=e.firstChild?T(g.defaultView.getComputedStyle(e.firstChild,p).getPropertyValue("font-size"),10):10;if(c[f]("text")){d.text=c.text;while(e.firstChild)e.removeChild(e.firstChild);var i=r(c.text)[s]("\n");for(var j=0,k=i[w];j<k;j++)if(i[j]){var m=bG("tspan");j&&bG(m,{dy:h*bL,x:d.x});m[l](g.createTextNode(i[j]));e[l](m)}}else{i=e.getElementsByTagName("tspan");for(j=0,k=i[w];j<k;j++)j&&bG(i[j],{dy:h*bL,x:d.x})}bG(e,{y:d.y});var n=b.getBBox(),o=d.y-(n.y+n.height/2);o&&a.is(o,"finite")&&bG(e,{y:d.y+o})},bN=function(b,c){var d=0,e=0;this[0]=b;this.id=a._oid++;this.node=b;b.raphael=this;this.paper=c;this.attrs=this.attrs||{};this.transformations=[];this._={tx:0,ty:0,rt:{deg:0,cx:0,cy:0},sx:1,sy:1};!c.bottom&&(c.bottom=this);this.prev=c.top;c.top&&(c.top.next=this);c.top=this;this.next=null},bO=bN[e];bN[e].rotate=function(c,d,e){if(this.removed)return this;if(c==null){if(this._.rt.cx)return[this._.rt.deg,this._.rt.cx,this._.rt.cy][v](q);return this._.rt.deg}var f=this.getBBox();c=r(c)[s](b);if(c[w]-1){d=S(c[1]);e=S(c[2])}c=S(c[0]);d!=null&&d!==false?this._.rt.deg=c:this._.rt.deg+=c;e==null&&(d=null);this._.rt.cx=d;this._.rt.cy=e;d=d==null?f.x+f.width/2:d;e=e==null?f.y+f.height/2:e;if(this._.rt.deg){this.transformations[0]=a.format("rotate({0} {1} {2})",this._.rt.deg,d,e);this.clip&&bG(this.clip,{transform:a.format("rotate({0} {1} {2})",-this._.rt.deg,d,e)})}else{this.transformations[0]=p;this.clip&&bG(this.clip,{transform:p})}bG(this.node,{transform:this.transformations[v](q)});return this};bN[e].hide=function(){!this.removed&&(this.node.style.display="none");return this};bN[e].show=function(){!this.removed&&(this.node.style.display="");return this};bN[e].remove=function(){if(this.removed)return;bA(this,this.paper);this.node.parentNode.removeChild(this.node);for(var a in this)delete this[a];this.removed=true};bN[e].getBBox=function(){if(this.removed)return this;if(this.type=="path")return bn(this.attrs.path);if(this.node.style.display=="none"){this.show();var a=true}var b={};try{b=this.node.getBBox()}catch(a){}finally{b=b||{}}if(this.type=="text"){b={x:b.x,y:Infinity,width:0,height:0};for(var c=0,d=this.node.getNumberOfChars();c<d;c++){var e=this.node.getExtentOfChar(c);e.y<b.y&&(b.y=e.y);e.y+e.height-b.y>b.height&&(b.height=e.y+e.height-b.y);e.x+e.width-b.x>b.width&&(b.width=e.x+e.width-b.x)}}a&&this.hide();return b};bN[e].attr=function(b,c){if(this.removed)return this;if(b==null){var d={};for(var e in this.attrs)this.attrs[f](e)&&(d[e]=this.attrs[e]);this._.rt.deg&&(d.rotation=this.rotate());(this._.sx!=1||this._.sy!=1)&&(d.scale=this.scale());d.gradient&&d.fill=="none"&&(d.fill=d.gradient)&&delete d.gradient;return d}if(c==null&&a.is(b,F)){if(b=="translation")return cz.call(this);if(b=="rotation")return this.rotate();if(b=="scale")return this.scale();if(b==I&&this.attrs.fill=="none"&&this.attrs.gradient)return this.attrs.gradient;return this.attrs[b]}if(c==null&&a.is(b,G)){var g={};for(var h=0,i=b.length;h<i;h++)g[b[h]]=this.attr(b[h]);return g}if(c!=null){var j={};j[b]=c}else b!=null&&a.is(b,"object")&&(j=b);for(var k in this.paper.customAttributes)if(this.paper.customAttributes[f](k)&&j[f](k)&&a.is(this.paper.customAttributes[k],"function")){var l=this.paper.customAttributes[k].apply(this,[][n](j[k]));this.attrs[k]=j[k];for(var m in l)l[f](m)&&(j[m]=l[m])}bK(this,j);return this};bN[e].toFront=function(){if(this.removed)return this;this.node.parentNode[l](this.node);var a=this.paper;a.top!=this&&bB(this,a);return this};bN[e].toBack=function(){if(this.removed)return this;if(this.node.parentNode.firstChild!=this.node){this.node.parentNode.insertBefore(this.node,this.node.parentNode.firstChild);bC(this,this.paper);var a=this.paper}return this};bN[e].insertAfter=function(a){if(this.removed)return this;var b=a.node||a[a.length-1].node;b.nextSibling?b.parentNode.insertBefore(this.node,b.nextSibling):b.parentNode[l](this.node);bD(this,a,this.paper);return this};bN[e].insertBefore=function(a){if(this.removed)return this;var b=a.node||a[0].node;b.parentNode.insertBefore(this.node,b);bE(this,a,this.paper);return this};bN[e].blur=function(a){var b=this;if(+a!==0){var c=bG("filter"),d=bG("feGaussianBlur");b.attrs.blur=a;c.id=bh();bG(d,{stdDeviation:+a||1.5});c.appendChild(d);b.paper.defs.appendChild(c);b._blur=c;bG(b.node,{filter:"url(#"+c.id+")"})}else{if(b._blur){b._blur.parentNode.removeChild(b._blur);delete b._blur;delete b.attrs.blur}b.node.removeAttribute("filter")}};var bP=function(a,b,c,d){var e=bG("circle");a.canvas&&a.canvas[l](e);var f=new bN(e,a);f.attrs={cx:b,cy:c,r:d,fill:"none",stroke:"#000"};f.type="circle";bG(e,f.attrs);return f},bQ=function(a,b,c,d,e,f){var g=bG("rect");a.canvas&&a.canvas[l](g);var h=new bN(g,a);h.attrs={x:b,y:c,width:d,height:e,r:f||0,rx:f||0,ry:f||0,fill:"none",stroke:"#000"};h.type="rect";bG(g,h.attrs);return h},bR=function(a,b,c,d,e){var f=bG("ellipse");a.canvas&&a.canvas[l](f);var g=new bN(f,a);g.attrs={cx:b,cy:c,rx:d,ry:e,fill:"none",stroke:"#000"};g.type="ellipse";bG(f,g.attrs);return g},bS=function(a,b,c,d,e,f){var g=bG("image");bG(g,{x:c,y:d,width:e,height:f,preserveAspectRatio:"none"});g.setAttributeNS(a.xlink,"href",b);a.canvas&&a.canvas[l](g);var h=new bN(g,a);h.attrs={x:c,y:d,width:e,height:f,src:b};h.type="image";return h},bT=function(a,b,c,d){var e=bG("text");bG(e,{x:b,y:c,"text-anchor":"middle"});a.canvas&&a.canvas[l](e);var f=new bN(e,a);f.attrs={x:b,y:c,"text-anchor":"middle",text:d,font:W.font,stroke:"none",fill:"#000"};f.type="text";bK(f,f.attrs);return f},bU=function(a,b){this.width=a||this.width;this.height=b||this.height;this.canvas[R]("width",this.width);this.canvas[R]("height",this.height);return this},bV=function(){var b=by[m](0,arguments),c=b&&b.container,d=b.x,e=b.y,f=b.width,h=b.height;if(!c)throw new Error("SVG container not found.");var i=bG("svg");d=d||0;e=e||0;f=f||512;h=h||342;bG(i,{xmlns:"http://www.w3.org/2000/svg",version:1.1,width:f,height:h});if(c==1){i.style.cssText="position:absolute;left:"+d+"px;top:"+e+"px";g.body[l](i)}else c.firstChild?c.insertBefore(i,c.firstChild):c[l](i);c=new j;c.width=f;c.height=h;c.canvas=i;bz.call(c,c,a.fn);c.clear();return c};k.clear=function(){var a=this.canvas;while(a.firstChild)a.removeChild(a.firstChild);this.bottom=this.top=null;(this.desc=bG("desc"))[l](g.createTextNode("Created with Raphaël"));a[l](this.desc);a[l](this.defs=bG("defs"))};k.remove=function(){this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas);for(var a in this)this[a]=bF(a)}}if(a.vml){var bW={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},bX=/([clmz]),?([^clmz]*)/gi,bY=/ progid:\S+Blur\([^\)]+\)/g,bZ=/-?[^,\s-]+/g,b$=1000+q+1000,b_=10,ca={path:1,rect:1},cb=function(a){var b=/[ahqstv]/ig,c=bq;r(a).match(b)&&(c=bw);b=/[clmz]/g;if(c==bq&&!r(a).match(b)){var d=r(a)[Y](bX,function(a,b,c){var d=[],e=x.call(b)=="m",f=bW[b];c[Y](bZ,function(a){if(e&&d[w]==2){f+=d+bW[b=="m"?"l":"L"];d=[]}d[L](Q(a*b_))});return f+d});return d}var e=c(a),f,g;d=[];for(var h=0,i=e[w];h<i;h++){f=e[h];g=x.call(e[h][0]);g=="z"&&(g="x");for(var j=1,k=f[w];j<k;j++)g+=Q(f[j]*b_)+(j!=k-1?",":p);d[L](g)}return d[v](q)};a[H]=function(){return"Your browser doesn’t support SVG. Falling down to VML.\nYou are running Raphaël "+this.version};bH=function(a,b){var c=cd("group");c.style.cssText="position:absolute;left:0;top:0;width:"+b.width+"px;height:"+b.height+"px";c.coordsize=b.coordsize;c.coordorigin=b.coordorigin;var d=cd("shape"),e=d.style;e.width=b.width+"px";e.height=b.height+"px";d.coordsize=b$;d.coordorigin=b.coordorigin;c[l](d);var f=new bN(d,c,b),g={fill:"none",stroke:"#000"};a&&(g.path=a);f.type="path";f.path=[];f.Path=p;bK(f,g);b.canvas[l](c);return f};bK=function(c,d){c.attrs=c.attrs||{};var e=c.node,h=c.attrs,i=e.style,j,k=(d.x!=h.x||d.y!=h.y||d.width!=h.width||d.height!=h.height||d.r!=h.r)&&c.type=="rect",m=c;for(var n in d)d[f](n)&&(h[n]=d[n]);if(k){h.path=cc(h.x,h.y,h.width,h.height,h.r);c.X=h.x;c.Y=h.y;c.W=h.width;c.H=h.height}d.href&&(e.href=d.href);d.title&&(e.title=d.title);d.target&&(e.target=d.target);d.cursor&&(i.cursor=d.cursor);"blur"in d&&c.blur(d.blur);if(d.path&&c.type=="path"||k)e.path=cb(h.path);d.rotation!=null&&c.rotate(d.rotation,true);if(d.translation){j=r(d.translation)[s](b);cz.call(c,j[0],j[1]);if(c._.rt.cx!=null){c._.rt.cx+=+j[0];c._.rt.cy+=+j[1];c.setBox(c.attrs,j[0],j[1])}}if(d.scale){j=r(d.scale)[s](b);c.scale(+j[0]||1,+j[1]||+j[0]||1,+j[2]||null,+j[3]||null)}if("clip-rect"in d){var o=r(d["clip-rect"])[s](b);if(o[w]==4){o[2]=+o[2]+ +o[0];o[3]=+o[3]+ +o[1];var q=e.clipRect||g.createElement("div"),t=q.style,u=e.parentNode;t.clip=a.format("rect({1}px {2}px {3}px {0}px)",o);if(!e.clipRect){t.position="absolute";t.top=0;t.left=0;t.width=c.paper.width+"px";t.height=c.paper.height+"px";u.parentNode.insertBefore(q,u);q[l](u);e.clipRect=q}}d["clip-rect"]||e.clipRect&&(e.clipRect.style.clip=p)}c.type=="image"&&d.src&&(e.src=d.src);if(c.type=="image"&&d.opacity){e.filterOpacity=U+".Alpha(opacity="+d.opacity*100+")";i.filter=(e.filterMatrix||p)+(e.filterOpacity||p)}d.font&&(i.font=d.font);d["font-family"]&&(i.fontFamily="\""+d["font-family"][s](",")[0][Y](/^['"]+|['"]+$/g,p)+"\"");d["font-size"]&&(i.fontSize=d["font-size"]);d["font-weight"]&&(i.fontWeight=d["font-weight"]);d["font-style"]&&(i.fontStyle=d["font-style"]);if(d.opacity!=null||d["stroke-width"]!=null||d.fill!=null||d.stroke!=null||d["stroke-width"]!=null||d["stroke-opacity"]!=null||d["fill-opacity"]!=null||d["stroke-dasharray"]!=null||d["stroke-miterlimit"]!=null||d["stroke-linejoin"]!=null||d["stroke-linecap"]!=null){e=c.shape||e;var v=e.getElementsByTagName(I)&&e.getElementsByTagName(I)[0],x=false;!v&&(x=v=cd(I));if("fill-opacity"in d||"opacity"in d){var y=((+h["fill-opacity"]+1||2)-1)*((+h.opacity+1||2)-1)*((+a.getRGB(d.fill).o+1||2)-1);y=A(z(y,0),1);v.opacity=y}d.fill&&(v.on=true);if(v.on==null||d.fill=="none")v.on=false;if(v.on&&d.fill){var B=d.fill.match(M);if(B){v.src=B[1];v.type="tile"}else{v.color=a.getRGB(d.fill).hex;v.src=p;v.type="solid";if(a.getRGB(d.fill).error&&(m.type in{circle:1,ellipse:1}||r(d.fill).charAt()!="r")&&bI(m,d.fill)){h.fill="none";h.gradient=d.fill}}}x&&e[l](v);var C=e.getElementsByTagName("stroke")&&e.getElementsByTagName("stroke")[0],D=false;!C&&(D=C=cd("stroke"));if(d.stroke&&d.stroke!="none"||d["stroke-width"]||d["stroke-opacity"]!=null||d["stroke-dasharray"]||d["stroke-miterlimit"]||d["stroke-linejoin"]||d["stroke-linecap"])C.on=true;(d.stroke=="none"||C.on==null||d.stroke==0||d["stroke-width"]==0)&&(C.on=false);var E=a.getRGB(d.stroke);C.on&&d.stroke&&(C.color=E.hex);y=((+h["stroke-opacity"]+1||2)-1)*((+h.opacity+1||2)-1)*((+E.o+1||2)-1);var F=(S(d["stroke-width"])||1)*0.75;y=A(z(y,0),1);d["stroke-width"]==null&&(F=h["stroke-width"]);d["stroke-width"]&&(C.weight=F);F&&F<1&&(y*=F)&&(C.weight=1);C.opacity=y;d["stroke-linejoin"]&&(C.joinstyle=d["stroke-linejoin"]||"miter");C.miterlimit=d["stroke-miterlimit"]||8;d["stroke-linecap"]&&(C.endcap=d["stroke-linecap"]=="butt"?"flat":d["stroke-linecap"]=="square"?"square":"round");if(d["stroke-dasharray"]){var G={"-":"shortdash",".":"shortdot","-.":"shortdashdot","-..":"shortdashdotdot",". ":"dot","- ":"dash","--":"longdash","- .":"dashdot","--.":"longdashdot","--..":"longdashdotdot"};C.dashstyle=G[f](d["stroke-dasharray"])?G[d["stroke-dasharray"]]:p}D&&e[l](C)}if(m.type=="text"){i=m.paper.span.style;h.font&&(i.font=h.font);h["font-family"]&&(i.fontFamily=h["font-family"]);h["font-size"]&&(i.fontSize=h["font-size"]);h["font-weight"]&&(i.fontWeight=h["font-weight"]);h["font-style"]&&(i.fontStyle=h["font-style"]);m.node.string&&(m.paper.span.innerHTML=r(m.node.string)[Y](/</g,"&#60;")[Y](/&/g,"&#38;")[Y](/\n/g,"<br>"));m.W=h.w=m.paper.span.offsetWidth;m.H=h.h=m.paper.span.offsetHeight;m.X=h.x;m.Y=h.y+Q(m.H/2);switch(h["text-anchor"]){case"start":m.node.style["v-text-align"]="left";m.bbx=Q(m.W/2);break;case"end":m.node.style["v-text-align"]="right";m.bbx=-Q(m.W/2);break;default:m.node.style["v-text-align"]="center";break}}};bI=function(a,b){a.attrs=a.attrs||{};var c=a.attrs,d,e="linear",f=".5 .5";a.attrs.gradient=b;b=r(b)[Y](bd,function(a,b,c){e="radial";if(b&&c){b=S(b);c=S(c);C(b-0.5,2)+C(c-0.5,2)>0.25&&(c=y.sqrt(0.25-C(b-0.5,2))*((c>0.5)*2-1)+0.5);f=b+q+c}return p});b=b[s](/\s*\-\s*/);if(e=="linear"){var g=b.shift();g=-S(g);if(isNaN(g))return null}var h=bx(b);if(!h)return null;a=a.shape||a.node;d=a.getElementsByTagName(I)[0]||cd(I);!d.parentNode&&a.appendChild(d);if(h[w]){d.on=true;d.method="none";d.color=h[0].color;d.color2=h[h[w]-1].color;var i=[];for(var j=0,k=h[w];j<k;j++)h[j].offset&&i[L](h[j].offset+q+h[j].color);d.colors&&(d.colors.value=i[w]?i[v]():"0% "+d.color);if(e=="radial"){d.type="gradientradial";d.focus="100%";d.focussize=f;d.focusposition=f}else{d.type="gradient";d.angle=(270-g)%360}}return 1};bN=function(b,c,d){var e=0,f=0,g=0,h=1;this[0]=b;this.id=a._oid++;this.node=b;b.raphael=this;this.X=0;this.Y=0;this.attrs={};this.Group=c;this.paper=d;this._={tx:0,ty:0,rt:{deg:0},sx:1,sy:1};!d.bottom&&(d.bottom=this);this.prev=d.top;d.top&&(d.top.next=this);d.top=this;this.next=null};bO=bN[e];bO.rotate=function(a,c,d){if(this.removed)return this;if(a==null){if(this._.rt.cx)return[this._.rt.deg,this._.rt.cx,this._.rt.cy][v](q);return this._.rt.deg}a=r(a)[s](b);if(a[w]-1){c=S(a[1]);d=S(a[2])}a=S(a[0]);c!=null?this._.rt.deg=a:this._.rt.deg+=a;d==null&&(c=null);this._.rt.cx=c;this._.rt.cy=d;this.setBox(this.attrs,c,d);this.Group.style.rotation=this._.rt.deg;return this};bO.setBox=function(a,b,c){if(this.removed)return this;var d=this.Group.style,e=this.shape&&this.shape.style||this.node.style;a=a||{};for(var g in a)a[f](g)&&(this.attrs[g]=a[g]);b=b||this._.rt.cx;c=c||this._.rt.cy;var h=this.attrs,i,j,k,l;switch(this.type){case"circle":i=h.cx-h.r;j=h.cy-h.r;k=l=h.r*2;break;case"ellipse":i=h.cx-h.rx;j=h.cy-h.ry;k=h.rx*2;l=h.ry*2;break;case"image":i=+h.x;j=+h.y;k=h.width||0;l=h.height||0;break;case"text":this.textpath.v=["m",Q(h.x),", ",Q(h.y-2),"l",Q(h.x)+1,", ",Q(h.y-2)][v](p);i=h.x-Q(this.W/2);j=h.y-this.H/2;k=this.W;l=this.H;break;case"rect":case"path":if(this.attrs.path){var m=bn(this.attrs.path);i=m.x;j=m.y;k=m.width;l=m.height}else{i=0;j=0;k=this.paper.width;l=this.paper.height}break;default:i=0;j=0;k=this.paper.width;l=this.paper.height;break}b=b==null?i+k/2:b;c=c==null?j+l/2:c;var n=b-this.paper.width/2,o=c-this.paper.height/2,q;d.left!=(q=n+"px")&&(d.left=q);d.top!=(q=o+"px")&&(d.top=q);this.X=ca[f](this.type)?-n:i;this.Y=ca[f](this.type)?-o:j;this.W=k;this.H=l;if(ca[f](this.type)){e.left!=(q=-n*b_+"px")&&(e.left=q);e.top!=(q=-o*b_+"px")&&(e.top=q)}else if(this.type=="text"){e.left!=(q=-n+"px")&&(e.left=q);e.top!=(q=-o+"px")&&(e.top=q)}else{d.width!=(q=this.paper.width+"px")&&(d.width=q);d.height!=(q=this.paper.height+"px")&&(d.height=q);e.left!=(q=i-n+"px")&&(e.left=q);e.top!=(q=j-o+"px")&&(e.top=q);e.width!=(q=k+"px")&&(e.width=q);e.height!=(q=l+"px")&&(e.height=q)}};bO.hide=function(){!this.removed&&(this.Group.style.display="none");return this};bO.show=function(){!this.removed&&(this.Group.style.display="block");return this};bO.getBBox=function(){if(this.removed)return this;if(ca[f](this.type))return bn(this.attrs.path);return{x:this.X+(this.bbx||0),y:this.Y,width:this.W,height:this.H}};bO.remove=function(){if(this.removed)return;bA(this,this.paper);this.node.parentNode.removeChild(this.node);this.Group.parentNode.removeChild(this.Group);this.shape&&this.shape.parentNode.removeChild(this.shape);for(var a in this)delete this[a];this.removed=true};bO.attr=function(b,c){if(this.removed)return this;if(b==null){var d={};for(var e in this.attrs)this.attrs[f](e)&&(d[e]=this.attrs[e]);this._.rt.deg&&(d.rotation=this.rotate());(this._.sx!=1||this._.sy!=1)&&(d.scale=this.scale());d.gradient&&d.fill=="none"&&(d.fill=d.gradient)&&delete d.gradient;return d}if(c==null&&a.is(b,"string")){if(b=="translation")return cz.call(this);if(b=="rotation")return this.rotate();if(b=="scale")return this.scale();if(b==I&&this.attrs.fill=="none"&&this.attrs.gradient)return this.attrs.gradient;return this.attrs[b]}if(this.attrs&&c==null&&a.is(b,G)){var g,h={};for(e=0,g=b[w];e<g;e++)h[b[e]]=this.attr(b[e]);return h}var i;if(c!=null){i={};i[b]=c}c==null&&a.is(b,"object")&&(i=b);if(i){for(var j in this.paper.customAttributes)if(this.paper.customAttributes[f](j)&&i[f](j)&&a.is(this.paper.customAttributes[j],"function")){var k=this.paper.customAttributes[j].apply(this,[][n](i[j]));this.attrs[j]=i[j];for(var l in k)k[f](l)&&(i[l]=k[l])}i.text&&this.type=="text"&&(this.node.string=i.text);bK(this,i);i.gradient&&(({circle:1,ellipse:1})[f](this.type)||r(i.gradient).charAt()!="r")&&bI(this,i.gradient);(!ca[f](this.type)||this._.rt.deg)&&this.setBox(this.attrs)}return this};bO.toFront=function(){!this.removed&&this.Group.parentNode[l](this.Group);this.paper.top!=this&&bB(this,this.paper);return this};bO.toBack=function(){if(this.removed)return this;if(this.Group.parentNode.firstChild!=this.Group){this.Group.parentNode.insertBefore(this.Group,this.Group.parentNode.firstChild);bC(this,this.paper)}return this};bO.insertAfter=function(a){if(this.removed)return this;a.constructor==cC&&(a=a[a.length-1]);a.Group.nextSibling?a.Group.parentNode.insertBefore(this.Group,a.Group.nextSibling):a.Group.parentNode[l](this.Group);bD(this,a,this.paper);return this};bO.insertBefore=function(a){if(this.removed)return this;a.constructor==cC&&(a=a[0]);a.Group.parentNode.insertBefore(this.Group,a.Group);bE(this,a,this.paper);return this};bO.blur=function(b){var c=this.node.runtimeStyle,d=c.filter;d=d.replace(bY,p);if(+b!==0){this.attrs.blur=b;c.filter=d+q+U+".Blur(pixelradius="+(+b||1.5)+")";c.margin=a.format("-{0}px 0 0 -{0}px",Q(+b||1.5))}else{c.filter=d;c.margin=0;delete this.attrs.blur}};bP=function(a,b,c,d){var e=cd("group"),f=cd("oval"),g=f.style;e.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";e.coordsize=b$;e.coordorigin=a.coordorigin;e[l](f);var h=new bN(f,e,a);h.type="circle";bK(h,{stroke:"#000",fill:"none"});h.attrs.cx=b;h.attrs.cy=c;h.attrs.r=d;h.setBox({x:b-d,y:c-d,width:d*2,height:d*2});a.canvas[l](e);return h};function cc(b,c,d,e,f){return f?a.format("M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z",b+f,c,d-f*2,f,-f,e-f*2,f*2-d,f*2-e):a.format("M{0},{1}l{2},0,0,{3},{4},0z",b,c,d,e,-d)}bQ=function(a,b,c,d,e,f){var g=cc(b,c,d,e,f),h=a.path(g),i=h.attrs;h.X=i.x=b;h.Y=i.y=c;h.W=i.width=d;h.H=i.height=e;i.r=f;i.path=g;h.type="rect";return h};bR=function(a,b,c,d,e){var f=cd("group"),g=cd("oval"),h=g.style;f.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";f.coordsize=b$;f.coordorigin=a.coordorigin;f[l](g);var i=new bN(g,f,a);i.type="ellipse";bK(i,{stroke:"#000"});i.attrs.cx=b;i.attrs.cy=c;i.attrs.rx=d;i.attrs.ry=e;i.setBox({x:b-d,y:c-e,width:d*2,height:e*2});a.canvas[l](f);return i};bS=function(a,b,c,d,e,f){var g=cd("group"),h=cd("image");g.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";g.coordsize=b$;g.coordorigin=a.coordorigin;h.src=b;g[l](h);var i=new bN(h,g,a);i.type="image";i.attrs.src=b;i.attrs.x=c;i.attrs.y=d;i.attrs.w=e;i.attrs.h=f;i.setBox({x:c,y:d,width:e,height:f});a.canvas[l](g);return i};bT=function(b,c,d,e){var f=cd("group"),g=cd("shape"),h=g.style,i=cd("path"),j=i.style,k=cd("textpath");f.style.cssText="position:absolute;left:0;top:0;width:"+b.width+"px;height:"+b.height+"px";f.coordsize=b$;f.coordorigin=b.coordorigin;i.v=a.format("m{0},{1}l{2},{1}",Q(c*10),Q(d*10),Q(c*10)+1);i.textpathok=true;h.width=b.width;h.height=b.height;k.string=r(e);k.on=true;g[l](k);g[l](i);f[l](g);var m=new bN(k,f,b);m.shape=g;m.textpath=i;m.type="text";m.attrs.text=e;m.attrs.x=c;m.attrs.y=d;m.attrs.w=1;m.attrs.h=1;bK(m,{font:W.font,stroke:"none",fill:"#000"});m.setBox();b.canvas[l](f);return m};bU=function(a,b){var c=this.canvas.style;a==+a&&(a+="px");b==+b&&(b+="px");c.width=a;c.height=b;c.clip="rect(0 "+a+" "+b+" 0)";return this};var cd;g.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)");try{!g.namespaces.rvml&&g.namespaces.add("rvml","urn:schemas-microsoft-com:vml");cd=function(a){return g.createElement("<rvml:"+a+" class=\"rvml\">")}}catch(a){cd=function(a){return g.createElement("<"+a+" xmlns=\"urn:schemas-microsoft.com:vml\" class=\"rvml\">")}}bV=function(){var b=by[m](0,arguments),c=b.container,d=b.height,e,f=b.width,h=b.x,i=b.y;if(!c)throw new Error("VML container not found.");var k=new j,n=k.canvas=g.createElement("div"),o=n.style;h=h||0;i=i||0;f=f||512;d=d||342;f==+f&&(f+="px");d==+d&&(d+="px");k.width=1000;k.height=1000;k.coordsize=b_*1000+q+b_*1000;k.coordorigin="0 0";k.span=g.createElement("span");k.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";n[l](k.span);o.cssText=a.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden",f,d);if(c==1){g.body[l](n);o.left=h+"px";o.top=i+"px";o.position="absolute"}else c.firstChild?c.insertBefore(n,c.firstChild):c[l](n);bz.call(k,k,a.fn);return k};k.clear=function(){this.canvas.innerHTML=p;this.span=g.createElement("span");this.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";this.canvas[l](this.span);this.bottom=this.top=null};k.remove=function(){this.canvas.parentNode.removeChild(this.canvas);for(var a in this)this[a]=bF(a);return true}}var ce=navigator.userAgent.match(/Version\\x2f(.*?)\s/);navigator.vendor=="Apple Computer, Inc."&&(ce&&ce[1]<4||navigator.platform.slice(0,2)=="iP")?k.safari=function(){var a=this.rect(-99,-99,this.width+99,this.height+99).attr({stroke:"none"});h.setTimeout(function(){a.remove()})}:k.safari=function(){};var cf=function(){this.returnValue=false},cg=function(){return this.originalEvent.preventDefault()},ch=function(){this.cancelBubble=true},ci=function(){return this.originalEvent.stopPropagation()},cj=(function(){{if(g.addEventListener)return function(a,b,c,d){var e=o&&u[b]?u[b]:b,g=function(e){if(o&&u[f](b))for(var g=0,h=e.targetTouches&&e.targetTouches.length;g<h;g++){if(e.targetTouches[g].target==a){var i=e;e=e.targetTouches[g];e.originalEvent=i;e.preventDefault=cg;e.stopPropagation=ci;break}}return c.call(d,e)};a.addEventListener(e,g,false);return function(){a.removeEventListener(e,g,false);return true}};if(g.attachEvent)return function(a,b,c,d){var e=function(a){a=a||h.event;a.preventDefault=a.preventDefault||cf;a.stopPropagation=a.stopPropagation||ch;return c.call(d,a)};a.attachEvent("on"+b,e);var f=function(){a.detachEvent("on"+b,e);return true};return f}}})(),ck=[],cl=function(a){var b=a.clientX,c=a.clientY,d=g.documentElement.scrollTop||g.body.scrollTop,e=g.documentElement.scrollLeft||g.body.scrollLeft,f,h=ck.length;while(h--){f=ck[h];if(o){var i=a.touches.length,j;while(i--){j=a.touches[i];if(j.identifier==f.el._drag.id){b=j.clientX;c=j.clientY;(a.originalEvent?a.originalEvent:a).preventDefault();break}}}else a.preventDefault();b+=e;c+=d;f.move&&f.move.call(f.move_scope||f.el,b-f.el._drag.x,c-f.el._drag.y,b,c,a)}},cm=function(b){a.unmousemove(cl).unmouseup(cm);var c=ck.length,d;while(c--){d=ck[c];d.el._drag={};d.end&&d.end.call(d.end_scope||d.start_scope||d.move_scope||d.el,b)}ck=[]};for(var cn=t[w];cn--;)(function(b){a[b]=bN[e][b]=function(c,d){if(a.is(c,"function")){this.events=this.events||[];this.events.push({name:b,f:c,unbind:cj(this.shape||this.node||g,b,c,d||this)})}return this};a["un"+b]=bN[e]["un"+b]=function(a){var c=this.events,d=c[w];while(d--)if(c[d].name==b&&c[d].f==a){c[d].unbind();c.splice(d,1);!c.length&&delete this.events;return this}return this}})(t[cn]);bO.hover=function(a,b,c,d){return this.mouseover(a,c).mouseout(b,d||c)};bO.unhover=function(a,b){return this.unmouseover(a).unmouseout(b)};bO.drag=function(b,c,d,e,f,h){this._drag={};this.mousedown(function(i){(i.originalEvent||i).preventDefault();var j=g.documentElement.scrollTop||g.body.scrollTop,k=g.documentElement.scrollLeft||g.body.scrollLeft;this._drag.x=i.clientX+k;this._drag.y=i.clientY+j;this._drag.id=i.identifier;c&&c.call(f||e||this,i.clientX+k,i.clientY+j,i);!ck.length&&a.mousemove(cl).mouseup(cm);ck.push({el:this,move:b,end:d,move_scope:e,start_scope:f,end_scope:h})});return this};bO.undrag=function(b,c,d){var e=ck.length;while(e--)ck[e].el==this&&(ck[e].move==b&&ck[e].end==d)&&ck.splice(e++,1);!ck.length&&a.unmousemove(cl).unmouseup(cm)};k.circle=function(a,b,c){return bP(this,a||0,b||0,c||0)};k.rect=function(a,b,c,d,e){return bQ(this,a||0,b||0,c||0,d||0,e||0)};k.ellipse=function(a,b,c,d){return bR(this,a||0,b||0,c||0,d||0)};k.path=function(b){b&&!a.is(b,F)&&!a.is(b[0],G)&&(b+=p);return bH(a.format[m](a,arguments),this)};k.image=function(a,b,c,d,e){return bS(this,a||"about:blank",b||0,c||0,d||0,e||0)};k.text=function(a,b,c){return bT(this,a||0,b||0,r(c))};k.set=function(a){arguments[w]>1&&(a=Array[e].splice.call(arguments,0,arguments[w]));return new cC(a)};k.setSize=bU;k.top=k.bottom=null;k.raphael=a;function co(){return this.x+q+this.y}bO.resetScale=function(){if(this.removed)return this;this._.sx=1;this._.sy=1;this.attrs.scale="1 1"};bO.scale=function(a,b,c,d){if(this.removed)return this;if(a==null&&b==null)return{x:this._.sx,y:this._.sy,toString:co};b=b||a;!(+b)&&(b=a);var e,f,g,h,i=this.attrs;if(a!=0){var j=this.getBBox(),k=j.x+j.width/2,l=j.y+j.height/2,m=B(a/this._.sx),o=B(b/this._.sy);c=+c||c==0?c:k;d=+d||d==0?d:l;var r=this._.sx>0,s=this._.sy>0,t=~(~(a/B(a))),u=~(~(b/B(b))),x=m*t,y=o*u,z=this.node.style,A=c+B(k-c)*x*(k>c==r?1:-1),C=d+B(l-d)*y*(l>d==s?1:-1),D=a*t>b*u?o:m;switch(this.type){case"rect":case"image":var E=i.width*m,F=i.height*o;this.attr({height:F,r:i.r*D,width:E,x:A-E/2,y:C-F/2});break;case"circle":case"ellipse":this.attr({rx:i.rx*m,ry:i.ry*o,r:i.r*D,cx:A,cy:C});break;case"text":this.attr({x:A,y:C});break;case"path":var G=bp(i.path),H=true,I=r?x:m,J=s?y:o;for(var K=0,L=G[w];K<L;K++){var M=G[K],N=V.call(M[0]);{if(N=="M"&&H)continue;H=false}if(N=="A"){M[G[K][w]-2]*=I;M[G[K][w]-1]*=J;M[1]*=m;M[2]*=o;M[5]=+(t+u?!(!(+M[5])):!(+M[5]))}else if(N=="H")for(var O=1,P=M[w];O<P;O++)M[O]*=I;else if(N=="V")for(O=1,P=M[w];O<P;O++)M[O]*=J;else for(O=1,P=M[w];O<P;O++)M[O]*=O%2?I:J}var Q=bn(G);e=A-Q.x-Q.width/2;f=C-Q.y-Q.height/2;G[0][1]+=e;G[0][2]+=f;this.attr({path:G});break}if(this.type in{text:1,image:1}&&(t!=1||u!=1))if(this.transformations){this.transformations[2]="scale("[n](t,",",u,")");this.node[R]("transform",this.transformations[v](q));e=t==-1?-i.x-(E||0):i.x;f=u==-1?-i.y-(F||0):i.y;this.attr({x:e,y:f});i.fx=t-1;i.fy=u-1}else{this.node.filterMatrix=U+".Matrix(M11="[n](t,", M12=0, M21=0, M22=",u,", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");z.filter=(this.node.filterMatrix||p)+(this.node.filterOpacity||p)}else if(this.transformations){this.transformations[2]=p;this.node[R]("transform",this.transformations[v](q));i.fx=0;i.fy=0}else{this.node.filterMatrix=p;z.filter=(this.node.filterMatrix||p)+(this.node.filterOpacity||p)}i.scale=[a,b,c,d][v](q);this._.sx=a;this._.sy=b}return this};bO.clone=function(){if(this.removed)return null;var a=this.attr();delete a.scale;delete a.translation;return this.paper[this.type]().attr(a)};var cp={},cq=function(b,c,d,e,f,g,h,i,j){var k=0,l=100,m=[b,c,d,e,f,g,h,i].join(),n=cp[m],o,p;!n&&(cp[m]=n={data:[]});n.timer&&clearTimeout(n.timer);n.timer=setTimeout(function(){delete cp[m]},2000);if(j!=null){var q=cq(b,c,d,e,f,g,h,i);l=~(~q)*10}for(var r=0;r<l+1;r++){if(n.data[j]>r)p=n.data[r*l];else{p=a.findDotsAtSegment(b,c,d,e,f,g,h,i,r/l);n.data[r]=p}r&&(k+=C(C(o.x-p.x,2)+C(o.y-p.y,2),0.5));if(j!=null&&k>=j)return p;o=p}if(j==null)return k},cr=function(b,c){return function(d,e,f){d=bw(d);var g,h,i,j,k="",l={},m,n=0;for(var o=0,p=d.length;o<p;o++){i=d[o];if(i[0]=="M"){g=+i[1];h=+i[2]}else{j=cq(g,h,i[1],i[2],i[3],i[4],i[5],i[6]);if(n+j>e){if(c&&!l.start){m=cq(g,h,i[1],i[2],i[3],i[4],i[5],i[6],e-n);k+=["C",m.start.x,m.start.y,m.m.x,m.m.y,m.x,m.y];if(f)return k;l.start=k;k=["M",m.x,m.y+"C",m.n.x,m.n.y,m.end.x,m.end.y,i[5],i[6]][v]();n+=j;g=+i[5];h=+i[6];continue}if(!b&&!c){m=cq(g,h,i[1],i[2],i[3],i[4],i[5],i[6],e-n);return{x:m.x,y:m.y,alpha:m.alpha}}}n+=j;g=+i[5];h=+i[6]}k+=i}l.end=k;m=b?n:c?l:a.findDotsAtSegment(g,h,i[1],i[2],i[3],i[4],i[5],i[6],1);m.alpha&&(m={x:m.x,y:m.y,alpha:m.alpha});return m}},cs=cr(1),ct=cr(),cu=cr(0,1);bO.getTotalLength=function(){if(this.type!="path")return;if(this.node.getTotalLength)return this.node.getTotalLength();return cs(this.attrs.path)};bO.getPointAtLength=function(a){if(this.type!="path")return;return ct(this.attrs.path,a)};bO.getSubpath=function(a,b){if(this.type!="path")return;if(B(this.getTotalLength()-b)<"1e-6")return cu(this.attrs.path,a).end;var c=cu(this.attrs.path,b,1);return a?cu(c,a).end:c};a.easing_formulas={linear:function(a){return a},"<":function(a){return C(a,3)},">":function(a){return C(a-1,3)+1},"<>":function(a){a=a*2;if(a<1)return C(a,3)/2;a-=2;return(C(a,3)+2)/2},backIn:function(a){var b=1.70158;return a*a*((b+1)*a-b)},backOut:function(a){a=a-1;var b=1.70158;return a*a*((b+1)*a+b)+1},elastic:function(a){if(a==0||a==1)return a;var b=0.3,c=b/4;return C(2,-10*a)*y.sin((a-c)*(2*D)/b)+1},bounce:function(a){var b=7.5625,c=2.75,d;if(a<1/c)d=b*a*a;else if(a<2/c){a-=1.5/c;d=b*a*a+0.75}else if(a<2.5/c){a-=2.25/c;d=b*a*a+0.9375}else{a-=2.625/c;d=b*a*a+0.984375}return d}};var cv=[],cw=function(){var b=+(new Date);for(var c=0;c<cv[w];c++){var d=cv[c];if(d.stop||d.el.removed)continue;var e=b-d.start,g=d.ms,h=d.easing,i=d.from,j=d.diff,k=d.to,l=d.t,m=d.el,n={},o;if(e<g){var r=h(e/g);for(var s in i)if(i[f](s)){switch(X[s]){case"along":o=r*g*j[s];k.back&&(o=k.len-o);var t=ct(k[s],o);m.translate(j.sx-j.x||0,j.sy-j.y||0);j.x=t.x;j.y=t.y;m.translate(t.x-j.sx,t.y-j.sy);k.rot&&m.rotate(j.r+t.alpha,t.x,t.y);break;case E:o=+i[s]+r*g*j[s];break;case"colour":o="rgb("+[cy(Q(i[s].r+r*g*j[s].r)),cy(Q(i[s].g+r*g*j[s].g)),cy(Q(i[s].b+r*g*j[s].b))][v](",")+")";break;case"path":o=[];for(var u=0,x=i[s][w];u<x;u++){o[u]=[i[s][u][0]];for(var y=1,z=i[s][u][w];y<z;y++)o[u][y]=+i[s][u][y]+r*g*j[s][u][y];o[u]=o[u][v](q)}o=o[v](q);break;case"csv":switch(s){case"translation":var A=r*g*j[s][0]-l.x,B=r*g*j[s][1]-l.y;l.x+=A;l.y+=B;o=A+q+B;break;case"rotation":o=+i[s][0]+r*g*j[s][0];i[s][1]&&(o+=","+i[s][1]+","+i[s][2]);break;case"scale":o=[+i[s][0]+r*g*j[s][0],+i[s][1]+r*g*j[s][1],2 in k[s]?k[s][2]:p,3 in k[s]?k[s][3]:p][v](q);break;case"clip-rect":o=[];u=4;while(u--)o[u]=+i[s][u]+r*g*j[s][u];break}break;default:var C=[].concat(i[s]);o=[];u=m.paper.customAttributes[s].length;while(u--)o[u]=+C[u]+r*g*j[s][u];break}n[s]=o}m.attr(n);m._run&&m._run.call(m)}else{if(k.along){t=ct(k.along,k.len*!k.back);m.translate(j.sx-(j.x||0)+t.x-j.sx,j.sy-(j.y||0)+t.y-j.sy);k.rot&&m.rotate(j.r+t.alpha,t.x,t.y)}(l.x||l.y)&&m.translate(-l.x,-l.y);k.scale&&(k.scale+=p);m.attr(k);cv.splice(c--,1)}}a.svg&&m&&m.paper&&m.paper.safari();cv[w]&&setTimeout(cw)},cx=function(b,c,d,e,f){var g=d-e;c.timeouts.push(setTimeout(function(){a.is(f,"function")&&f.call(c);c.animate(b,g,b.easing)},e))},cy=function(a){return z(A(a,255),0)},cz=function(a,b){if(a==null)return{x:this._.tx,y:this._.ty,toString:co};this._.tx+=+a;this._.ty+=+b;switch(this.type){case"circle":case"ellipse":this.attr({cx:+a+this.attrs.cx,cy:+b+this.attrs.cy});break;case"rect":case"image":case"text":this.attr({x:+a+this.attrs.x,y:+b+this.attrs.y});break;case"path":var c=bp(this.attrs.path);c[0][1]+=+a;c[0][2]+=+b;this.attr({path:c});break}return this};bO.animateWith=function(a,b,c,d,e){for(var f=0,g=cv.length;f<g;f++)cv[f].el.id==a.id&&(b.start=cv[f].start);return this.animate(b,c,d,e)};bO.animateAlong=cA();bO.animateAlongBack=cA(1);function cA(b){return function(c,d,e,f){var g={back:b};a.is(e,"function")?f=e:g.rot=e;c&&c.constructor==bN&&(c=c.attrs.path);c&&(g.along=c);return this.animate(g,d,f)}}function cB(a,b,c,d,e,f){var g=3*b,h=3*(d-b)-g,i=1-g-h,j=3*c,k=3*(e-c)-j,l=1-j-k;function m(a){return((i*a+h)*a+g)*a}function n(a,b){var c=o(a,b);return((l*c+k)*c+j)*c}function o(a,b){var c,d,e,f,j,k;for(e=a,k=0;k<8;k++){f=m(e)-a;if(B(f)<b)return e;j=(3*i*e+2*h)*e+g;if(B(j)<0.000001)break;e=e-f/j}c=0;d=1;e=a;if(e<c)return c;if(e>d)return d;while(c<d){f=m(e);if(B(f-a)<b)return e;a>f?c=e:d=e;e=(d-c)/2+c}return e}return n(a,1/(200*f))}bO.onAnimation=function(a){this._run=a||0;return this};bO.animate=function(c,d,e,g){var h=this;h.timeouts=h.timeouts||[];if(a.is(e,"function")||!e)g=e||null;if(h.removed){g&&g.call(h);return h}var i={},j={},k=false,l={};for(var m in c)if(c[f](m)){if(X[f](m)||h.paper.customAttributes[f](m)){k=true;i[m]=h.attr(m);i[m]==null&&(i[m]=W[m]);j[m]=c[m];switch(X[m]){case"along":var n=cs(c[m]),o=ct(c[m],n*!(!c.back)),p=h.getBBox();l[m]=n/d;l.tx=p.x;l.ty=p.y;l.sx=o.x;l.sy=o.y;j.rot=c.rot;j.back=c.back;j.len=n;c.rot&&(l.r=S(h.rotate())||0);break;case E:l[m]=(j[m]-i[m])/d;break;case"colour":i[m]=a.getRGB(i[m]);var q=a.getRGB(j[m]);l[m]={r:(q.r-i[m].r)/d,g:(q.g-i[m].g)/d,b:(q.b-i[m].b)/d};break;case"path":var t=bw(i[m],j[m]);i[m]=t[0];var u=t[1];l[m]=[];for(var v=0,x=i[m][w];v<x;v++){l[m][v]=[0];for(var y=1,z=i[m][v][w];y<z;y++)l[m][v][y]=(u[v][y]-i[m][v][y])/d}break;case"csv":var A=r(c[m])[s](b),B=r(i[m])[s](b);switch(m){case"translation":i[m]=[0,0];l[m]=[A[0]/d,A[1]/d];break;case"rotation":i[m]=B[1]==A[1]&&B[2]==A[2]?B:[0,A[1],A[2]];l[m]=[(A[0]-i[m][0])/d,0,0];break;case"scale":c[m]=A;i[m]=r(i[m])[s](b);l[m]=[(A[0]-i[m][0])/d,(A[1]-i[m][1])/d,0,0];break;case"clip-rect":i[m]=r(i[m])[s](b);l[m]=[];v=4;while(v--)l[m][v]=(A[v]-i[m][v])/d;break}j[m]=A;break;default:A=[].concat(c[m]);B=[].concat(i[m]);l[m]=[];v=h.paper.customAttributes[m][w];while(v--)l[m][v]=((A[v]||0)-(B[v]||0))/d;break}}}if(k){var G=a.easing_formulas[e];if(!G){G=r(e).match(P);if(G&&G[w]==5){var H=G;G=function(a){return cB(a,+H[1],+H[2],+H[3],+H[4],d)}}else G=function(a){return a}}cv.push({start:c.start||+(new Date),ms:d,easing:G,from:i,diff:l,to:j,el:h,t:{x:0,y:0}});a.is(g,"function")&&(h._ac=setTimeout(function(){g.call(h)},d));cv[w]==1&&setTimeout(cw)}else{var C=[],D;for(var F in c)if(c[f](F)&&Z.test(F)){m={value:c[F]};F=="from"&&(F=0);F=="to"&&(F=100);m.key=T(F,10);C.push(m)}C.sort(be);C[0].key&&C.unshift({key:0,value:h.attrs});for(v=0,x=C[w];v<x;v++)cx(C[v].value,h,d/100*C[v].key,d/100*(C[v-1]&&C[v-1].key||0),C[v-1]&&C[v-1].value.callback);D=C[C[w]-1].value.callback;D&&h.timeouts.push(setTimeout(function(){D.call(h)},d))}return this};bO.stop=function(){for(var a=0;a<cv.length;a++)cv[a].el.id==this.id&&cv.splice(a--,1);for(a=0,ii=this.timeouts&&this.timeouts.length;a<ii;a++)clearTimeout(this.timeouts[a]);this.timeouts=[];clearTimeout(this._ac);delete this._ac;return this};bO.translate=function(a,b){return this.attr({translation:a+" "+b})};bO[H]=function(){return"Raphaël’s object"};a.ae=cv;var cC=function(a){this.items=[];this[w]=0;this.type="set";if(a)for(var b=0,c=a[w];b<c;b++){if(a[b]&&(a[b].constructor==bN||a[b].constructor==cC)){this[this.items[w]]=this.items[this.items[w]]=a[b];this[w]++}}};cC[e][L]=function(){var a,b;for(var c=0,d=arguments[w];c<d;c++){a=arguments[c];if(a&&(a.constructor==bN||a.constructor==cC)){b=this.items[w];this[b]=this.items[b]=a;this[w]++}}return this};cC[e].pop=function(){delete this[this[w]--];return this.items.pop()};for(var cD in bO)bO[f](cD)&&(cC[e][cD]=(function(a){return function(){for(var b=0,c=this.items[w];b<c;b++)this.items[b][a][m](this.items[b],arguments);return this}})(cD));cC[e].attr=function(b,c){if(b&&a.is(b,G)&&a.is(b[0],"object"))for(var d=0,e=b[w];d<e;d++)this.items[d].attr(b[d]);else for(var f=0,g=this.items[w];f<g;f++)this.items[f].attr(b,c);return this};cC[e].animate=function(b,c,d,e){(a.is(d,"function")||!d)&&(e=d||null);var f=this.items[w],g=f,h,i=this,j;e&&(j=function(){!(--f)&&e.call(i)});d=a.is(d,F)?d:j;h=this.items[--g].animate(b,c,d,j);while(g--)this.items[g]&&!this.items[g].removed&&this.items[g].animateWith(h,b,c,d,j);return this};cC[e].insertAfter=function(a){var b=this.items[w];while(b--)this.items[b].insertAfter(a);return this};cC[e].getBBox=function(){var a=[],b=[],c=[],d=[];for(var e=this.items[w];e--;){var f=this.items[e].getBBox();a[L](f.x);b[L](f.y);c[L](f.x+f.width);d[L](f.y+f.height)}a=A[m](0,a);b=A[m](0,b);return{x:a,y:b,width:z[m](0,c)-a,height:z[m](0,d)-b}};cC[e].clone=function(a){a=new cC;for(var b=0,c=this.items[w];b<c;b++)a[L](this.items[b].clone());return a};a.registerFont=function(a){if(!a.face)return a;this.fonts=this.fonts||{};var b={w:a.w,face:{},glyphs:{}},c=a.face["font-family"];for(var d in a.face)a.face[f](d)&&(b.face[d]=a.face[d]);this.fonts[c]?this.fonts[c][L](b):this.fonts[c]=[b];if(!a.svg){b.face["units-per-em"]=T(a.face["units-per-em"],10);for(var e in a.glyphs)if(a.glyphs[f](e)){var g=a.glyphs[e];b.glyphs[e]={w:g.w,k:{},d:g.d&&"M"+g.d[Y](/[mlcxtrv]/g,function(a){return({l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"})[a]||"M"})+"z"};if(g.k)for(var h in g.k)g[f](h)&&(b.glyphs[e].k[h]=g.k[h])}}return a};k.getFont=function(b,c,d,e){e=e||"normal";d=d||"normal";c=+c||({normal:400,bold:700,lighter:300,bolder:800})[c]||400;if(!a.fonts)return;var g=a.fonts[b];if(!g){var h=new RegExp("(^|\\s)"+b[Y](/[^\w\d\s+!~.:_-]/g,p)+"(\\s|$)","i");for(var i in a.fonts)if(a.fonts[f](i)){if(h.test(i)){g=a.fonts[i];break}}}var j;if(g)for(var k=0,l=g[w];k<l;k++){j=g[k];if(j.face["font-weight"]==c&&(j.face["font-style"]==d||!j.face["font-style"])&&j.face["font-stretch"]==e)break}return j};k.print=function(c,d,e,f,g,h,i){h=h||"middle";i=z(A(i||0,1),-1);var j=this.set(),k=r(e)[s](p),l=0,m=p,n;a.is(f,e)&&(f=this.getFont(f));if(f){n=(g||16)/f.face["units-per-em"];var o=f.face.bbox.split(b),q=+o[0],t=+o[1]+(h=="baseline"?o[3]-o[1]+ +f.face.descent:(o[3]-o[1])/2);for(var u=0,v=k[w];u<v;u++){var x=u&&f.glyphs[k[u-1]]||{},y=f.glyphs[k[u]];l+=u?(x.w||f.w)+(x.k&&x.k[k[u]]||0)+f.w*i:0;y&&y.d&&j[L](this.path(y.d).attr({fill:"#000",stroke:"none",translation:[l,0]}))}j.scale(n,n,q,t).translate(c-q,d-t)}return j};a.format=function(b,c){var e=a.is(c,G)?[0][n](c):arguments;b&&a.is(b,F)&&e[w]-1&&(b=b[Y](d,function(a,b){return e[++b]==null?p:e[b]}));return b||p};a.ninja=function(){i.was?h.Raphael=i.is:delete Raphael;return a};a.el=bO;a.st=cC[e];i.was?h.Raphael=a:Raphael=a})();

CEC._ = CEC._ || {};

;(function (_) {
    
    var RAPHAEL = function () {
        var cvs = document.createElement('canvas');
        return !(cvs && cvs.getContext && cvs.getContext('2d')); 
    }();
    var FORCE_RAPHAEL = false;

    _.isUseRaphael = function () {
        return (FORCE_RAPHAEL || RAPHAEL);
    };

    _.forceRaphael = function () {
        FORCE_RAPHAEL = true;

        for (var k in _) {
            CEC[k] = _[k];
        }
    }

    _.createCanvas = function (styles) {
        var ra = _.isUseRaphael();
        if (ra) {
            //div
            var node = document.createElement('div');
            styles.position = 'absolute';
        } else {
            //canvas
            var node = document.createElement('canvas');
            styles.display = 'block';
        }

        if (styles.id) node.id = styles.id;
        node.ondragstart = function (e) {
            e && e.preventDefault && e.preventDefault()
            return false;
        };
        delete styles.id;

        for (var k in styles) {
            var v = styles[k];
            if (/width|height|left|top/i.test(k) && /^\d+$/.test(v)) {
                v += 'px'
            }
            node.style[k] = v;

            if (k == 'width' || k == 'height') {
                node[k] = parseInt(v);
            }
        }

        return node;
    }


    for (var k in _) {
        CEC[k] = _[k];
    }

})(CEC._);
CEC._.Cobject = function (Notifier) {
    var Cobject = Notifier.extend({
        points: null,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        fillColor: 'none',
        borderWidth: 0,
        borderColor: 'none',
        opacity: 1,
        zIndex: 0,
        visible: true,
        backgroundImage: null,
        backgroundRepeat: null, // repeat|repeat-x|repeat-y|no-repeat
        backgroundPosition: null, // '0 0'
        backgroundPositionX: 0,
        backgroundPositionY: 0,
        backgroundSize: null, // 'auto auto'
        backgroundWidth: 'auto',
        backgroundHeight: 'auto',

        _elements: {},

        initialize: function (options) {
            if (!options) return;

            if (typeof options == 'string') {
                options = (document && document.getElementById) ? document.getElementById(options) : options;
            }

            if (options.nodeName == 'CANVAS') {
                var newNode = document.createElement('div');
                if (options.id) newNode.id = options.id;
                newNode.style.width = (options.width || options.offsetWidth) + 'px';
                newNode.style.height = (options.height || options.offsetHeight) + 'px';
                options.parentNode.replaceChild(newNode, options);

                options = newNode;
            }

            if (options.nodeType == 1) {
                this.canvas = options;
                this.canvas.style.display = 'block';
                this.ctx = options.getContext ? options.getContext('2d'): {};
                this.width = this.canvas.width || this.canvas.offsetWidth;
                this.height = this.canvas.height || this.canvas.offsetHeight;

                this.paper = Raphael(this.canvas, this.width, this.height);
                this.paper.canvas.style.position = 'absolute';
                //this.paper.canvas.style.zIndex = 1000;
                this.points = [[0,0], [this.width, 0], [this.width, this.height], [0, this.height]];
                this.type = 'paper';
                this.shape = 'rect';  
                
                var eventsReceptor = document.createElement('div');
                this.canvas.appendChild(eventsReceptor);
                eventsReceptor.style.width = this.width + 'px';
                eventsReceptor.style.height = this.height + 'px';
                eventsReceptor.style.left = 0;
                eventsReceptor.style.top = 0;
                eventsReceptor.style.position = 'absolute';
                eventsReceptor.style.zIndex = 10000;
                this.eventsReceptor = eventsReceptor;
                this.canvas.eventsReceptor = eventsReceptor;

                this.type = 'stage';

            } else {
                for (var k in options) {
                    if (options[k] === undefined) continue;
                    this[k] = options[k];
                }
                
                this.type = 'sprite';
            }

            this.absX = 0;
            this.absY = 0;
            this.absScaleX = 0;
            this.absScaleY = 0;
            this.absAngle = 0;  

            this._getUniqueId();
        },
        _getUniqueId: function () {
            var i = 0;
            return function () {
                this.id = (i++);
            }
        }(),
        getId: function () {
            return this.id;
        },
        _getFixZIndex: function () {
            var map = {}
            return function (z) {
                if (typeof map[z] != 'number') {
                    map[z] = 0;
                }
                map[z] ++;
                return (z + map[z]/10000);
            }
        }()
    });

    return Cobject;
}(CEC.Notifier);

//mix
if (CEC._.isUseRaphael()) {
    CEC.Cobject = CEC._.Cobject;
}
CEC._.Sprite = function (Cobject) {
    var Sprite = Cobject.extend({
        __cache__: {
            images: {},
            audio: {}
        },
        _htmlevents: 'click,dblclick,mousedown,mousemove,mouseover,mouseout,mouseenter,mouseleave,mouseup,keydown,keypress,keyup,touchstart,touchend,touchcancel,touchleave,touchmove',
        initialize: function (options) {
            this.supr(options);

            this.parent = null;
            this.children = [];

            this._ev_map = {};
            
        },
        _getAbsValues: function () {
            this.absX = this.parent.absX + this.x;
            this.absY = this.parent.absY + this.y;
            this.absAngle = this.parent.absAngle + this.angle;
            this.absScaleX = this.parent.absScaleX + this.scaleX;
            this.absScaleY = this.parent.absScaleY + this.scaleY;
        },
        _addImage: function (o) {
            var absX = this.element && this.element.attrs ? this.element.attrs['x'] : 0,
                absY = this.element && this.element.attrs ? this.element.attrs['y'] : 0;

            if (this.element && this.element.nodeType) {
                absX = parseInt(this._getStyle(this.element, 'left'));
                absY = parseInt(this._getStyle(this.element, 'top'));
            }

            if ((!o.backgroundRepeat || o.backgroundRepeat == 'no-repeat') && !o.backgroundPosition && !o.animConfig) {
                var iw = o.width, ih = o.height;

                var image = o.paper.image(o.backgroundImage, absX+o.x, absY+o.y, iw, ih);
                image.attr({
                    'opacity': o.opacity,
                    'stroke': 'none'
                });

                o.element = image;
            } else {

                if (o.backgroundPosition) {
                    var pos = o.backgroundPosition.split(' ');
                    pos[1] = pos[1] || pos[0];
                    var bgx = /\d+(px)?$/.test(pos[0]) ? parseFloat(pos[0]) + 'px' : pos[0],
                        bgy = /\d+(px)?$/.test(pos[1]) ? parseFloat(pos[1]) + 'px' : pos[1];

                    o.backgroundPosition = '' + bgx + ' ' + bgy;
                } 
                
                var div = document.createElement('div');
                o.canvas.appendChild(div);
                
                var rules = {
                    position: 'absolute',
                    width: o.width + 'px',
                    height: o.height + 'px',
                    left: absX + o.x + 'px',
                    top: absY + o.y + 'px',
                    backgroundImage : 'url('+o.backgroundImage+')',
                    backgroundRepeat : o.backgroundRepeat,
                    backgroundPosition : o.backgroundPosition
                };

               // if (o.borderWidth) rules.borderWidth = parseFloat(o.borderWidth) + 'px';
               // if (o.borderColor) rules.borderColor = o.borderColor;

                this._setStyle(div, rules);

                o.element = div;
            }
            
            
            this.children.push(o);

            return o.element;
        },
        _setStyle: function (el, rules) {
            if (!el) return this;
            for (var k in rules) { 
                if (rules[k] == null || rules[k] == undefined) continue;
                el.style[k] = rules[k];
            }
        },
        _getStyle: function (node, property, camel) {
            var value;
            if (window.getComputedStyle) {
                value = document.defaultView
                    .getComputedStyle(node, null)
                    .getPropertyValue(property);
            } else if (node.currentStyle) {
                value = node.currentStyle[property] ?
                    node.currentStyle[property] :
                    node.currentStyle[camel];
            }
            if (value === 'transparent' || 
                value === '' ||
                value == 'rgba(0, 0, 0, 0)')
            {
                return getStyle(node.parentNode, property, camel);
            } else {
                return value || '';
            }
        },
        _addRect: function (o) {
            var absX = this.element ? this.element.attrs['x'] : 0,
                absY = this.element ? this.element.attrs['y'] : 0;
            var rect = o.paper.rect(absX + o.x, absY + o.y, o.width, o.height);

            rect.attr({
                'opacity': o.opacity,
                'stroke': 'none',
                'fill': o.fillColor
            });

            o.element = rect;
            this.children.push(o);

            return rect;
        },
        _addPath: function (o) {
            var absX = this.element ? this.element.attrs['x'] : 0,
                absY = this.element ? this.element.attrs['y'] : 0;
                
            var p = ['M'+(absX+o.points[0][0])+' '+(absY+o.points[0][1])];
            for (var i = 1; i < o.points.length; i ++) {
                p.push('L'+(absX+o.points[i][0]) + ' ' + (absY+o.points[i][1]));
            }
            p.push('Z');
            var path = o.paper.path(p.join(''));
            path.attr({
                'opacity': o.opacity,
                'stroke': o.lineColor,
                'stroke-width': o.lineWidth
            });
            
            o.element = path;
            this.children.push(o);
            
            return path;
        },
        _addEvent: function (el, ev, fn) {
            if (el.addEventListener) {
                el.addEventListener(ev, fn ,false);
            } else {
                el.attachEvent('on'+ev, function () { fn.call(el) });
            }
        },
        _getWindowScroll: function () {
            var win = window,
                self = this,
                html = document.documentElement || {scrollLeft:0, scrollTop: 0};
            return {
                x: (win.pageXOffset || html.scrollLeft),
                y: (win.pageYOffset || html.scrollTop)
            };
        },
        _getOffset: function (el) {
            var self = this;

            el = el || self.canvas;
            var width = el.offsetWidth || el.width,
                height = el.offsetHeight || el.height,
                top = el.offsetTop || 0,
                left = el.offsetLeft || 0;
            while (el = el.offsetParent) {
                top = top + el.offsetTop;
                left = left + el.offsetLeft;
            }
            return {
                top: top,
                left: left,
                width: width,
                height: height
            };
        },
        trigger: function (e, context) {
            var ev = e.type,
                self = this;

            var stageOffsetX, stageOffsetY, targetOffsetX, targetOffsetY,
                of = self._getOffset(self.canvas),
                winScroll = self._getWindowScroll();

            if (/touch/.test(ev) && e.touches[0]) {
                var touch = e.touches[0];
                stageOffsetX = touch.pageX - of.left;
                stageOffsetY = touch.pageY - of.top;
            } else {
                stageOffsetX = e.clientX + winScroll.x - of.left;
                stageOffsetY = e.clientY + winScroll.y - of.top;
            }

            //console.log(stageOffsetX, stageOffsetY)
            var target = self._findTarget(stageOffsetX, stageOffsetY);
            e.targetSprite = target;
            //e._target = target;
            e.stageOffsetX = stageOffsetX;
            e.stageOffsetY = stageOffsetY;
            e.spriteOffsetX = target._ev_offsetX;
            e.spriteOffsetY = target._ev_offsetY;
            //console.log(stageOffsetX,stageOffsetY,e.spriteOffsetX,e.spriteOffsetY)

            delete target._ev_offsetX;
            delete target._ev_offsetY;

            var callbackList = this._ev_map[ev] || [];
            for (var i = 0, len = callbackList.length; i < len; i ++) {
                callbackList[i].call(context, e);
            }

        },
        on: function (ev, callback) {
            var self = this;
            if ((','+this._htmlevents+',').indexOf(','+ev+',') > -1) {
                // bubble events binding
                if (ev == 'mouseover'
                    || ev == 'mouseout'
                    || ev == 'mouseenter'
                    || ev == 'mouseleave') {
                    this.stage.delegate('mousemove', function (e) {
                        var lastKey = '_last_isSelf_'+ev,
                            key = '_isSelf_' + ev;
                        self[lastKey] = !!self[key];
                        self[key] = e.targetSprite == self;
                        if ((self[key] && !self[lastKey] && (ev == 'mouseover' || ev == 'mouseenter'))
                            || (self[lastKey] && !self[key] && (ev == 'mouseout' || ev == 'mouseleave'))
                        ) {
                            callback && callback.call(self, e);
                        } 

                    });
                } else {
                    this.stage.delegate(ev, function (e) {
                        e.targetSprite == self && callback && callback.call(self, e);
                    });
                }
            } else {
                this.supr(ev, callback);
            }
            return this;
        },
        delegate: function (ev, callback) {
            if (!this._ev_map[ev]) {
                this._ev_map[ev] = [];
                this._ev_map[ev].push(callback);

                var self = this;
                this._addEvent(this.canvas, ev, function (e) {
                    e = e || window.event;
                    self.trigger(e);
                });
            } else {
                this._ev_map[ev].push(callback);
            }
            
            return this;
        },
        _findTarget: function (x, y) {
            var hoverSprites = [];
            hoverSprites.push(this);

            function find (o, l, t) {
                if (o.children && o.children.length) {
                    for (var i = 0, len = o.children.length; i < len; i ++) {
                        var c = o.children[i],
                            posc = [l + c.x, t + c.y, l + c.x + c.width, t + c.y + c.height];
                        if (c.visible && x > posc[0] && x < posc[2] && y > posc[1] && y < posc[3]) {
                            c._ev_offsetX = x - (l + c.x);
                            c._ev_offsetY = y - (t + c.y);
                            hoverSprites.push(c);
                        }
                        find(c, posc[0], posc[1]);
                    }
                }
            }
            find(this, this.x, this.y);

            //console.log(hoverSprites[hoverSprites.length-1]);
            return hoverSprites[hoverSprites.length-1];
        },

        add: function (o) {

            o.parent = this;
            o.stage = this.stage || this;
            
            var canvas = document.createElement('div');
            this.canvas.appendChild(canvas);

            this._setStyle(canvas, {
                width: this.canvas.offsetWidth + 'px',
                height: this.canvas.offsetHeight + 'px',
                position: 'absolute',
                left: 0,
                top: 0,
                overflow: 'hidden'
            });
            
            var paper = Raphael(canvas);
            
            o.canvas = canvas;
            o.paper = paper;

            if (o.backgroundImage) {
                this._addImage(o);
            } else if (o.type == 'path') {
                this._addPath(o);
            } else {
                this._addRect(o);
            }
            
            !o.visible && o.hide();
            o._getAbsValues();
            o.fire('after:added');

            return this;
        },
        setZIndex: function (z) {
            this.zIndex = parseInt(z);
            this._zindex = this._getFixZIndex(this.zIndex);
        },
        appendTo: function (o) {
            if (o instanceof Sprite) {
                o.add(this);
            }
            return this;
        },
        remove: function (o) {
            var target, parent;
            if (!o) {
                target = this;
                parent = this.parent;
            } else {
                target = o;
                parent = this;
            }

            for (var i = 0; i < parent.children.length; i ++) {
                if (target == parent.children[i]) {
                    target.parent = null;
                    target.stage = null;
                    parent.children.splice(i, 1);
                    //return target;
                }
            }

            if (target.element.nodeType) {
                target.canvas.removeChild(target.element);
            } else {
                target.element.remove();
            }

            return target;
            
        },
        isVisible: function () {
            var self = this;
            while (self) {
                if (!self.visible) {
                    return false;
                }
                self = self.parent;
            }
            return true;
        },
        _isParentsVisible: function () {
            var self = this.parent;
            while (self) {
                if (!self.visible) {
                    return false;
                }
                self = self.parent;
            }
            return true;
        },
        show: function () {
            if (!this.element) return this;
            showElement(this);
            this.visible = true;
            delete this._visible;

            restore_showChildren(this);

            function showElement (o) {
                if (o._isParentsVisible()) {
                    if (o.element.nodeType) {
                        o.element.style.display = 'block';
                    } else {
                        o.element.show();
                    }
                }
                
            }

            function restore_showChildren(o) {
                for (var i = 0, len = o.children.length; i < len; i ++) {
                    var c = o.children[i];
                    if (typeof c._visible == 'boolean') {
                        c.visible = c._visible;
                        delete c._visible;
                    }
                    c.visible && showElement(c);
                    c.children && restore_showChildren(c);
                }
            }

            return this;
        },
        hide: function () {
            if (!this.element) return this;
            hideElement(this);
            this.visible = false;

            hack_hideChildren(this);

            function hideElement (o) {
                if (o.element.nodeType) { 
                    o.element.style.display = 'none';
                } else {
                    o.element.hide();
                } 
                o.visible = false;
            }

            function hack_hideChildren (o) {
                for (var i = 0, len = o.children.length; i < len; i ++) {
                    var c = o.children[i];
                    c._visible = c.visible;
                    hideElement(c);

                    c.children && hack_hideChildren(c);
                }
            }

            return this;
        },
        _set: function (param) {
            for (var k in param) {
                if (typeof param[k] == 'string') {
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
                }
                this[k] = param[k];
            }
            return this;
        },
        // set 
        set: function (param) {
            this._set(param);
            if (!this.element.nodeType) {
                this.element.attr({
                    'fill': this.fillColor || 'rgba(0,0,0,0)',
                    'font': this.font,
                    'font-family': this.fontFamily,
                    'font-size': this.fontSize,
                    'font-weight': this.fontWeight,
                    'height': this.height,
                    'opacity': this.opacity,
                    'stroke': this.borderColor,
                    'stroke-width': this.borderWidth,
                    'text': this.text,
                    'width': this.width
                });

                this._getAbsValues();
                this.element.translate(this.absX, this.absY);
                this.element.scale(this.absScaleX, this.absScaleY);
                this.element.rotate(this.absAngle);    
            } else {
                this._setStyle(this.element, {
                    backgroundColor: this.fillColor || 'transparent',
                    font: this.font,
                    fontFamily: this.fontFamily,
                    fontSize: parseInt(this.fontSize) + 'px',
                    fontWeight: this.fontWeight,
                    height: this.height + 'px',
                    width: this.width + 'px'
                });
            }

            return this;
        },
        setFillColor: function (c) {
            this.fillColor = c;
            if (this.element) {
                if (this.element.nodeType) {
                    this._setStyle(this.element, {
                        backgroundColor: c
                    })
                } else {
                    this.element.attr('fill', c);
                }
            }

            return this;
        }, 
        setAngle: function (angle, cx, cy) {
            return this.rotate(angle, cx, cy);
        },
        rotate: function (angle, cx, cy) {
            if (this.backgroundImage && this.backgroundRepeat != 'no-repeat') return this;

            this._set({angle: angle});

            if (cx == undefined) cx = this.element.attrs['x'] + this.width/2;
            if (cy == undefined) cy = this.element.attrs['y'] + this.height/2;

            this.element.rotate(this.angle, true);

            for (var i = 0; i < this.children.length; i ++) {
                this.children[i].rotate(this.angle, true);
            }

            
            return this;
        },
        translate: function (x, y) {
            this._set({x: x, y: y});
            this._getAbsValues();

            if (this.element.nodeType) {
                this._setStyle(this.element, {
                    left: this.absX + 'px',
                    top: this.absY + 'px'
                })
            } else {
                this.element.attr({
                    x: this.absX,
                    y: this.absY
                });
            }

            for (var i = 0; i < this.children.length; i ++) {
                this.children[i].translate(this.children[i].x, this.children[i].y);
            }  

            return this;
        },
        moveTo: function (x, y) {
            return this.translate(x, y);
        },
        setXY: function (x, y) {
            return this.translate(x, y);
        },
        setX: function (x) {
            return this.translate(x, '+0');
        },
        setY: function (y) {
            return this.translate('+0', y);
        },
        setScale: function (sx, sy, cx, cy) {
            this._set({scaleX: sx, scaleY: sy});
            if (!this.element.nodeType) {
                //if (cx == undefined) cx = this.absX + this.width/2;
                //if (cy == undefined) cy = this.absY + this.height/2;
                this.element.scale(this.scaleX, this.scaleY);
                for (var i = 0; i < this.children.length; i ++) {
                    this.children[i].setScale(this.scaleX, this.scaleY);
                }
            }
            return this;
        },
        setScaleX: function (sx) {
            return this.setScale(sx, this.scaleY);
        },
        setScaleY: function (sy) {
            return this.setScale(this.scaleX, sy);
        },
        setOpacity: function (o) {
            this._set({opacity: o});
            if (!this.element.nodeType) {
                this.element.attr({opacity: o});
            }
            return this;
        },
        setBackgroundPositionX: function (x) {
            this._set({backgroundPositionX: x});
            if (this.element.nodeType) {
                this._setStyle(this.element, {
                    backgroundPositionX: this.backgroundPositionX + 'px'
                });
            }
            return this;
        },
        setBackgroundPositionY: function (y) {
            this._set({backgroundPositionY: y});
            if (this.element.nodeType) {
                this._setStyle(this.element, {
                    backgroundPositionY: this.backgroundPositionY + 'px'
                });
            }
            return this;
        },

        render: function (dt) {
            // body...
        },
        clear: function () {
            // empty
        }
    });

    return Sprite;
}(CEC._.Cobject);

CEC._.Sprite.Rect = CEC._.Sprite;

//mix
if (CEC._.isUseRaphael()) {
    CEC.Sprite = CEC._.Sprite;

}
CEC._.Sprite.Anim = function (RectSprite, Ticker) {
    
    var AnimSprite = RectSprite.extend({
        initialize: function (options) {
            var me = this;

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

            this.ticker = new Ticker();
            this.ticker.stop();
            this.ticker.on('tick', function (dt) {
                me._draw(dt);
            });
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
        _draw: function (dt) {
            if (this.playing) {
                this._time += dt;
                if (this._time > this.animationLength && this._loop) {
                    this._time -= this.animationLength;
                }
                this.currentFrame = Math.min(Math.floor(this._time * this._frameRate), this._frameNum-1);
                this.setFrame(this.currentFrame);
            }
        },

        // _drawBackgroundImage: function (dt) {
        //     // get current frame
        //     if (this.playing) {
        //         this._time += dt;
        //         if (this._time > this.animationLength && this._loop) {
        //             this._time -= this.animationLength;
        //         }
        //         this.currentFrame = Math.min(Math.floor(this._time * this._frameRate), this._frameNum-1);
        //         this.setFrame(this.currentFrame);
        //     }

        //     if (this.backgroundImageElement) {
        //         var iw = this.backgroundImageElement.width,
        //             ih = this.backgroundImageElement.height,
        //             bgPos = this.backgroundPosition || [0, 0],
        //             frame = this._frames[this.currentFrame];
        //         if (typeof bgPos == 'string') bgPos = bgPos.split(' ');

        //         if (this.shape == 'rect') {
        //             // frame 0
        //             this.ctx.drawImage(this.backgroundImageElement, frame[0], frame[1], frame[2], frame[3], bgPos[0], bgPos[1], this.width, this.height);
        //         }
        //     }
        // },
        play: function () {
            this.ticker.resume();
            this._time = this.currentFrame/this._frameRate;
            this.playing = true;
            return this;
        },
        stop: function () {
            this.ticker.stop();
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

            this._setStyle(this.element, {
                backgroundPositionX: -this._frames[this.currentFrame][0] + 'px',
                backgroundPositionY: -this._frames[this.currentFrame][1] + 'px'
            });
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

}(CEC._.Sprite, CEC.Ticker);

//mix
if (CEC._.isUseRaphael()) {
    CEC.Sprite.Anim = CEC._.Sprite.Anim;
}
CEC._.Sprite.Path = function (Sprite) {
    
    var PathSprite = Sprite.extend({
        initialize: function (option) {
            this.supr(option);
            this.type = 'path';
        },
        setWidth: function (w) {
            this.element.attr({
                'stroke-width': w
            });
            return this;
        },
        setLineWidth: function (w) {
            this.element.attr({
                'stroke-width': w
            });
            return this;
        },
        setColor: function (c) {
            this.element.attr({
                'stroke': c
            });
            return this;
        },
        setPoint: function (i, p) {
            if (i >= 0 && i < this.points.length) {
                this.points[i] = p;
            }
            
            this.setPoints(this.points);
            return this;
        },
        setPoints: function (pts) { 
            var absX = this.element ? this.element.attrs['x'] || 0 : 0,
                absY = this.element ? this.element.attrs['y'] || 0 : 0;
                
            var p = ['M'+(absX+pts[0][0])+' '+(absY+pts[0][1])];
            
            for (var i = 1; i < pts.length; i ++) {
                p.push('L'+(absX+pts[i][0]) + ' ' + (absY+pts[i][1]));
                if (i==pts.length- 1) {
                    p.push('Z');
                };
            }
            
            this.element.attr({
                'path': p.join('')
            });
            return this;
        }
    });
    
    return PathSprite;
    
}(CEC._.Sprite);

//mix
if (CEC._.isUseRaphael()) {
    CEC.Sprite.Path = CEC._.Sprite.Path;
}
