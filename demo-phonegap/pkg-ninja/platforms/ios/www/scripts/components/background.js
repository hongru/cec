/**
 * background
 */

var Component = require( "../component" );

var topHeight = 61;
var bottomHeight = 61;

exports = Component.create().extend( {
  topHeight: topHeight,
  bottomHeight: bottomHeight,

  render: function(){
    if( this.rendered )
      return ;

    this.addElement( {
      type: "image",
      x: 0,
      y: 0,
      width: this.availWidth,
      height: topHeight,
      image: "images/background-top.png"
    } );

    this.addElement( {
      type: "image",
      x: 0,
      y: this.availHeight - 61,
      width: this.availWidth,
      height: bottomHeight,
      image: "images/background-bottom.png"
    } );

    this.rendered = true;
  }
} );