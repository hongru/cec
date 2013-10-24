/**
 * fullscreen
 */

var Interaction = require( "./interaction" );

var screenWidth = screen.width, screenHeight = screen.height;

if( screenWidth > screenHeight )
  screenWidth = [ screenHeight, screenHeight = screenWidth ][ 0 ];

exports.ge

// 以横屏分准的屏幕宽
exports.getScreenSize = function(){
  return {
    width: screenWidth,
    height: screenHeight
  }  
};

exports.lockLandscape = function( canvas ){
  var de, rotate, defaultEventFormater, rotateEventFormater;

  de = document.documentElement;
  defaultEventFormater = Interaction.getEventFormater();

  rotateEventFormater = function( event ){
    return {
      clientX: event.clientY,
      clientY: screenWidth - event.clientX
    }
  };

  var doRotate = function(){
    canvas.style.left = - ( screenHeight - screenWidth ) / 2 + "px";
    canvas.style.top = ( screenHeight - screenWidth ) / 2 + "px";
    canvas.style[ "-webkit-transform" ] = "rotate(90deg)";
    Interaction.setEventFormater( rotateEventFormater );
  };

  var restore = function(){
    canvas.style.left =
    canvas.style.top = 0;
    canvas.style[ "-webkit-transform" ] = "none";
    Interaction.setEventFormater( defaultEventFormater );
  };

  window.addEventListener( "orientationchange", function( f ){
    return ( f = function(){
      if( de.clientWidth < de.clientHeight )
        doRotate();  
      else
        restore();
    } )(), f;
  }() );
};