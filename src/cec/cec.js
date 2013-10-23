//CEC index
KISSY.add(function (S, Loader, Sprite, Ticker) {
    
    var CEC = {};
    CEC.Loader = Loader;
    CEC.Sprite = Sprite;
    CEC.Ticker = Ticker;

    return CEC;

}, {
    requires: ['./loader/index', './sprite/index', './ticker/index'] 
});