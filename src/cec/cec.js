//CEC index
KISSY.add(function (S, Loader, Sprite, Ticker, Notifier) {
    
    var CEC = {};
    CEC.Loader = Loader;
    CEC.Sprite = Sprite;
    CEC.Ticker = Ticker;
    CEC.Notifier = Notifier;

    return CEC;

}, {
    requires: ['cec/loader/index', 'cec/sprite/index', 'cec/ticker/index', 'cec/notifier/index'] 
});