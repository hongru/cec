//CEC index
KISSY.add(function (S, Loader, Sprite, Ticker) {
    
    var CEC = {};
    CEC.Loader = Loader;
    CEC.Sprite = Sprite;
    CEC.Ticker = Ticker;

    return CEC;

}, {
    requires: ['cec/loader/index', 'cec/sprite/index', 'cec/ticker/index'] 
});