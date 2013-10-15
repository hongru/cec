KISSY.add(function (S, Notifier) {
    
    var requestAnimFrame =  (function() {
      return window.requestAnimationFrame ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame ||
             window.oRequestAnimationFrame ||
             window.msRequestAnimationFrame ||
             function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
               window.setTimeout(callback, 1000/60);
             };
    })();

    var Ticker = Notifier.extend({
        initialize: function () {
            this._on = true;
            this._lastStepTime = (+new Date);
            this._loop();
            this.dt = 0.016;
        },
        _loop: function () {
            if (!this._on) { return }
            var me = this;
            requestAnimFrame(function () {
                me._loop();
            });

            var time = (+new Date),
                dt = (time - me._lastStepTime) / 1000;
            // get wrong 'dt' back
            if (dt >= 3) {
                dt = 1/30;
            }

            me.fire('tick', dt);
            me.dt = dt;
            me._lastStepTime = time;
        },
        stop: function () {
            this._on = false;
        },
        resume: function () {
            this._on = true;
            this._lastStepTime = (+new Date);
            this._loop();
        }

    });
    Ticker.singleton = new Ticker();

    return Ticker;

}, {
    requires: ['cec/notifier/']
});