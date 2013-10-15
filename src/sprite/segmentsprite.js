KISSY.add(function (S, PathSprite) {
    
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
    requires: ['./pathsprite']
})