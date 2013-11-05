/*
combined files : 

cec/utils/prototypefix
cec/klass
cec/notifier/index
cec/ticker/index

*/
KISSY.add('cec/utils/prototypefix',function (S) {
    if ( !Array.prototype.forEach ) {
        Array.prototype.forEach = function(fn, scope) {
            for(var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope || this, this[i], i, this);
            }
        }
    }
});
//klass: a classical JS OOP façade

KISSY.add('cec/klass',function (S) {

    var context = S || this,
        old = context.klass,
        f = 'function',
        fnTest = /xyz/.test(function () {
            xyz
        }) ? /\bsupr\b/ : /.*/,
        proto = 'prototype';

        function klass(o) {
            return extend.call(isFn(o) ? o : function () {}, o, 1)
        }

        function isFn(o) {
            return typeof o === f
        }

        function wrap(k, fn, supr) {
            return function () {
                var tmp = this.supr;
                this.supr = supr[proto][k];
                var undef = {}.fabricatedUndefined;
                var ret = undef;
                try {
                    ret = fn.apply(this, arguments);
                } finally {
                    this.supr = tmp;
                }
                return ret;
            }
        }

        function process(what, o, supr) {
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    what[k] = isFn(o[k]) && isFn(supr[proto][k]) && fnTest.test(o[k]) ? wrap(k, o[k], supr) : o[k];
                }
            }
        }

        function extend(o, fromSub) {
            // must redefine noop each time so it doesn't inherit from previous arbitrary classes
            function noop() {}
            noop[proto] = this[proto];
            var supr = this,
                prototype = new noop(),
                isFunction = isFn(o),
                _constructor = isFunction ? o : this,
                _methods = isFunction ? {} : o;

                function fn() {
                    if (this.initialize) this.initialize.apply(this, arguments)
                    else {
                        fromSub || isFunction && supr.apply(this, arguments);
                        _constructor.apply(this, arguments);
                    }
                }

            fn.methods = function (o) {
                process(prototype, o, supr);
                fn[proto] = prototype;
                return this;
            }

            fn.methods.call(fn, _methods).prototype.constructor = fn;

            fn.extend = arguments.callee;
            fn[proto].implement = fn.statics = function (o, optFn) {
                o = typeof o == 'string' ? (function () {
                    var obj = {};
                    obj[o] = optFn;
                    return obj;
                }()) : o;
                process(this, o, supr);
                return this;
            }

            return fn;
        }

    klass.noConflict = function () {
        context.klass = old;
        return this;
    }

    return klass;

}, {
    requires: ['cec/utils/prototypefix']
});
KISSY.add('cec/notifier/index',function (S, Klass) {
    
    var Notifier = Klass({
        fire: function (ev, data) {
            this._events = this._events || {};
            var evs = this._events[ev];
            var args = Array.prototype.slice.call(arguments, 1);
            if (evs && evs.length) {
                for (var i = 0; i < evs.length; i ++) {
                    evs[i].apply(this, args);
                }
            }
            return this;
        },
        on: function (ev, callback) {
            this._events = this._events || {};
            if (!this._events[ev]) {
                this._events[ev] = [];
            }
            this._events[ev].push(callback);
            return this;
        },
        off: function (ev, callback) {
            this._events = this._events || {};
            if (!callback) {
                delete this._events[ev];
            } else {
                for (var i = 0; i < this._events[ev].length; i ++) {
                    if (callback == this._events[ev][i]) {
                        this._events[ev].splice(i, 1);
                        break;
                    }
                }
            }
            return this;
        },
        mix: function () {
            var target, source;
            if (arguments.length == 1) {
                target = this;
                source = arguments[0];
            }
            for (var k in source) {
                target[k] = source[k];
            }

            return target;
        }
    });
    Notifier.singleton = new Notifier();

    return Notifier;

}, {
    requires: ['cec/klass']
});
KISSY.add('cec/ticker/index',function (S, Notifier) {
    
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
