
//from rectsprite.js
_drawBackgroundImage: function (dt) {
            //images
            if (this.backgroundImageElement) {
                var bgPos = [this.backgroundPositionX, this.backgroundPositionY],
                    imgEl = this._backgroundCanvas || this.backgroundImageElement,
                    //imgEl = this.backgroundImageElement,
                    iw = imgEl.width,
                    ih = imgEl.height,
                    sx = 0,
                    sy = 0,
                    fixPos = this.borderWidth ? this.borderWidth/2 : 0;

                //rect sprite support image
                if (this.shape == 'rect') {

                    var repeatX = (this.backgroundRepeat == 'repeat' || this.backgroundRepeat == 'repeat-x'),
                        repeatY = (this.backgroundRepeat == 'repeat' || this.backgroundRepeat == 'repeat-y');
                    var col = repeatX ? Math.ceil(this.width/iw) + 1 : 1,
                        row = repeatY ? Math.ceil(this.height/ih) + 1 : 1,
                        fw = col * iw,
                        fh = row * ih,
                        fixX = repeatX ? bgPos[0]%iw : bgPos[0],
                        fixY = repeatY ? bgPos[1]%ih : bgPos[1];

                    this.ctx.beginPath();
                    this.ctx.rect(0, 0, this.width, this.height);
                    this.ctx.closePath();
                    this.ctx.clip();

                    this.ctx.save();
                    var pat = this.ctx.createPattern(imgEl, this.backgroundRepeat);
                    this.ctx.fillStyle = pat;
                    if (fixX > 0 && repeatX) fixX = fixX - iw;
                    if (fixY > 0 && repeatY) fixY = fixY - ih;
                    this.ctx.translate(fixX, fixY)
                    this.ctx.fillRect(0, 0, fw, fh);
                    this.ctx.restore();
                    
                }
            }
        },