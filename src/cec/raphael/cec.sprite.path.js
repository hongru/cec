CEC.Sprite.Path = function (Sprite) {
    
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
            }
            p.push('Z');
            
            this.element.attr({
                'path': p.join('')
            });
            return this;
        }
    });
    
    return PathSprite;
    
}(CEC.Sprite);
