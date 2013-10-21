KISSY.add(function (S, Notifier) {
    
    var Cobject = Notifier.extend({
        points: null,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        fillColor: null,
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
        _getFixZIndex: function (z) {
            var map = {}
            return function () {
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