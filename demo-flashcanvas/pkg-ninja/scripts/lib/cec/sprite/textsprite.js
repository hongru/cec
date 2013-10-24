//TextSprite
KISSY.add(function (S, RectSprite) {
    
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

        }
    });

    return TextSprite;

}, {
    requires: ['cec/sprite/rectsprite']
});