// todo:
// 1. bubble events binding
// 2. capture events 'mouseover, mouseout' fix
KISSY.add(function (S, Cobject) {
    
    var Sprite = Cobject.extend({
        __cache__: {
            images: {},
            audio: {}
        },
        _htmlevents: 'click,dblclick,mousedown,mousemove,mouseover,mouseout,mouseup,keydown,keypress,keyup,touchstart,touchend,touchcancel,touchleave,touchmove',
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
                img.src = src;
                img.onload = imgOnload;

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
        
        _delegateHtmlEvents: function (ev, callback) {
            //private 
            var win = window,
                self = this,
                html = document.documentElement || {scrollLeft:0, scrollTop: 0};
            function getWindowScroll() {
                return {
                    x: (win.pageXOffset || html.scrollLeft),
                    y: (win.pageYOffset || html.scrollTop)
                };
            }
            //private
            function getOffset(el) {
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
            }


            if (this.type == 'stage') {
                this.canvas.addEventListener(ev, function (e) {
                    e.originalTarget = e.target;
                    //find target
                    var stageOffsetX, stageOffsetY, targetOffsetX, targetOffsetY,
                        of = getOffset(self.canvas),
                        winScroll = getWindowScroll();

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

                    callback && callback(e);

                }, false);

            } else {
                console && console.warn('only `stage` type can delegate HTMLEvents!');
            }
        },
        _findTarget: function (x, y) {
            var hoverSprites = [];
            hoverSprites.push(this);

            function find (o, l, t) {
                if (o.children && o.children.length) {
                    for (var i = 0, len = o.children.length; i < len; i ++) {
                        var c = o.children[i],
                            posc = [l + c.x, t + c.y, l + c.x + c.width, t + c.y + c.height];
                        if (x > posc[0] && x < posc[2] && y > posc[1] && y < posc[3]) {
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

            if (!self.visible) {return}

            self.ctx.save();
            self.type == 'stage' && self.ctx.translate(self.x, self.y)
            self.fire('render:before', dt);
            self._render(dt);
            
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
            if ((','+this._htmlevents+',').indexOf(','+ev+',') > -1) {
                // bubble events binding
                // todo
            } else {
                this.supr(ev, callback);
            }
            return this;
        },
        delegate: function (ev, callback) {
            // capture target events binding
            if ((','+this._htmlevents+',').indexOf(','+ev+',') > -1) {
                this._delegateHtmlEvents(ev, callback);
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