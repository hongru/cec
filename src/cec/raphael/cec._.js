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

    CEC.isUseRaphael = _.isUseRaphael;
    CEC.forceRaphael = _.forceRaphael;

})(CEC._);