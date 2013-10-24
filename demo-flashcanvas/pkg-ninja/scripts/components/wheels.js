/**
 * wheels
 */

var Component = require( "../component" );

exports = Component.create().extend( {
  height: 20,

  render: function( conf ){
    var wheels;
    
    wheels = this.addElement( {
      type: "image",
      x: 0,
      y: conf.y,
      width: this.availWidth,
      height: this.height,
      image: "images/wheels.png"
    } );
  }
} );