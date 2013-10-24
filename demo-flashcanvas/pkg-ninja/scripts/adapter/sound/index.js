/**
 * a simple sound controller
 */

/**
 * usage:
 * var snd = sound.create("sounds/myfile");
 * snd.play();
 */

var buzz = require( "../../lib/buzz" );
var supported = buzz.isSupported();

var config = { 
  formats: [ "mp3" ], 
  preload: true, 
  autoload: true,
  loop: false 
};

function ClassBuzz( src, conf ){
  var c = {}, name;

  for( name in config )
    c[ name ] = config[ name ];

  for( name in conf )
    c[ name ] = conf[ name ];

  this.sound = new buzz.sound( src, c );
}

ClassBuzz.prototype.play = function( s ){
  s = this.sound;
  s.setPercent( 0 );
  s.setVolume( 100 );
  s.play();
};

ClassBuzz.prototype.stop = function(){
  this.sound.fadeOut( 1e3, function(){
      this.pause();
  } );
};

exports.create = function( src, conf ){
  if( !supported )
      return unSupported;
  else
      return new ClassBuzz( src, conf );
};

function unSupported(){
  // TODO: 
};

unSupported.play =
unSupported.stop = function(){
  // TODO: 
  console.log( "un support sound" );
};