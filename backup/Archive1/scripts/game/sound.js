/**
 * 声音管理
 */

var sound = require( "../adapter/sound/index" );

exports = function(){
  var mapping = {
    "background": sound.create( "sounds/background", { loop: true } ),
    "cut": sound.create( "sounds/cut" )
  };

  return {
    play: function( name ){
      mapping[ name ].play();
    }
  };
}();