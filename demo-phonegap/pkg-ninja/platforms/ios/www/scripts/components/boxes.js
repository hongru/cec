/**
 * boxes
 */

var Component = require( "../component" );
var message = require( "../message" );
var collide = require( "../game/collide" );
var tools = require( "../game/tools" );
var Sound = require( "../game/sound" );
var tween = require( "../lib/tween" );
var quadratic = tween.quadratic.cio;
var elastic = tween.elastic.co;
var exponential = tween.exponential.co;

var cutAngleScope = 22.5; //  45/2;

// TODO: 重构 data
var data = {
  "create": [
    { image: "images/box-h-normal.png", boxDir: "h" },
    { image: "images/box-v-normal.png", boxDir: "v" },
    { image: "images/box-ad-h-normal.png", boxDir: "h-ad" }
  ],
  "strip": {
    h: { image: "images/box-h-strip.png" },
    v: { image: "images/box-v-strip.png" },
    "h-ad": { image: "images/box-ad-h-strip.png" },
  },
  "open": {
    h: { image: "images/box-h-open.png" },
    v: { image: "images/box-v-open.png" },
    "h-ad": { image: "images/box-ad-h-open.png" },
  },
  "light": {
    h: {
      image: "images/light-h.png",
      width: 162.5,
      height: 8.5,
      x: 0,
      y: 75
    },
    v: {
      image: "images/light-v.png",
      width: 8.5,
      height: 167.5,
      x: 75,
      y: 0
    },
    "h-ad": {
      image: "images/light-h.png",
      width: 162.5,
      height: 8.5,
      x: 0,
      y: 75
    },
  }
};

// TODO: 将动画封装到 adapter 里

var boxesNumber = data.create.length;

var abs = Math.abs, sin = Math.sin, cos = Math.cos;

var random = function( number ){
  return Math.floor( Math.random() * number );
};

var copy = function( from, to ){
  for( var name in from )
    to[ name ] = from[ name ];
};

var basic = function( w, h, x, y ){
  return { width: w, height: h, x: x, y: y };
};

var checkCutAngle = function( box, points ){
  var angle, dir, s = cutAngleScope;

  angle = tools.getAngleByRadian( tools.pointToRadian( points[ 0 ], points[ 1 ] ) );
  dir = box.boxDir.split( "-" )[0];

  if( dir == "v" )
    return abs( 270 - angle ) < s || abs( 90 - angle ) < s;

  if( dir == "h" )
    return abs( angle ) < s || abs( 360 - angle ) < s || abs( 180 - angle ) < s;
};

exports = Component.create().extend( {
  boxWidth: 195,
  boxHeight: 195,
  boxRadius: 30,
  boxSpacing: 20,
  boxes: [],

  reset: function(){
    // TODO: 重置所有变量，如 boxes
  },

  init: function(){
    message.addEventListener( "cut-in", function( points ){
      var collideElements = collide.check( this.boxes, points );

      for( var i = 0, l = collideElements.length; i < l; i ++ )
        this.stripOne( collideElements[ i ], points );
    }.bind( this ) );
  },

  createBox: function( conf ){
    var box = this.addElement( conf );
    box.vibrationOffset = 0;
    box.boxDir = conf.boxDir;
    box.radius = this.boxRadius;
    return box;
  },

  createOne: function( offsetX ){
    var n, option, t, name;

    n = random( boxesNumber );
    t = data.create[ n ];

    option = {
      type: "image",
      framesDir: "h"
    };

    copy( basic( this.boxWidth, this.boxHeight, this.availWidth + offsetX, ( this.availHeight - this.boxHeight ) / 2 - 10 ), option );
    copy( t, option );
    this.boxes.push( this.createBox( option ) );
  },

  stripOne: function( box, points ){
    var index, newBox, option, t, name, n, f, frame, light;

    if( box.removed || box.isStripped || box.isOpened )
      return ;

    if( !checkCutAngle( box, points ) ){
      // TODO: 切错方向
      return;
    }

    index = this.boxes.indexOf( box );
  
    if( ~index ){
      this.showLight( box );
      this.starOne( box );

      option = {
        type: "frames",
        frames: 3,
        imageWidth: 1170,
        imageHeight: 390
      };

      t = data.strip[ box.boxDir ];
      copy( basic( this.boxWidth, this.boxHeight, box.x(), box.y() ), option );
      copy( t, option );

      newBox = this.createBox( option );
      copy( { boxDir: box.boxDir, isStripped: true }, newBox );
  
      this.startAnimation( newBox, {
        duration: 100,
        onTimeUpdate: function( time ){
          if( ( f = Math.floor( time / ( 100 / 3 ) ) ) !== frame ){
            frame = f;
            if( frame > option.frames - 1 )
              return ;
            this.setFrame( frame );   
          }
        },
        onTimeEnd: function(){
          this.openOne( newBox );
        }.bind( this )
      } );

      this.boxes.splice( index, 1, newBox );
      this.removeElement( box );
      Sound.play( "cut" );
    }
  },

  openOne: function( box ){
    var index, newBox, option, t, name, n, f, frame;

    if( box.removed )
      return ;

    index = this.boxes.indexOf( box );

    if( ~index ){
      option = {
        type: "frames",
        frames: 7,
        imageWidth: 2730,
        imageHeight: 390
      };

      t = data.open[ box.boxDir ];
      copy( basic( this.boxWidth, this.boxHeight, box.x(), box.y() ), option );
      copy( t, option );

      newBox = this.createBox( option );
      copy( { boxDir: box.boxDir, isStripped: true, isOpened: true }, newBox );

      this.startAnimation( newBox, {
        duration: 350,
        onTimeUpdate: function( time ){
          if( ( f = Math.floor( time / ( 350 / 7 ) ) ) !== frame ){
            frame = f;
            if( frame > option.frames - 1 )
              return ;
            this.setFrame( frame );
          }
        }
      } );

      this.boxes.splice( index, 1, newBox );
      this.removeElement( box );
    }
  },

  showLight: function( box ){
    var option, c, z, light;

    option = data.light[ box.boxDir ];
      
    c = { 
      type: "image", 
      zIndex: 99 
    };

    copy( option, c );
    c.x = box.x() + option.x;
    c.y = box.y() + option.y;

    light = this.addElement( c );

    this.startAnimation( light, {
      duration: 100,
      onTimeUpdate: function( time ){
        this.scale( z = quadratic( time, 0, 2, 100 ), z );
      }
    } );

    this.startAnimation( light, {
      duration: 100,
      onTimeUpdate: function( time ){
        this.scale( z = quadratic( time, 2, -2, 100 ), z );
      },
      onTimeEnd: function(){
        this.removeElement( light );
      }.bind( this )
    } ); 
  },

  errorOne: function( box ){
    // TODO: errorOne
    var offsetX = 0; // elastic

    this.startAnimation( box, {
      duration: 100,
      onTimeUpdate: function( time ){
        // box.
      }
    } );
  },

  starOne: function(){
    var createStar = function( originX, originY ){
      originX -= 42.5;
      originY -= 40;

      var duration = 1500;

      var star = this.addElement( {
        type: "image",
        image: "images/star.png",
        width: 45,
        height: 45,
        x: originX,
        y: originY,
        zIndex: 200
      } );

      star.rotate( random( 360 ) );

      copy( {
        distance: random( 150 ) + 50,
        dir: random( 360 ) * Math.PI / 180,
        originX: originX,
        originY: originY
      }, star );

      this.startAnimation( star, {
        duration: duration,
        onTimeUpdate: function( time ){
          var distance, x, y, z;

          distance = exponential( time, 0, this.distance, duration );

          x = this.originX + distance * cos( this.dir );
          y = this.originY + distance * sin( this.dir );// + dropAnim( time, 0, 200, dur );
          z = exponential( time, 1, -1, duration );
          // z = 1;

          this.translate( x, y ).scale( z, z );
        },
        onTimeEnd: function(){
          exports.removeElement( this );
        }
      } );
    };

    return function( box ){
      var origin;

      origin = box.getOrigin();

      for( var i = 0; i < 10; i ++ )
        createStar.call( this, origin[ 0 ], origin[ 1 ] );
    }
  }(),

  moveLeft: function( offset ){
    var firstX, i, l, box, x, removes, boxes;

    boxes = this.boxes;

    if( boxes.length ){
      removes = [];
      firstX = boxes[ 0 ].x();

      for( i = 0, l = boxes.length; i < l; i ++ ){
        box = boxes[ i ];
        x = firstX + i * ( this.boxWidth + this.boxSpacing ) + offset;
        box.x( x );

        if( x < -this.boxWidth ){
          removes.push( i );
        }else if( i == l - 1 && x < this.availWidth ){
          this.createOne( this.availWidth - x );
        }
      }

      for( i = removes.length - 1; i >= 0; i -- ){
        this.removeElement( boxes[ removes[ i ] ] );
        boxes.splice( i, 1 );
      }
    }
  },

  // shake: function( frame ){

  // },

  shake2: function( n ){
    var dx, dy;

    n = ( n / e % 360 ) * Math.PI / 180;
    dx = ( Math.sin( n ) * .03 ) + .97;
    dy = ( Math.cos( n ) * .03 ) + .97;

    for( var i = 0, l = this.boxes.length; i < l; i ++ )
      // if( !elements[ i ].isStripped )
        this.boxes[ i ].scale( dx, dy );
  }
} );