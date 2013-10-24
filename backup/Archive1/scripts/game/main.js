/**
 * 游戏业务
 */

var state = require( "../state" );
var timeline = require( "../timeline" ).use( "canvas-render" );
var message = require( "../message" );
var Sound = require( "./sound" );

// components
var background = require( "../components/background" );
var crawler = require( "../components/crawler" );
var wheels = require( "../components/wheels" );
var foreground = require( "../components/foreground" );
var knife = require( "../components/knife" );
var boxes = require( "../components/boxes" );

// variables
var speed;
var level;

var canvas;

var resetVariables = function(){
  speed = 240; // pps: pixel per second
  level = 1;
};

// TODO: 重构场景管理器 sence-manager
var MainSence = function(){
  var movingTimer;

  return {
    init: function(){
      var image1, image2;

      background.render();

      crawler.render( {
        y: background.topHeight + ( canvas.height - background.topHeight - background.bottomHeight - ( crawler.height + wheels.height ) ) / 2
      } );

      wheels.render( {
        y: crawler.height + crawler.y
      } );

      foreground.render();

      boxes.init();
      knife.init();

      // setInterval( function(){
      //   document.title = timeline.getFPS();
      // }, 200 );

      Sound.play( "background" );
    },

    start: function(){
      var x, lastTime = 0, frame = 0, f;

      boxes.createOne( 0 );

      movingTimer = timeline.createTask( {
        start: 0, duration: -1, object: this,
        onTimeUpdate: function( time ){
          x = - speed * ( time - lastTime ) / 1000;
          boxes.moveLeft( x );
          crawler.moveLeft( x );
          lastTime = time;
          // boxes.shake2( time );
        }
      } );
    }
  };
}();

exports.init = function(){
  canvas = state( "canvas" ).get();
  resetVariables();

  MainSence.init();
  MainSence.start();
};