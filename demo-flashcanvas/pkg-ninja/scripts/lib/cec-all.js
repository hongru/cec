/**
 * cec-all
 */

var promise = require( "./promise" );
var isReady;

exports.load = function(){
  var pm = new promise;

  if( isReady ){
    pm.resolve();
  }else{
    if( KISSY.Config.debug && !KISSY.hasConfigCec ){
      KISSY.hasConfigCec = true;
      KISSY.config( {
        packages: [
          { name: "cec", path: "scripts/lib/cec", charset: "utf-8", ignorePackageNameInUri: true }
        ]
      } );
    }

    KISSY.use( "cec/sprite/sprite,cec/sprite/rectsprite,cec/sprite/animsprite,cec/sprite/pathsprite,cec/loader/", function( K, S, R, A, P, L ){
      exports.Sprite = S;
      exports.RectSprite = R;
      exports.AnimSprite = A;
      exports.PathSprite = P;
      exports.Loader = L;
      L.belongto( S );
      isReady = true;
      pm.resolve();
    } );   
  }

  return pm;
};

exports.ready = function( fn ){
  this.load().then( fn );
};