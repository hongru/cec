/**
 * knife
 */

var Component = require( "../component" );
var message = require( "../message" );

var life = 300;
var strokeWidth = 10;

var lastPoint;

exports = Component.create().extend( {
  init: function(){
    message.addEventListener( "touch-spot", function( x, y ){
      this.dotAt( x, y );
    }.bind( this ) );

    message.addEventListener( "touch-end", function(){
      lastPoint = null;
    } );
  },

  dotAt: function( x, y ){
    var line, el, n;

    if( lastPoint ){
      line = [ lastPoint, [ x, y ] ];

      el = this.addElement( {
        type: "path",
        points: line,
        strokeWidth: strokeWidth,
        strokeColor: "#00ffff",
        zIndex: 100
      } );

      message.postMessage( "cut-in", line );

      this.startAnimation( el, {
        start: 0,
        duration: life,
        
        onTimeUpdate: function( time ){
          n = 1 - ( time / life );
          this.obj.lineWidth = strokeWidth * n;
          this.alpha( n );
        },

        onTimeEnd: function(){
          this.removeElement( el );
        }.bind( this )
      } );
    }

    lastPoint = [ x, y ];
  }
} );