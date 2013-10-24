/**
 * foreground
 */

var Component = require( "../component" );

exports = Component.create().extend( {
  render: function( conf ){
    this.addElement( {
      type: "image",
      x: 56 * this.availWidth / 568,
      y: this.availHeight - 101.5,
      width: 100,
      height: 101.5,
      image: "images/image-1.png"
    } );

    this.addElement( {
      type: "image",
      x: 438 * this.availWidth / 568,
      y: this.availHeight - 101.5,
      width: 100,
      height: 101.5,
      image: "images/image-2.png"
    } );
  }
} );