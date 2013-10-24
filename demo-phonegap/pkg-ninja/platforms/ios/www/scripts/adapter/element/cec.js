/**
 * element 原型适配器 for cec
 */

var CEC = require( "../../lib/cec-all" );

var element = function( conf ){
  var obj, c, repeat;

  c = {};

  c.zIndex = conf.zIndex;

  if( conf.type != "path" ){
    c.width = conf.width;
    c.height = conf.height;
    c.x = conf.x;
    c.y = conf.y;
    c.opacity = conf.opacity;
  }

  switch( conf.type ){
    case "image":
      c.backgroundImage = conf.image;
      repeat = c.backgroundRepeat = conf.repeat || "no-repeat";

      if( repeat == "repeat-x" )
        c.backgroundSize = "auto 100%";
      else if( repeat == "repeat-y" )
        c.backgroundSize = "100% auto";
      else
        c.backgroundSize = "100% 100%";

      this.obj = new CEC.RectSprite( c );
      break;

    case "rect":
      c.fillColor = conf.fillColor;
      c.borderWidth = conf.borderWidth;
      c.borderColor = conf.borderColor;
      this.obj = new CEC.RectSprite( c );
      break;

    case "frames":
      c.backgroundImage = conf.image;
      c.animConfig = {
        autoPlay: false,
        loop: true,
        frameNum: conf.frames || 1,
        imgWidth: conf.imageWidth,
        imgHeight: conf.imageHeight,
        arrangeDir: conf.framesDir || "h"
      };
      this.obj = new CEC.AnimSprite( c );
      break;

    case "path":
      c.points = conf.points;
      c.lineWidth = conf.strokeWidth;
      c.lineColor = conf.strokeColor;
      this.obj = new CEC.PathSprite( c );
      break;
  }
};

element.prototype.show = function(){
  this.obj.visible = true;
  return this;
};

element.prototype.hide = function(){
  this.obj.visible = false;
  return this;
};

element.prototype.x = function( number ){
  if( typeof number == "number" )
    this.obj.x = number;
  else
    return this.obj.x;
};

element.prototype.y = function( number ){
  if( typeof number == "number" )
    this.obj.y = number;
  else
    return this.obj.y;
};

element.prototype.width = function( number ){
  if( typeof number == "number" )
    this.obj.width = number;
  else
    return this.obj.width;
};

element.prototype.height = function( number ){
  if( typeof number == "number" )
    this.obj.height = number;
  else
    return this.obj.height;
};

element.prototype.getOrigin = function(){
  return [ this.obj.x + this.obj.width / 2, this.obj.y + this.obj.height / 2 ];
};

element.prototype.alpha = function( alpha ){
  this.obj.setOpacity( alpha );
  return this;
};

element.prototype.rotate = function( angle ){
  this.obj.rotate( angle );
  return this;
};

element.prototype.scale = function( dx, dy ){
  this.obj.setScale( dx, dy );
  return this;
};

element.prototype.translate = function( x, y ){
  this.obj.setXY( x, y );
  return this;
};

element.prototype.remove = function(){
  this.removed = true;
  this.obj.remove();
  delete this.obj;
  return this;
};

element.prototype.setFrame = function( index ){
  this.obj.setFrame( index );
  return this;
};

element.prototype.nextFrame = function(){
  this.obj.nextFrame();
  return this;
};

element.prototype.prevFrame = function(){
  this.obj.prevFrame();
  return this;
};

element.prototype.setStrokeWidth = function( n ){
  this.obj.lineWidth = n;
  return this;
};

exports.create = function( conf ){
  return new element( conf );
};