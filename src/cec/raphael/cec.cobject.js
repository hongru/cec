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