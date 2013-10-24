/**
 * 交互控制器
 */

var message = require( "./message" );
var sqrt = Math.sqrt, abs = Math.abs;

var eventFormater;
var defaultEventFormater;

eventFormater = defaultEventFormater = function( event ){
  return { clientX: event.clientX, clientY: event.clientY };
};

var distance = function( x1, y1, x2, y2 ){
  var w, h;
  w = abs( x1 - x2 );
  h = abs( y1 - y2 );
  return sqrt( w * w + h * h );
};

var bindEvents = function( el ){
  var isTouch, inSweeping, touchStart, touchMove, touchEnd;
  var pointX, pointY;

  isTouch = "ontouchstart" in window;
  touchStart = isTouch ? "touchstart" : "mousedown";
  touchMove = isTouch ? "touchmove" : "mousemove";
  touchEnd = isTouch ? "touchend" : "mouseup";

  el.addEventListener( touchStart, function( event ){
    if( isTouch )
      event = event.touches[ 0 ] || event;
    event = eventFormater( event );
    inSweeping = true;
    pointX = event.clientX;
    pointY = event.clientY;
    message.postMessage( "touch-start", pointX, pointY );
    message.postMessage( "touch-spot", pointX, pointY );
  }, false );

  el.addEventListener( touchMove, function( event ){
    var x, y;
    
    if( !inSweeping )
      return ;

    if( isTouch )
      event = event.touches[ 0 ] || event;

    event = eventFormater( event );

    x = event.clientX;
    y = event.clientY;

    if( distance( x, y, pointX, pointY ) > 6 ){
      pointX = x;
      pointY = y;
      message.postMessage( "touch-spot", x, y );
    }

  }, false );

  el.addEventListener( touchEnd, function( event ){
    var x, y;
    if( isTouch )
      event = event.touches[ 0 ] || event;

    event = eventFormater( event );
    inSweeping = false;
    x = event.clientX;
    y = event.clientY;
    message.postMessage( "touch-end", x, y );
  }, false );
};

exports.setEventFormater = function( formater ){
  eventFormater = formater;
};

exports.getEventFormater = function(){
  return eventFormater;
};

exports.init = function( config ){
  var container = config.canvas;
  this.container = container;
  bindEvents.call( this, container );
};