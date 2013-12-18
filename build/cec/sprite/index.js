/*
combined files : 

cec/utils/prototypefix
cec/klass
cec/notifier/index
cec/sprite/cobject
cec/sprite/sprite
cec/sprite/rectsprite
cec/sprite/textsprite
cec/sprite/animsprite
cec/sprite/pathsprite
cec/sprite/segmentsprite
cec/sprite/index

*/
KISSY.add('cec/utils/prototypefix',function (S) {
    if ( !Array.prototype.forEach ) {
        Array.prototype.forEach = function(fn, scope) {
            for(var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope || this, this[i], i, this);
            }
        }
    }
});
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

}, {
    requires: ['cec/utils/prototypefix']
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
KISSY.add('cec/sprite/cobject',function (S, Notifier) {
    
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

}, {
    requires: ['cec/notifier/']
});
// todo:
// 1. bubble events binding
// 2. capture events 'mouseover, mouseout' fix
KISSY.add('cec/sprite/sprite',function (S, Cobject) {
    
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

}, {
    requires: ['cec/sprite/cobject']
});
//RectSprite
KISSY.add('cec/sprite/rectsprite',function (S, Sprite) {

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

}, {
	requires: ['cec/sprite/sprite']
});
//TextSprite
KISSY.add('cec/sprite/textsprite',function (S, RectSprite) {
    
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

}, {
    requires: ['cec/sprite/rectsprite']
});
//Frame Animation Sprite
KISSY.add('cec/sprite/animsprite',function (S, RectSprite) {
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
	requires: ['cec/sprite/rectsprite']
})
KISSY.add('cec/sprite/pathsprite',function (S, Sprite) {
	
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

}, {
	requires: ['cec/sprite/sprite']
})
KISSY.add('cec/sprite/segmentsprite',function (S, PathSprite) {
    
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

}, {
    requires: ['cec/sprite/pathsprite']
})
//Sprite index
KISSY.add('cec/sprite/index',function (S, Poly, Rect, Text, Anim, Path, Segment) {
    
    var Sprite = Poly;
    Sprite.Rect = Rect;
    Sprite.Text = Text;
    Sprite.Anim = Anim;
    Sprite.Path = Path;
    Sprite.Segment = Segment;

    return Sprite;
}, {
    requires: ['cec/sprite/sprite', 'cec/sprite/rectsprite', 'cec/sprite/textsprite', 'cec/sprite/animsprite', 'cec/sprite/pathsprite', 'cec/sprite/segmentsprite']
})
