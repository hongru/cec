//CEC index
KISSY.add(function (S, Loader, Sprite, Stage, Ticker, Notifier, TWEEN) {
    
    var CEC = {};
    CEC.Loader = Loader;
    CEC.Stage = Stage;
    CEC.Sprite = Sprite;
    CEC.Ticker = Ticker;
    CEC.Notifier = Notifier;
    CEC.TWEEN = TWEEN;

    //loader belongto
    CEC.Loader.belongto(CEC.Sprite);

    return CEC;

}, {
    requires: ['cec/loader/index', 'cec/sprite/index', 'cec/sprite/stage', 'cec/ticker/index', 'cec/notifier/index', 'cec/tween/tween'] 
});