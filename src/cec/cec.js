//CEC index
KISSY.add(function (S, Loader, Sprite, Ticker, Notifier, TWEEN) {
    
    var CEC = {};
    CEC.Loader = Loader;
    CEC.Sprite = Sprite;
    CEC.Ticker = Ticker;
    CEC.Notifier = Notifier;
    CEC.TWEEN = TWEEN;

    return CEC;

}, {
    requires: ['cec/loader/index', 'cec/sprite/index', 'cec/ticker/index', 'cec/notifier/index', 'cec/tween/tween'] 
});