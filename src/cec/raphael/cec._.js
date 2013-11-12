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
            styles.position = 'absolute';
        } else {
            //canvas
            var node = document.createElement('canvas');
            styles.display = 'block';
        }

        node.id = styles.id;
        node.ondragstart = function (e) {
            e && e.preventDefault && e.preventDefault()
            return false;
        };
        delete styles.id;

        for (var k in styles) {
            var v = styles[k];
            if (/width|height|left|top/i.test(k) && /^\d+$/.test(v)) {
                v += 'px'
            }
            node.style[k] = v;

            if (k == 'width' || k == 'height') {
                node[k] = parseInt(v);
            }
        }

        return node;
    }


    for (var k in _) {
        CEC[k] = _[k];
    }

})(CEC._);