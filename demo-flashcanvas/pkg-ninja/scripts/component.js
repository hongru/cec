/**
 * component
 */
var timeline = require( "./timeline" ).use( "canvas-render" );
var Element = require( "./adapter/element/index" );

var stage;

var component = function(){
  this.elements = [];
  this.animations = [];
};

component.prototype.extend = function( methods ){
  for( var name in methods )
    this[ name ] = methods[ name ];

  return this;
};

component.prototype.addElement = function( config ){
  var element;

  element = Element.create( config );

  if( stage )
    stage.add( element );

  this.elements.push( element );

  return element;
};

component.prototype.removeElement = function( element ){
  var elements = this.elements;

  element.remove();
  
  for( var i = elements.length - 1; i >= 0; i -- )
    if( elements[ i ] === element )
      elements.splice( i, 1 );
};

component.prototype.removeElements = function(){
  var elements = this.elements;

  this.stopAnimations();

  for( var i = 0, l = elements.length; i < l; i ++ )
    elements[ i ].remove();

  elements.length = 0;
};

component.prototype.show = function(){
  // TODO: component.prototype.show
};

component.prototype.hide = function(){
  // TODO: component.prototype.hide
};

component.prototype.startAnimation = function( element, config ){
  if( !config.recycle )
    config.recycle = this.animations;

  if( !config.object )
    config.object = element;

  timeline.createTask( config );
};

component.prototype.stopAnimations = function(){
  if( this.recycle.clear )
    this.recycle.clear();
};

exports.init = function( conf ){
  stage = conf.stage;
  component.prototype.availWidth = stage.width;
  component.prototype.availHeight = stage.height;
};

exports.create = function( conf ){
  return new component( conf );
};