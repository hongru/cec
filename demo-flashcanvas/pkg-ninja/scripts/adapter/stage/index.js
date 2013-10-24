/**
 * stage 原型适配器 for cec
 */

var CEC = require( "../../lib/cec-all" );
var Element = require( "../element/index" );

var stage = function( conf ){
  this.canvas = typeof conf.canvas == "string" ? document.getElementById( conf.canvas ) : conf.canvas;
  this.obj = new CEC.RectSprite( conf.canvas );
  this.width = this.canvas.width;
  this.height = this.canvas.height;
};

stage.prototype.add = function( /* element, ... */ ){
  var element;
  for( var i = 0, l = arguments.length; i < l; i ++ ){
    element = arguments[ i ];
    this.obj.add( element.obj );
    element.parent = this;
  }
};

stage.prototype.remove = function( element ){
  this.obj.remove( element.obj );
  return element;
};

stage.prototype.render = function(){
  this.obj.clear();
  this.obj.render();
  return this;
};

exports.create = function( conf ){
  return new stage( conf );
};