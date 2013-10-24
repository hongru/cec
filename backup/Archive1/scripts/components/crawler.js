/**
 * crawler
 */

var Component = require( "../component" );

exports = Component.create().extend( {
  height: 158,

  render: function( conf ){
    this.element = this.addElement( {
      type: "image",
      x: 0,
      // y: yrate * canvas.height,
      y: this.y = conf.y,
      width: this.availWidth,
      height: this.height,
      image: "images/crawler.png",
      repeat: "repeat-x"
    } );
  },

  moveLeft: function( offset ){
    this.element.obj.setBackgroundPositionX( offset + "" );
  }
} );