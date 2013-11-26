CEC
========

**Cross-End Canvas**

    - One-Canvas App Engine
    - A Individuation, High-performance and Straightforward solution of Cross-End[Web & Native]


## Feature

- 跨终端canvas渲染，从pc到mobile，从ie6 到 chrome，从web到native ，一体化的解决方案
- 绝对易用的api，方便的语法糖
- 无限嵌套组的概念
- 分层渲染，提升app渲染性能
- 易用的事件包装和代理

## 构建方式

>
源码基于kissy的module的amd包装方式，但是不强依赖kissy。
build 出来的版本同时有基于kissy的版本和完全不依赖kissy的版本
  - build/cec/cec.js  可使用 `KISSY.use`
  - build/cec/cec-nokissy.js 完全无依赖的版本，所有api挂在一个全局对象`CEC`下

## Usage

```javascript
var stage = new CEC.Sprite('canvas');

var layer = new CEC.Sprite.Rect({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    fillColor: '#000'
}).appendTo(stage);

var button = new CEC.Sprite.Text({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    backgroundImage: './images/btn.png',
    backgroundPosition: '50% 50%',
    backgroundSize: '100% auto',
    textColor: '#fff',
    textAlign: 'center',
    verticalAlign: 'middle',
    text: 'button',
    fontSize: 14
}).on('click', function (e) {
    //click handle
}).appendTo(layer);

// invoke render
stage.render();
```

如果做app或者游戏，通常需要一个计时器来循环渲染。比如

```javascript
CEC.Ticker.singleton.on('tick', function (dt) {
    stage.clear();
    stage.render(dt);
})
```

如果需要使用TWEEN的动画。可以类似这样

```javascript
var stage = new CEC.Sprite('canvas');
var rect = new CEC.Sprite.Rect({
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    fillColor: '#faf'
}).appendTo(stage);

var tween = new CEC.TWEEN.Tween({x: 0, y:0}).to({x: 100, y:100}, 500).easing(CEC.TWEEN.Easing.Bounce.Out).onUpdate(function () {
    rect.x = this.x;
    rect.y = this.y;
}).start();

CEC.Ticker.singleton.on('tick', function (dt) {
    stage.clear();
    stage.render(dt);
    CEC.TWEEN.update();
})
```

## Test cases
- 

## Demos
- [Post-Ninja](http://cenan.demo.taobao.net/demos/post-ninja/index.html?1126) 【厂内】
- [N in 1](http://cenan.demo.taobao.net/demos/nin1/) 【厂内】

## Api Doc
https://github.com/hongru/cec/wiki/Api-Doc