KISSY.add(function (S, Notifier) {
    
    var Cobject = Notifier.extend({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        zIndex: 0,
        visible: true,
        imgUrl: null,

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
                this.type = 'stage';
            } else {
                for (var k in options) {
                    this[k] = options[k];
                }
                this.type = 'sprite';
            }
        }
    });

    return Cobject;

}, {
    requires: ['cec/notifier/']
});