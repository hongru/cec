CEC._ = CEC._ || {};

;(function (_) {
    
    var RAPHAEL = function () {
        var cvs = document.createElement('canvas');
        return !(cvs && cvs.getContext && cvs.getContext('2d')); 
    }();
    var FORCE_RAPHAEL = false;

    _.isUseRaphael = function () {
        return (FORCE_RAPHAEL || RAPHAEL);
    };

    _.forceRaphael = function () {
        FORCE_RAPHAEL = true;

        for (var k in _) {
            CEC[k] = _[k];
        }
    }

    _.createCanvas = function (styles) {
        var ra = _.isUseRaphael();
        if (ra) {
            //div
            var node = document.createElement('div');
        } else {
            //canvas
            var node = document.createCanvas('canvas');
        }

        node.id = styles.id;
        delete styles.id;

        for (var k in styles) {
            var v = styles[k];
            if (/width|height|left|top/i.test(k) && /^\d+$/.test(v)) {
                v += 'px'
            }
            node.style[k] = v;
        }
    }


    for (var k in _) {
        CEC[k] = _[k];
    }

})(CEC._);