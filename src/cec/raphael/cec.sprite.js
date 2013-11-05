CEC.Sprite = function (Cobject) {
    var Sprite = Cobject.extend({
        __cache__: {
            images: {},
            audio: {}
        },
        initialize: function (options) {
            this.supr(options);

            this.parent = null;
            this.children = [];
            
        },
        _getAbsValues: function () {
            this.absX = this.parent.absX + this.x;
            this.absY = this.parent.absY + this.y;
            this.absAngle = this.parent.absAngle + this.angle;
            this.absScaleX = this.parent.absScaleX + this.scaleX;
            this.absScaleY = this.parent.absScaleY + this.scaleY;
        },
        _addImage: function (o) {
            var absX = this.element ? this.element.attrs['x'] : 0,
                absY = this.element ? this.element.attrs['y'] : 0;

            if (this.element && this.element.nodeType) {
                absX = parseInt(this._getStyle(this.element, 'left'));
                absY = parseInt(this._getStyle(this.element, 'top'));
            }

            if ((!o.backgroundRepeat || o.backgroundRepeat == 'no-repeat') && !o.animConfig) {
                var iw = o.width, ih = o.height;

                var image = o.paper.image(o.backgroundImage, absX+o.x, absY+o.y, iw, ih);
                image.attr({
                    'fill': o.fillColor || 'rgba(0,0,0,0)',
                    'opacity': o.opacity,
                    'stroke': o.borderColor,
                    'stroke-width': o.borderWidth

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
                this.canvas.appendChild(div);

                this._setStyle(this.canvas, {
                    position: 'relative',
                    overflow: 'hidden'
                });
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
                if (o.fillColor) rules.backgroundColor = o.fillColor;
                if (o.borderWidth) rules.borderWidth = parseFloat(o.borderWidth) + 'px';
                if (o.borderColor) rules.borderColor = o.borderColor;

                this._setStyle(div, rules);

                o.element = div;
            }
            
            
            this.children.push(o);

            return o.element;
        },
        _setStyle: function (el, rules) {
            for (var k in rules) { 
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
                'fill': o.fillColor || 'rgba(0, 0, 0, 0)',
                'opacity': o.opacity,
                'stroke': o.borderColor,
                'stroke-width': o.borderWidth

            });

            o.element = rect;
            this.children.push(o);

            return rect;
        },
        delegate: function () {
            //todo
            
            return this;
        },

        add: function (o) {

            o.parent = this;
            o.paper = this.paper;
            o.canvas = this.canvas;

            if (o.backgroundImage) {
                this._addImage(o);
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
        show: function () {
            if (this.element.nodeType) {
                this.element.style.display = 'block';
            } else {
                this.element.show();
            }
            this.visible = true;
            return this;
        },
        hide: function () {
            if (this.element.nodeType) {
                this.element.style.display = 'none';
            } else {
                this.element.hide();
            }
            this.visible = false;
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
                    width: this.width + 'px',
                    borderColor: this.borderColor,
                    borderWidth: this.borderWidth + 'px'
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

            this.element.rotate(this.angle, cx, cy);
            for (var i = 0; i < this.children.length; i ++) {
                this.children[i].rotate(this.angle, cx, cy);
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
                if (cx == undefined) cx = this.element.attrs['x'] + this.width/2;
                if (cy == undefined) cy = this.element.attrs['y'] + this.height/2;
                this.element.scale(this.scaleX, this.scaleY, cx, cy);
                for (var i = 0; i < this.children.length; i ++) {
                    this.children[i].setScale(this.scaleX, this.scaleY, cx, cy);
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
}(CEC.Cobject);

// todo
CEC.Sprite.Rect = CEC.Sprite;