/**
 * this file was compiled by jsbuild 1.0.0
 * @date Thu, 31 Oct 2013 01:40:15 GMT
 * @author dron
 * @site http://ucren.com
 */
 
if (typeof console == 'undefined') {
    console = {
        log: function () {},
        warn: function () {}
    }
}

void function( startModule, define, require ){

void function(){
  var mapping = {}, cache = {}, extRegx = /\.js$/;

  startModule = function( m ){
    require( m ).start();
  };

  define = function( id, fn ){
    mapping[ id ] = fn;
  };

  require = function( id ){
    var m, n, oid = id;

    if( !extRegx.test( id ) )
      id += '.js';
    if( cache[ id ] )
      return cache[ id ];
    else if( m = mapping[ id ] )
      return n = { exports: {} }, cache[ id ] = m( n.exports, n );
  };
}();

/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/state.js
 */ 
define("scripts/state.js", function(exports,module){
	/**
	 * a simple state manager
	 * @author  dron
	 * @date  2012-06-28
	 */
	
	var Ucren = require("scripts/lib/ucren");
	var timeline = require("scripts/timeline");
	
	/**
	 * usage:
	 * state( key ).is( value )     ->  determine if the value of key is the given value
	 * state( key ).isnot( value )  ->  determine if the value of key is not given value
	 * state( key ).ison()          ->  determine if the value of key is the boolean value 'true'
	 * state( key ).isoff()         ->  determine if the value of key is the boolean value 'false'
	 * state( key ).isunset()       ->  determine if the value of key is undefined
	 * state( key ).set( value )    ->  set the value of key to a given value
	 * state( key ).get()           ->  get the value of key
	 * state( key ).on()            ->  set the value of key to boolean value 'true'
	 * state( key ).off()           ->  set the value of key to boolean value 'false'
	 */
	
	var stack = {};
	var cache = {};
	var callbacks = {};
	
	exports = function( key ){
	
	  if( cache[ key ] )
	      return cache[ key ];
	
	  return cache[ key ] = {
	    is: function( value ){
	        return stack[key] === value;
	    },
	
	    isnot: function( value ){
	        return stack[key] !== value;
	    },
	
	    ison: function(){
	      return this.is( true );
	    },
	
	    isoff: function(){
	      return this.isnot( true );
	    },
	
	    isunset: function(){
	      return this.is( undefined );
	    },
	
	    set: function(){
	      var lastValue = NaN;
	      return function( value ){
	          var c;
	          stack[key] = value;
	          if( lastValue !== value && ( c = callbacks[ key ] ) )
	            for(var i = 0, l = c.length; i < l; i ++)
	              c[i].call( this, value );
	          lastValue = value;
	      }
	    }(),
	
	    get: function(){
	        return stack[key];
	    },
	
	    on: function(){
	      var me = this;
	      me.set( true );
	      return {
	        keep: function( time ){
	          timeline.setTimeout( me.set.saturate( me, false ), time );
	        }
	      }
	    },
	
	    off: function(){
	      var me = this;
	        me.set( false );
	        return {
	          keep: function( time ){
	            timeline.setTimeout( me.set.saturate( me, true ), time );
	          }
	        }
	    },
	
	    hook: function( fn ){
	      var c;
	        if( !( c = callbacks[ key ] ) )
	            callbacks[ key ] = [ fn ];
	        else
	          c.push( fn );
	    },
	
	    unhook: function(){
	        // TODO: state().unhook()
	    }
	  }
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/lib/ucren.js
 */ 
define("scripts/lib/ucren.js", function(exports,module){
	/**
	 * ucren-lite
	 * filename: boot.js
	 * author: dron
	 * version: 5.0.2.20120628
	 * date: 2009-03-15
	 * contact: ucren.com
	 */
	
	var Ucren;
	
	var blankArray = [];
	var slice = blankArray.slice;
	var join = blankArray.join;
	
	//
	// [基本数据类型扩展]
	//
	
	// String.prototype.trim
	if( !String.prototype.trim )
		String.prototype.trim = function(){
			return this.replace( /^\s+|\s+$/, "" );
		};
	
	// String.prototype.format
	String.prototype.format = function( conf ){
		var rtn = this, blank = {};
		Ucren.each( conf, function( item, key ){
			item = item.toString().replace( /\$/g, "$$$$" );
			rtn = rtn.replace( RegExp( "@{" + key + "}", "g" ), item );
		});
		return rtn.toString();
	};
	
	// String.prototype.htmlEncode
	String.prototype.htmlEncode = function(){
		var div = document.createElement( "div" );
		return function(){
			var text;
			div.appendChild( document.createTextNode( this ));
			text = div.innerHTML;
			div.innerHTML = "";
			return text;
		};
	}();
	
	// String.prototype.byteLength
	String.prototype.byteLength = function(){
		return this.replace( /[^\x00-\xff]/g, "  " ).length;
	};
	
	// String.prototype.subByte
	String.prototype.subByte = function( len, tail ){
		var s = this;
		if( s.byteLength() <= len )
			return s;
		tail = tail || "";
		len -= tail.byteLength();
		return s = s.slice( 0, len ).replace( /( [^\x00-\xff] )/g, "$1 " )
			.slice( 0, len )
			.replace( /[^\x00-\xff]$/, "" )
			.replace( /( [^\x00-\xff] ) /g, "$1" ) + tail;
	}
	
	// Function.prototype.defer
	Function.prototype.defer = function( scope, timeout ){
		var me = this;
		var fn = function(){
			me.apply( scope, arguments );
		};
		return setTimeout( fn, timeout );
	};
	
	
	// Function.prototype.bind
	if( !Function.prototype.bind )
		Function.prototype.bind = function( scope ){
			var me = this;
			return function(){
				return me.apply( scope, arguments );
			}
		};
	
	// Function.prototype.saturate
	Function.prototype.saturate = function( scope/*, args */ ){
		var fn = this, afters = slice.call( arguments, 1 );
		return function(){
			return fn.apply( scope, slice.call( arguments, 0 ).concat( afters ) );
		}
	};
	
	// Array.prototype.indexOf
	// if( !Array.prototype.indexOf )
		Array.prototype.indexOf = function( item, i ){
			var length = this.length;
	
			if( !i )
			    i = 0;
	
			if( i < 0 )
				i = length + i;
			for( ; i < length; i ++ )
				if( this[i] === item )
					return i;
			return -1;
		};
	
	// Array.prototype.every
	// if( !Array.prototype.every )
		Array.prototype.every = function( fn, context ) {
			for ( var i = 0, len = this.length; i < len; i ++ )
				if ( !fn.call( context, this[i], i, this ) )
					return false;
			return true;
		};
	
	// Array.prototype.filter
	// if( !Array.prototype.filter )
		Array.prototype.filter = function( fn, context ) {
			var result = [], val;
			for ( var i = 0, len = this.length; i < len; i ++ )
				if ( val = this[i], fn.call( context, val, i, this ) )
					result.push( val );
			return result;
		};
	
	// Array.prototype.forEach
	// if( !Array.prototype.forEach )
		Array.prototype.forEach = function( fn, context ) {
			for ( var i = 0, len = this.length; i < len; i ++ )
				fn.call( context, this[i], i, this );
			return this;
		};
	
	// Array.prototype.map
	// if( !Array.prototype.map )
		Array.prototype.map = function( fn, context ) {
			var result = [];
			for ( var i = 0, len = this.length; i < len; i ++ )
				result[i] = fn.call( context, this[i], i, this );
			return result;
		};
	
	// Array.prototype.some
	// if( !Array.prototype.some )
		Array.prototype.some = function( fn, context ) {
			for ( var i = 0, len = this.length; i < len; i ++ )
				if ( fn.call( context, this[i], i, this ) )
					return true;
			return false;
		};
	
		Array.prototype.invoke = function( method /*, args */ ){
		    var args = slice.call( arguments, 1 );
	    	this.forEach( function( item ){
		    	if( item instanceof Array )
		    	    item[0][method].apply( item[0], item.slice( 1 ) );
		    	else
		    		item[method].apply( item, args );
		    });
		    return this;
		};
	
		Array.prototype.random = function(){
			var arr = this.slice( 0 ), ret = [], i = arr.length;
			while( i -- )
				ret.push( arr.splice( Ucren.randomNumber( i + 1 ), 1 )[0] );
			return ret;
		};
	
	Ucren = {
	
		//
		// [全局属性]
		//
	
		// Ucren.isIe
		isIe: /msie/i.test( navigator.userAgent ),
	
		// Ucren.isIe6
		isIe6: /msie 6/i.test( navigator.userAgent ),
	
		// Ucren.isFirefox
		isFirefox: /firefox/i.test( navigator.userAgent ),
	
		// Ucren.isSafari
		isSafari: /version\/[\d\.]+\s+safari/i.test( navigator.userAgent ),
	
		// Ucren.isOpera
		isOpera: /opera/i.test( navigator.userAgent ),
	
		// Ucren.isChrome
		isChrome: /chrome/i.test( navigator.userAgent ), //todo isChrome = true, isSafari = true
	
		// Ucren.isStrict
		isStrict: document.compatMode == "CSS1Compat",
	
		// Ucren.tempDom
		tempDom: document.createElement( "div" ),
	
		//
		// [全局方法]
		//
	
		// Ucren.apply
		apply: function( form, to, except ){
			if( !to )to = {};
			if( except ){
				Ucren.each( form, function( item, key ){
					if( key in except )
						return ;
					to[key] = item;
				});
			}else{
				Ucren.each( form, function( item, key ){
					to[key] = item;
				});
			}
			return to;
		},
	
		// Ucren.appendStyle
		appendStyle: function( text ){
			var style;
	
			if( arguments.length > 1 )
				text = join.call( arguments, "" );
	
			if( document.createStyleSheet ){
				style = document.createStyleSheet();
				style.cssText = text;
			}else{
				style = document.createElement( "style" );
				style.type = "text/css";
				//style.innerHTML = text; fix Chrome bug
				style.appendChild( document.createTextNode( text ));
				document.getElementsByTagName( "head" )[0].appendChild( style );
			}
		},
	
		// for copy : )
		//
		// var addEvent = function( target, name, fn ){
		// 	var call = function(){
		// 		fn.apply( target, arguments );
		// 	};
		// 	if( window.attachEvent )
		// 		target.attachEvent( "on" + name, call );
		// 	else if( window.addEventListener )
		// 		target.addEventListener( name, call, false );
		// 	else
		// 		target["on" + name] = call;
		// 	return call;
		// }
	
		// Ucren.addEvent
		addEvent: function( target, name, fn ){
			var call = function(){
				fn.apply( target, arguments );
			};
			if( target.dom ){
				target = target.dom;
			}
			if( window.attachEvent ){
				target.attachEvent( "on" + name, call );
			}else if( window.addEventListener ){
				target.addEventListener( name, call, false );
			}else{
				target["on" + name] = call;
			}
			return call;
		},
	
		// Ucren.delEvent
		delEvent: function( target, name, fn ){
			if( window.detachEvent ){
				target.detachEvent( "on" + name, fn );
			}else if( window.removeEventListener ){
				target.removeEventListener( name, fn, false );
			}else if( target["on" + name] == fn ){
				target["on" + name] = null;
			}
		},
	
		// Ucren.Class
		Class: function( initialize, methods, inheritFrom ){
			var fn, prototype;
			
			initialize = initialize || function(){};
			methods = methods || {};
	
			fn = inheritFrom ? 
	
			function( one, two, three, four, five ){
				var base = new inheritFrom( one, two, three, four, five );
			    for(var name in base)
			        this[ name ] = base[name];
				this.instanceId = Ucren.id();
				initialize.apply( this, arguments );
			} :
	
			function(){
				this.instanceId = Ucren.id();
				initialize.apply( this, arguments );
			};
	
			// if( typeof inheritFrom == "function" )
			//     fn.prototype = new inheritFrom();
	
			Ucren.registerClassEvent.call( prototype = fn.prototype );
	
			Ucren.each( methods, function( item, key ){
			    prototype[ key ] = typeof item == "function" ? function(){
					var ret = item.apply( this, arguments );
					this.fire( key, slice.call( arguments, 0 ) );
					return ret;
				} : item;
			});
	
			return fn;
		},
	
		//private
		registerClassEvent: function(){
			this.on = function( name, fn ){
				Ucren.dispatch( this.instanceId + name, fn.bind( this ));
				return this;
			};
			this.fire = this.fireEvent = function( name, args ){
				Ucren.dispatch( this.instanceId + name, args );
				return this;
			};
		},
	
		// Ucren.createFuze
		createFuze: function(){
			var queue, fn, infire;
			queue = [];
			fn = function( process ){
				if( infire ){
					process();
				}else{
					queue.push( process );
				}
			};
			fn.fire = function(){
				while( queue.length ){
					queue.shift()();
				}
				infire = true;
			};
			fn.extinguish = function(){
				infire = false;
			};
			fn.wettish = function(){
				if( queue.length ){
					queue.shift()();
				}
			};
			return fn;
		},
	
		// Ucren.createIf
		// createIf: function( expressionFunction ){
		// 	return function( callback ){
		// 		var expression = expressionFunction();
		// 		var returnValue = {
		// 			Else: function( callback ){
		// 				callback = callback || nul;
		// 				expression || callback();
		// 			}
		// 		};
		// 		callback = callback || nul;
		// 		expression && callback();
		// 		return returnValue;
		// 	};
		// },
	
		// Ucren.dispatch
		dispatch: function(){
			var map = {}, send, incept, ret;
	
			send = function( processId, args, scope ){
				var processItems;
				if( processItems = map[ processId ] )
					Ucren.each( processItems, function( item ){
						item.apply( scope, args );
					});
			};
	
			incept = function( processId, fn ){
				var m;
				if( !( m = map[ processId ] ) )
					map[processId] = [ fn ];
				else
					m.push( fn );
			};
	
			ret = function( arg1, arg2, arg3 ){
				if( typeof( arg2 ) === "undefined" )
					arg2 = [];
	
				if( arg2 instanceof Array )
				    send.apply( this, arguments );
				else if( typeof( arg2 ) === "function" )
				    incept.apply( this, arguments );
			};
	
			ret.remove = function( processId, fn ){
			    var m, i;
			    if( ( m = map[ processId ] ) && ~( i = m.indexOf( fn ) ) )
			    	m.splice( i, 1 );
			};
	
			return ret;
		}(),
	
		// Ucren.each ( not recommended )
		each: function( unknown, fn ){
			/// unknown 是 array 的，会慢慢退化，建议用 Array.prototype.forEach 替代
			/// unknown 为其它类似的，短期内将暂时支持
			if( unknown instanceof Array || ( typeof unknown == "object" &&
				typeof unknown[0] != "undefined" && unknown.length )){
				if( typeof unknown == "object" && Ucren.isSafari )
					unknown = slice.call( unknown );
	//				for( var i = 0, l = unknown.length; i < l; i ++ ){
	//					if( fn( unknown[i], i ) === false ){
	//						break;
	//					}
	//				}
				unknown.forEach( fn );
			}else if( typeof( unknown ) == "object" ){
				var blank = {};
				for( var i in unknown ){
					if( blank[i] ){
						continue;
					}
					if( fn( unknown[i], i ) === false ){
						break;
					}
				}
			}else if( typeof( unknown ) == "number" ){
				for( var i = 0; i < unknown; i ++ ){
					if( fn( i, i ) === false ){
						break;
					}
				}
			}else if( typeof( unknown ) == "string" ){
				for( var i = 0, l = unknown.length; i < l; i ++ ){
					if( fn( unknown.charAt( i ), i ) === false ){
						break;
					}
				}
			}
		},
	
		// Ucren.Element
		Element: function( el, returnDom ){
			var rtn, handleId;
			if( el && el.isUcrenElement ){
				return returnDom ? el.dom : el;
			}
			el = typeof( el ) == "string" ? document.getElementById( el ) : el;
	
			if( !el )
				return null;
	
			if( returnDom )
				return el;
	
			handleId = el.getAttribute( "handleId" );
			if( typeof handleId == "string" ){
				return Ucren.handle( handleId - 0 );
			}else{
				rtn = new Ucren.BasicElement( el );
				handleId = Ucren.handle( rtn );
				el.setAttribute( "handleId", handleId + "" );
				return rtn;
			}
		},
	
		// Ucren.Event
		Event: function( e ){
			e = e || window.event;
	
			if( !e ){
				var c = arguments.callee.caller;
				while( c ){
					e = c.arguments[0];
					if( e && typeof( e.altKey ) == "boolean" ){ // duck typing
						break;
					}
					c = c.caller;
					e = null;
				}
			}
	
			return e;
		},
	
		// Ucren.fixNumber
		fixNumber: function( unknown, defaultValue ){
			return typeof( unknown ) == "number" ? unknown : defaultValue;
		},
	
		// Ucren.fixString
		fixString: function( unknown, defaultValue ){
			return typeof( unknown ) == "string" ? unknown : defaultValue;
		},
	
		// Ucren.fixConfig
		fixConfig: function( conf ){
			var defaultConf;
			defaultConf = {};
			if( typeof conf == "undefined" ){
				return defaultConf;
			}else if( typeof conf == "function" ){
				return new conf;
			}else{
				return conf;
			}
		},
	
		// Ucren.handle
		handle: function( unknown ){
			var fn, type, number;
			fn = arguments.callee;
			if( !fn.cache ){
				fn.cache = {};
			}
			if( typeof( fn.number ) == "undefined" ){
				fn.number = 0;
			}
			type = typeof( unknown );
			if( type == "number" ){
				return fn.cache[unknown.toString()];
			}else if( type == "object" || type == "function" ){
				number = fn.number ++;
				fn.cache[number.toString()] = unknown;
				return number;
			}
		},
	
		// Ucren.id
		id: function(){
			var id = arguments.callee;
			id.number = ++ id.number || 0;
			return "_" + id.number;
		},
	
		// Ucren.loadImage
		loadImage: function( urls, onLoadComplete ){
			var length = urls.length;
			var loaded = 0;
			var check = function(){
				if( loaded == length )
					onLoadComplete && onLoadComplete();
			};
			Ucren.each( urls, function( url ){
				var img = document.createElement( "img" );
				img.onload = img.onerror = function(){
					this.onload = this.onerror = null;
					loaded ++;
					check();
				};
				Ucren.tempDom.appendChild( img );
				img.src = url;
			});
		},
	
		// Ucren.loadScript
		loadScript: function( src, callback ){
			Ucren.request( src, function( text ){
				eval( text );
				callback && callback( text );
			});
		},
	
		// Ucren.makeElement
		makeElement: function( tagName, attributes ){
			var el = document.createElement( tagName );
			var setStyle = function( unknown ){
				if( typeof unknown == "string" )
					el.style.cssText = unknown;
				else
					Ucren.apply( unknown, el.style );
			};
	
			for ( var prop in attributes ) {
				if ( prop === "class" )
					el.className = attributes[prop];
				else if ( prop === "for" )
					el.htmlFor = attributes[prop];
				else if( prop === "style" )
					setStyle( attributes[prop] );
				else
					el.setAttribute( prop, attributes[prop] );
			}
	
			return el;
		},
	
		// Ucren.nul
		nul: function(){
			return false;
		},
	
		// Ucren.queryString
		// queryString: function( name, sourceString ){
		// 	var source, pattern, result;
		// 	source = sourceString || location.href;
		// 	pattern = new RegExp( "( \\?|& )" + name + "=( [^&#]* )( #|&|$ )", "i" );
		// 	result = source.match( pattern );
		// 	return result ? result[2] : "";
		// },
	
		// Ucren.randomNumber
		randomNumber: function( num ){
			return Math.floor( Math.random() * num );
		},
	
		// Ucren.randomWord
		randomWord: function(){
			var cw = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
			return function( length, sourceString ){
				var words, re = [];
				words = sourceString || cw;
				Ucren.each( length, function( index ){
					re[index] = words.charAt( this.randomNumber( words.length ));
				}.bind( this ));
				return re.join( "" );
			}
		}(),
	
		// Ucren.request
		request: function( url, callback ){
		    var xhr;
	
		    if( window.XMLHttpRequest )
		        xhr = new XMLHttpRequest();
		    else
		        xhr = new ActiveXObject( "Microsoft.XMLHTTP" );
	
		    xhr.open( "GET", url, true );
		    xhr.onreadystatechange = function(){
		        if( xhr.readyState == 4 && xhr.status == 200 )
		            callback( xhr.responseText );
		    };
	
		    xhr.send( null );
		}
	
		// // Ucren.decodeColor
		// decodeColor: function(){
		// 	var r = /^\#?(\w{2})(\w{2})(\w{2})$/;
		// 	var x = function( x ){
		// 		return parseInt( x, 16 );
		// 	};
		// 	return function( color ){
		// 		r.test( color );
		// 		return {
		// 			red: x( RegExp.$1 ),
		// 			green: x( RegExp.$2 ),
		// 			blue: x( RegExp.$3 )
		// 		};
		// 	}
		// }(),
	
		// // Ucren.encodeColor
		// encodeColor: function(){
		// 	var x = function( x ){
		// 		return x.toString( 16 ).split( "." )[0];
		// 	};
		// 	x = x.improve( function( origin, x ){
		// 		x = origin( x );
		// 		return x.length == 1 ? "0" + x : x;
		// 	});
		// 	return function( data ){
		// 		return ["#", x( data.red ), x( data.green ), x( data.blue )].join( "" );
		// 	}
		// }()
	};
	
	//
	// [底层操作类]
	//
	
	// Ucren.BasicDrag
	Ucren.BasicDrag = Ucren.Class( 
		/* constructor */ function( conf ){
			conf = Ucren.fixConfig( conf );
			this.type = Ucren.fixString( conf.type, "normal" );
	
			var isTouch = this.isTouch = "ontouchstart" in window;
	
			this.TOUCH_START = isTouch ? "touchstart" : "mousedown",
			this.TOUCH_MOVE = isTouch ? "touchmove" : "mousemove",
			this.TOUCH_END = isTouch ? "touchend" : "mouseup";
		},
	
		/* methods */ {
			bind: function( el, handle ){
				el = Ucren.Element( el );
				handle = Ucren.Element( handle ) || el;
	
				var evt = {};
	
				evt[this.TOUCH_START] = function( e ){
					e = Ucren.Event( e );
					this.startDrag();
					e.cancelBubble = true;
					e.stopPropagation && e.stopPropagation();
					return e.returnValue = false;
				}.bind( this );
	
				handle.addEvents( evt );
				this.target = el;
				return this;
			},
	
			//private
			getCoors: function( e ){
				var coors = [];
				if ( e.targetTouches && e.targetTouches.length ) { 	// iPhone
					var thisTouch = e.targetTouches[0];
					coors[0] = thisTouch.clientX;
					coors[1] = thisTouch.clientY;
				}else{ 								// all others
					coors[0] = e.clientX;
					coors[1] = e.clientY;
				}
				return coors;
			},
	
			//private
			startDrag: function(){
				var target, draging, e;
				target = this.target;
				draging = target.draging = {};
	
				this.isDraging = true;
	
				draging.x = parseInt( target.style( "left" ), 10 ) || 0;
				draging.y = parseInt( target.style( "top" ), 10 ) || 0;
	
				e = Ucren.Event();
				var coors = this.getCoors( e );
				draging.mouseX = coors[0];
				draging.mouseY = coors[1];
	
				this.registerDocumentEvent();
			},
	
			//private
			endDrag: function(){
				this.isDraging = false;
				this.unRegisterDocumentEvent();
			},
	
			//private
			registerDocumentEvent: function(){
				var target, draging;
				target = this.target;
				draging = target.draging;
	
				draging.documentSelectStart =
					Ucren.addEvent( document, "selectstart", function( e ){
						e = e || event;
						e.stopPropagation && e.stopPropagation();
						e.cancelBubble = true;
						return e.returnValue = false;
					});
	
				draging.documentMouseMove =
					Ucren.addEvent( document, this.TOUCH_MOVE, function( e ){
						var ie, nie;
						e = e || event;
						ie = Ucren.isIe && e.button != 1;
						nie = !Ucren.isIe && e.button != 0;
						if( (ie || nie ) && !this.isTouch )
							this.endDrag();
						var coors = this.getCoors( e );
						draging.newMouseX = coors[0];
						draging.newMouseY = coors[1];
						e.stopPropagation && e.stopPropagation();
						return e.returnValue = false;
					}.bind( this ));
	
				draging.documentMouseUp =
					Ucren.addEvent( document, this.TOUCH_END, function(){
						this.endDrag();
					}.bind( this ));
	
				var lx, ly;
	
				clearInterval( draging.timer );
				draging.timer = setInterval( function(){
					var x, y, dx, dy;
					if( draging.newMouseX != lx && draging.newMouseY != ly ){
						lx = draging.newMouseX;
						ly = draging.newMouseY;
						dx = draging.newMouseX - draging.mouseX;
						dy = draging.newMouseY - draging.mouseY;
						x = draging.x + dx;
						y = draging.y + dy;
						if( this.type == "calc" )
							this.returnValue( dx, dy, draging.newMouseX, draging.newMouseY );
						else
							target.left( x ).top( y );
					}
				}.bind( this ), 10 );
			},
	
			//private
			unRegisterDocumentEvent: function(){
				var draging = this.target.draging;
				Ucren.delEvent( document, this.TOUCH_MOVE, draging.documentMouseMove );
				Ucren.delEvent( document, this.TOUCH_END, draging.documentMouseUp );
				Ucren.delEvent( document, "selectstart", draging.documentSelectStart );
				clearInterval( draging.timer );
			},
	
			//private
			returnValue: function( dx, dy, x, y ){
				//todo something
			}
		}
	 );
	
	// Ucren.Template
	Ucren.Template = Ucren.Class( 
		/* constructor */ function(){
			this.string = join.call( arguments, "" );
		},
	
		/* methods */ {
			apply: function( conf ){
				return this.string.format( conf );
			}
		}
	 );
	
	// Ucren.BasicElement
	Ucren.BasicElement = Ucren.Class( 
		/* constructor */ function( el ){
			this.dom = el;
		this.countMapping = {};
		},
	
		/* methods */ {
			isUcrenElement: true,
	
			attr: function( name, value ){
				if( typeof value == "string" ){
					this.dom.setAttribute( name, value );
				}else{
					return this.dom.getAttribute( name );
				}
				return this;
			},
	
			style: function( /* unknown1, unknown2 */ ){
				var getStyle = Ucren.isIe ?
					function( name ){
						return this.dom.currentStyle[name];
					} :
	
					function( name ){
						var style;
						style = document.defaultView.getComputedStyle( this.dom, null );
						return style.getPropertyValue( name );
					};
	
				return function( unknown1, unknown2 ){
					if( typeof unknown1 == "object" ){
						Ucren.each( unknown1, function( value, key ){
							this[key] = value;
						}.bind( this.dom.style ));
					}else if( typeof unknown1 == "string" && typeof unknown2 == "undefined" ){
						return getStyle.call( this, unknown1 );
					}else if( typeof unknown1 == "string" && typeof unknown2 != "undefined" ){
						this.dom.style[unknown1] = unknown2;
					}
					return this;
				};
			}(),
	
			hasClass: function( name ){
				var className = " " + this.dom.className + " ";
				return className.indexOf( " " + name + " " ) > -1;
			},
	
			setClass: function( name ){
				if( typeof( name ) == "string" )
					this.dom.className = name.trim();
				return this;
			},
	
			addClass: function( name ){
				var el, className;
				el = this.dom;
				className = " " + el.className + " ";
				if( className.indexOf( " " + name + " " ) == -1 ){
					className += name;
					className = className.trim();
					className = className.replace( / +/g, " " );
					el.className = className;
				}
				return this;
			},
	
			delClass: function( name ){
				var el, className;
				el = this.dom;
				className = " " + el.className + " ";
				if( className.indexOf( " " + name + " " ) > -1 ){
					className = className.replace( " " + name + " ", " " );
					className = className.trim();
					className = className.replace( / +/g, " " );
					el.className = className;
				}
				return this;
			},
	
			html: function( html ){
				var el = this.dom;
	
				if( typeof html == "string" ){
					el.innerHTML = html;
				}else if( html instanceof Array ){
					el.innerHTML = html.join( "" );
				}else{
					return el.innerHTML;
				}
				return this;
			},
	
			value: function( value ){
			  	if( typeof value == "undefined" ){
			  	    return this.dom.value;
			  	}else{
			  	   	this.dom.value = value;
			  	}
			},
	
			left: function( number ){
				var el = this.dom;
				if( typeof( number ) == "number" ){
					el.style.left = number + "px";
					this.fire( "infect", [{ left: number }] );
				}else{
					return this.getPos().x;
				}
				return this;
			},
	
			top: function( number ){
				var el = this.dom;
				if( typeof( number ) == "number" ){
					el.style.top = number + "px";
					this.fire( "infect", [{ top: number }] );
				}else{
					return this.getPos().y;
				}
				return this;
			},
	
			width: function( unknown ){
				var el = this.dom;
				if( typeof unknown == "number" ){
					el.style.width = unknown + "px";
					this.fire( "infect", [{ width: unknown }] );
				}else if( typeof unknown == "string" ){
					el.style.width = unknown;
					this.fire( "infect", [{ width: unknown }] );
					}else{
					return this.getSize().width;
					}
					return this;
				},
	
			height: function( unknown ){
					var el = this.dom;
				if( typeof unknown == "number" ){
					el.style.height = unknown + "px";
					this.fire( "infect", [{ height: unknown }] );
				}else if( typeof unknown == "string" ){
					el.style.height = unknown;
					this.fire( "infect", [{ height: unknown }] );
					}else{
					return this.getSize().height;
					}
					return this;
				},
	
			count: function( name ){
				return this.countMapping[name] = ++ this.countMapping[name] || 1;
			},
	
			display: function( bool ){
				var dom = this.dom;
				if( typeof( bool ) == "boolean" ){
					dom.style.display = bool ? "block" : "none";
					this.fire( "infect", [{ display: bool }] );
				}else{
					return this.style( "display" ) != "none";
				}
				return this;
			},
	
			first: function(){
				var c = this.dom.firstChild;
				while( c && !c.tagName && c.nextSibling ){
					c = c.nextSibling;
				}
				return c;
			},
	
			add: function( dom ){
				var el;
				el = Ucren.Element( dom );
				this.dom.appendChild( el.dom );
				return this;
			},
	
			remove: function( dom ){
				var el;
				if( dom ){
					el = Ucren.Element( dom );
					el.html( "" );
					this.dom.removeChild( el.dom );
				}else{
					el = Ucren.Element( this.dom.parentNode );
					el.remove( this );
				}
				return this;
			},
	
			insert: function( dom ){
				var tdom;
				tdom = this.dom;
				if( tdom.firstChild ){
					tdom.insertBefore( dom, tdom.firstChild );
				}else{
					this.add( dom );
				}
				return this;
			},
	
			addEvents: function( conf ){
				var blank, el, rtn;
				blank = {};
				rtn = {};
				el = this.dom;
				Ucren.each( conf, function( item, key ){
					rtn[key] = Ucren.addEvent( el, key, item );
				});
				return rtn;
			},
	
			removeEvents: function( conf ){
				var blank, el;
				blank = {};
				el = this.dom;
				Ucren.each( conf, function( item, key ){
					Ucren.delEvent( el, key, item );
				});
				return this;
			},
	
			getPos: function(){
				var el, parentNode, pos, box, offset;
				el = this.dom;
				pos = {};
	
				if( el.getBoundingClientRect ){
					box = el.getBoundingClientRect();
					offset = Ucren.isIe ? 2 : 0;
					var doc = document;
					var scrollTop = Math.max( doc.documentElement.scrollTop,
						doc.body.scrollTop );
					var scrollLeft = Math.max( doc.documentElement.scrollLeft,
						doc.body.scrollLeft );
					return {
						x: box.left + scrollLeft - offset,
						y: box.top + scrollTop - offset
					};
				}else{
					pos = {
						x: el.offsetLeft,
						y: el.offsetTop
					};
					parentNode = el.offsetParent;
					if( parentNode != el ){
						while( parentNode ){
							pos.x += parentNode.offsetLeft;
							pos.y += parentNode.offsetTop;
							parentNode = parentNode.offsetParent;
						}
					}
					if( Ucren.isSafari && this.style( "position" ) == "absolute" ){ // safari doubles in some cases
						pos.x -= document.body.offsetLeft;
						pos.y -= document.body.offsetTop;
					}
				}
	
				if( el.parentNode ){
					parentNode = el.parentNode;
				}else{
					parentNode = null;
				}
	
				while( parentNode && parentNode.tagName.toUpperCase() != "BODY" &&
					parentNode.tagName.toUpperCase() != "HTML" ){ // account for any scrolled ancestors
					pos.x -= parentNode.scrollLeft;
					pos.y -= parentNode.scrollTop;
					if( parentNode.parentNode ){
						parentNode = parentNode.parentNode;
					}else{
						parentNode = null;
					}
				}
	
				return pos;
			},
	
			getSize: function(){
				var dom = this.dom;
				var display = this.style( "display" );
	
				if ( display && display !== "none" ) {
					return { width: dom.offsetWidth, height: dom.offsetHeight };
					}
	
				var style = dom.style;
				var originalStyles = {
					visibility: style.visibility,
					position:   style.position,
					display:    style.display
				};
	
				var newStyles = {
					visibility: "hidden",
					display:    "block"
				};
	
				if ( originalStyles.position !== "fixed" )
				  newStyles.position = "absolute";
	
				this.style( newStyles );
	
				var dimensions = {
					width:  dom.offsetWidth,
					height: dom.offsetHeight
				};
	
				this.style( originalStyles );
	
				return dimensions;
			},
	
			observe: function( el, fn ){
				el = Ucren.Element( el );
				el.on( "infect", fn.bind( this ));
				return this;
			},
	
			usePNGbackground: function( image ){
				var dom;
				dom = this.dom;
				if( /\.png$/i.test( image ) && Ucren.isIe6 ){
					dom.style.filter =
						"progid:DXImageTransform.Microsoft.AlphaImageLoader( src='" +
						image + "',sizingMethod='scale' );";
					/// 	_background: none;
					///  _filter: progid:DXImageTransform.Microsoft.AlphaImageLoader( src='images/pic.png',sizingMethod='scale' );
				}else{
					dom.style.backgroundImage = "url( " + image + " )";
				}
				return this;
			},
	
			setAlpha: function(){
				var reOpacity = /alpha\s*\(\s*opacity\s*=\s*([^\)]+)\)/;
				return function( value ){
					var element = this.dom, es = element.style;
					if( !Ucren.isIe ){
						es.opacity = value / 100;
					/* }else if( es.filter === "string" ){ */
					}else{
						if ( element.currentStyle && !element.currentStyle.hasLayout )
							es.zoom = 1;
	
						if ( reOpacity.test( es.filter )) {
							value = value >= 99.99 ? "" : ( "alpha( opacity=" + value + " )" );
							es.filter = es.filter.replace( reOpacity, value );
						} else {
							es.filter += " alpha( opacity=" + value + " )";
						}
					}
					return this;
				};
			}(),
	
			fadeIn: function( callback ){
				if( typeof this.fadingNumber == "undefined" )
					this.fadingNumber = 0;
				this.setAlpha( this.fadingNumber );
	
				var fading = function(){
					this.setAlpha( this.fadingNumber );
					if( this.fadingNumber == 100 ){
						clearInterval( this.fadingInterval );
						callback && callback();
					}else
						this.fadingNumber += 10;
				}.bind( this );
	
				this.display( true );
				clearInterval( this.fadingInterval );
				this.fadingInterval = setInterval( fading, Ucren.isIe ? 20 : 30 );
	
				return this;
			},
	
			fadeOut: function( callback ){
				if( typeof this.fadingNumber == "undefined" )
					this.fadingNumber = 100;
				this.setAlpha( this.fadingNumber );
	
				var fading = function(){
					this.setAlpha( this.fadingNumber );
					if( this.fadingNumber == 0 ){
						clearInterval( this.fadingInterval );
						this.display( false );
						callback && callback();
					}else
						this.fadingNumber -= 10;
				}.bind( this );
	
				clearInterval( this.fadingInterval );
				this.fadingInterval = setInterval( fading, Ucren.isIe ? 20 : 30 );
	
				return this;
			},
	
			useMouseAction: function( className, actions ){
				/**
				 *  调用示例:  el.useMouseAction( "xbutton", "over,out,down,up" );
				 *  使用效果:  el 会在 "xbutton xbutton-over","xbutton xbutton-out","xbutton xbutton-down","xbutton xbutton-up"
				 *             等四个 className 中根据相应的鼠标事件来进行切换。
				 *  特别提示:  useMouseAction 可使用不同参数多次调用。
				 */
				if( !this.MouseAction )
					this.MouseAction = new Ucren.MouseAction({ element: this });
				this.MouseAction.use( className, actions );
				return this;
			}
		}
	 );
	
	if( Ucren.isIe )
		document.execCommand( "BackgroundImageCache", false, true );
	
	for( var i in Ucren )
	    exports[i] = Ucren[i];
	
	if( !window.Ucren )
	    window.Ucren = Ucren;;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/timeline.js
 */ 
define("scripts/timeline.js", function(exports,module){
	/**
	 * a easy timeline manager
	 * @version 1.0
	 * @author dron
	 */
	
	// FIXME: IE 下有问题
	
	var Ucren = require("scripts/lib/ucren");
	var timerCache = {};
	var timeline = {};
	
	// var timer = timeline;
	// <or>
	// var timer = timeline.use( name ).init( 10 ); // to use a new timeline instance
	// 
	// var t = timer.createTask(...);
	// t.stop();
	// 
	// timer.setTimeout(...);
	// timer.setInterval(...);
	// timer.getFPS();
	
	function ClassTimer(){
	    this.tasks = [];
	    this.addingTasks = [];
	    this.adding = 0;
	    this.running = false;
	}
	
	/**
	 * initialize timeline
	 */
	ClassTimer.prototype.init = function( ms ){
	  var me = this;
	
	  if( me.inited )
	      return me;
	  else
	    me.inited = 1;
	
	  me.startTime = now();
	  me.intervalTime = ms || 5;
	  me.count = 0;
	
	  me.intervalFn = function(){
	      me.count ++;
	      me.update( now() );
	  };
	
	  me.start();
	
	  return me;
	};
	
	
	/**
	 * create a task
	 * @param  {Object} conf  the config
	 * @return {Task}       a task instance
	 */
	ClassTimer.prototype.createTask = function( conf ){
	  /* e.g. timer.createTask({
	    start: 500, duration: 2000, data: [a, b, c,..], object: module, 
	    onTimeUpdate: fn(time, a, b, c,..), onTimeStart: fn(a, b, c,..), onTimeEnd: fn(a, b, c,..),
	    recycle: []
	  }); */
	  var task = createTask( conf );
	    this.addingTasks.unshift( task );
	    this.adding = 1;
	
	    if( conf.recycle )
	      this.taskList( conf.recycle, task );
	
	    this.start();
	
	    return task;
	};
	
	/**
	 * use a array to recycle the task
	 * @param  {Array} queue  be use for recycling task
	 * @param  {Task} task    a task instance   
	 * @return {Array}      this queue
	 */
	ClassTimer.prototype.taskList = function( queue, task ){
	  if( !queue.clear )
	    queue.clear = function(){
	      var i = this.length;
	      while( i -- )
	        task = this[i],
	        task.stop(),
	        this.splice( i, 1 );
	      return this;
	    };
	
	  if( task )
	      queue.unshift( task );
	
	  return queue;
	};
	
	/**
	 * create a timer for once callback
	 * @param {Function} fn   callback function
	 * @param {Number}   time   time, unit: ms
	 */
	ClassTimer.prototype.setTimeout = function( fn, time ){
	    // e.g. setTimeout(fn, time);
	    return this.createTask({ start: time, duration: 0, onTimeStart: fn });
	};
	
	/**
	 * create a timer for ongoing callback
	 * @param {Function} fn   callback function
	 * @param {Number}   time   time, unit: ms
	 */
	ClassTimer.prototype.setInterval = function( fn, time ){
	    // e.g. setInterval(fn, time);
	    var timer = setInterval( fn, time );
	    return {
	      stop: function(){
	          clearInterval( timer );
	      }
	    };
	};
	
	/**
	 * get the current fps
	 * @return {Number} fps number
	 */
	ClassTimer.prototype.getFPS = function(){
	  var t = now(), c = this.count, fps = c / ( t - this.startTime ) * 1e3;
	  if( c > 1e3 )
	    this.count = 0,
	    this.startTime = t;
	  return fps;
	};
	
	// privates
	
	ClassTimer.prototype.start = function(){
	  if( !this.running ){
	    this.running = true;
	    this.interval = setInterval( this.intervalFn, this.intervalTime ); 
	  }
	};
	
	ClassTimer.prototype.stop = function(){
	  this.running = false;
	  clearInterval( this.interval );
	};
	
	ClassTimer.prototype.update = function( time ){
	  var tasks = this.tasks, addingTasks = this.addingTasks, adding = this.adding;
	  var i = tasks.length, t, task, start, duration, data;
	
	  while( i -- ){
	      task = tasks[i];
	      start = task.start;
	      duration = task.duration;
	
	      if( time >= start ){
	
	        if( task.stopped ){
	            tasks.splice( i, 1 );
	            continue;
	        }
	
	        checkStartTask( task );
	        if( ( t = time - start ) < duration )
	            updateTask( task, t );
	        else
	          updateTask( task, duration ),
	          task.onTimeEnd.apply( task.object, task.data.slice(1) ),
	          tasks.splice( i, 1 );
	      }
	  }
	
	    if( adding )
	      tasks.unshift.apply( tasks, addingTasks ),
	      addingTasks.length = adding = 0;
	
	    if( !tasks.length )
	      this.stop();
	};
	
	timeline.use = function( name ){
	  var module;
	
	  if( module = timerCache[ name ] )
	      return module;
	  else
	    module = timerCache[ name ] = new ClassTimer;
	
	  return module;
	};
	
	/**
	 * @functions
	 */
	
	var now = function(){
	  return new Date().getTime();
	};
	
	var createTask = function( conf ){
	  var object = conf.object || {};
	  conf.start = conf.start || 0;
	  return {
	    start: conf.start + now(),
	    duration: conf.duration == -1 ? 86400000 : conf.duration,
	    data: conf.data ? [ 0 ].concat( conf.data ) : [ 0 ],
	    started: 0,
	    object: object,
	    onTimeStart: conf.onTimeStart || object.onTimeStart || Ucren.nul,
	    onTimeUpdate: conf.onTimeUpdate || object.onTimeUpdate || Ucren.nul,
	    onTimeEnd: conf.onTimeEnd || object.onTimeEnd || Ucren.nul,
	    stop: function(){
	        this.stopped = 1;
	    }
	  }
	};
	
	var updateTask = function( task, time ){
	  var data = task.data;
	  data[0] = time;
	  task.onTimeUpdate.apply( task.object, data );
	};
	
	var checkStartTask = function( task ){
	  if( !task.started )
	    task.started = 1,
	      task.onTimeStart.apply( task.object, task.data.slice(1) ),
	      updateTask( task, 0 );
	};
	
	/**
	 * for compatible the old version
	 */
	exports = timeline.use( "default" ).init( 10 );
	exports.use = function( name ){
	  if( Ucren.isIe )
	    return exports;
	  return timeline.use( name );
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/lib/cec.js
 */ 
define("scripts/lib/cec.js", function(exports,module){
	/**
	 * cec
	 */
	
	var CEC;
	
	;(function () {
	    
	    var mods = {},
	        KISSY;
	mods['cec/utils/prototypefix'] = (function (S) {
	    if ( !Array.prototype.forEach ) {
	        Array.prototype.forEach = function(fn, scope) {
	            for(var i = 0, len = this.length; i < len; ++i) {
	            fn.call(scope || this, this[i], i, this);
	            }
	        }
	    }
	})(KISSY);
	mods['cec/klass'] = (function (S) {
	
	    var context = S || this,
	        old = context.klass,
	        f = 'function',
	        fnTest = /xyz/.test(function () {
	            xyz
	        }) ? /\bsupr\b/ : /.*/,
	        proto = 'prototype';
	
	        function klass(o) {
	            return extend.call(isFn(o) ? o : function () {}, o, 1)
	        }
	
	        function isFn(o) {
	            return typeof o === f
	        }
	
	        function wrap(k, fn, supr) {
	            return function () {
	                var tmp = this.supr;
	                this.supr = supr[proto][k];
	                var undef = {}.fabricatedUndefined;
	                var ret = undef;
	                try {
	                    ret = fn.apply(this, arguments);
	                } finally {
	                    this.supr = tmp;
	                }
	                return ret;
	            }
	        }
	
	        function process(what, o, supr) {
	            for (var k in o) {
	                if (o.hasOwnProperty(k)) {
	                    what[k] = isFn(o[k]) && isFn(supr[proto][k]) && fnTest.test(o[k]) ? wrap(k, o[k], supr) : o[k];
	                }
	            }
	        }
	
	        function extend(o, fromSub) {
	            // must redefine noop each time so it doesn't inherit from previous arbitrary classes
	            function noop() {}
	            noop[proto] = this[proto];
	            var supr = this,
	                prototype = new noop(),
	                isFunction = isFn(o),
	                _constructor = isFunction ? o : this,
	                _methods = isFunction ? {} : o;
	
	                function fn() {
	                    if (this.initialize) this.initialize.apply(this, arguments)
	                    else {
	                        fromSub || isFunction && supr.apply(this, arguments);
	                        _constructor.apply(this, arguments);
	                    }
	                }
	
	            fn.methods = function (o) {
	                process(prototype, o, supr);
	                fn[proto] = prototype;
	                return this;
	            }
	
	            fn.methods.call(fn, _methods).prototype.constructor = fn;
	
	            fn.extend = arguments.callee;
	            fn[proto].implement = fn.statics = function (o, optFn) {
	                o = typeof o == 'string' ? (function () {
	                    var obj = {};
	                    obj[o] = optFn;
	                    return obj;
	                }()) : o;
	                process(this, o, supr);
	                return this;
	            }
	
	            return fn;
	        }
	
	    klass.noConflict = function () {
	        context.klass = old;
	        return this;
	    }
	
	    return klass;
	
	})(KISSY,mods['cec/utils/prototypefix']);
	mods['cec/notifier/index'] = (function (S, Klass) {
	    
	    var Notifier = Klass({
	        fire: function (ev, data) {
	            this._events = this._events || {};
	            var evs = this._events[ev];
	            var args = Array.prototype.slice.call(arguments, 1);
	            if (evs && evs.length) {
	                for (var i = 0; i < evs.length; i ++) {
	                    evs[i].apply(this, args);
	                }
	            }
	            return this;
	        },
	        on: function (ev, callback) {
	            this._events = this._events || {};
	            if (!this._events[ev]) {
	                this._events[ev] = [];
	            }
	            this._events[ev].push(callback);
	            return this;
	        },
	        off: function (ev, callback) {
	            this._events = this._events || {};
	            if (!callback) {
	                delete this._events[ev];
	            } else {
	                for (var i = 0; i < this._events[ev].length; i ++) {
	                    if (callback == this._events[ev][i]) {
	                        this._events[ev].splice(i, 1);
	                        break;
	                    }
	                }
	            }
	            return this;
	        },
	        mix: function () {
	            var target, source;
	            if (arguments.length == 1) {
	                target = this;
	                source = arguments[0];
	            }
	            for (var k in source) {
	                target[k] = source[k];
	            }
	
	            return target;
	        }
	    });
	    Notifier.singleton = new Notifier();
	
	    return Notifier;
	
	})(KISSY,mods['cec/klass']);
	mods['cec/loader/index'] = (function (S, Notifier) {
		
		var Loader = Notifier.extend({
			loadedImages: {},
			initialize: function (assets, cb) {
				this.load(assets, cb);
			},
			_tryLoadImg: function (img) {
				var src, tryTime, me = this, timeout = [5000, 3000, 2000];
				if (typeof img == 'string') {
					src = img;
					tryTime = 1;
				} else {
					src = img.originalSrc;
					tryTime = parseInt(img.tryTime) + 1;
				}
	
				if (tryTime > 3) {
					me.loaded ++;
					me.loadedImages[src] = img;
					me.invoke(img);
					img = null;
					return ;
				}
	
				tryTime > 1 && console.log('retry: ' + src);
	
				var img = new Image();
				
				img.originalSrc = src;
				img.tryTime = tryTime;
				img.onload = function () {
					clearTimeout(img._timer);
					me.loaded ++;
					me.loadedImages[src] = img;
					me.invoke(img);
					img = null;
				}
	
				img.onerror = function () {
					clearTimeout(img._timer);
					me._tryLoadImg(img);
				}
	
				img._timer = setTimeout(function () {
					me._tryLoadImg(img);
				}, (timeout[tryTime - 1] || 5000));
	
				img.src = src;
			},
			/**
			 * [load description]
			 * @param  {[Array]}   assets [description]
			 * @param  {Function} cb     [description]
			 * @return {[type]}          [description]
			 */
			load: function (assets, cb) {
				var me = this;
	
				this.loaded = 0;
				this.assets = assets;
				this.cb = cb;
				this.loadLength = assets.length;
	
				this.invoke()
	
				for (var i = 0; i < this.loadLength; i ++) {
					var src = assets[i],
						img = this.loadedImages[src];
					if (img) {
						this.loaded++;
						this.invoke(img);
					} else {
						me._tryLoadImg(src);
					}
				}
			},
			invoke: function (img) {
				this.cb && this.cb.call(this, this.loaded/this.loadLength, img);
			}
		});
	
		Loader.belongto = function (Sprite) {
			Loader.prototype.mix(Sprite.prototype.__cache__.images, Loader.prototype.loadedImages);
			Loader.prototype.loadedImages = Sprite.prototype.__cache__.images;
		}
	
		return Loader;
	
	})(KISSY,mods['cec/notifier/index']);
	mods['cec/sprite/cobject'] = (function (S, Notifier) {
	    
	    var Cobject = Notifier.extend({
	        points: null,
	        x: 0,
	        y: 0,
	        scaleX: 1,
	        scaleY: 1,
	        angle: 0,
	        fillColor: 'rgba(0,0,0,0)',
	        borderWidth: 0,
	        borderColor: null,
	        opacity: 1,
	        zIndex: 0,
	        visible: true,
	        backgroundImage: null,
	        backgroundRepeat: 'repeat', // repeat|repeat-x|repeat-y|no-repeat
	        backgroundPosition: '0 0', // '0 0'
	        backgroundPositionX: 0,
	        backgroundPositionY: 0,
	        backgroundSize: null, // 'auto auto'
	        backgroundWidth: 'auto',
	        backgroundHeight: 'auto',
	
	        initialize: function (options) {
	            if (!options) return;
	            if (typeof options == 'string') {
	                options = (document && document.getElementById) ? document.getElementById(options) : options;
	            }
     
	            if (options.getContext) {
	                this.canvas = options;
	                this.ctx = options.getContext('2d');
	                this.width = this.canvas.width;
	                this.height = this.canvas.height;
	                this.points = [[0,0], [this.width, 0], [this.width, this.height], [0, this.height]];
	
	                this.type = 'stage';
	                this.shape = 'rect';
	            } else {
	                //this.mix(options);
	                
	                for (var k in options) {
	                    if (options[k] === undefined) continue;
	                    this[k] = options[k];
	                }
	                
	                this.type = 'sprite';
	            }
	
	            this._getUniqueId();
	        },
	        _getUniqueId: function () {
	            var i = 0;
	            return function () {
	                this.id = (i++);
	            }
	        }(),
	        getId: function () {
	            return this.id;
	        },
	        _getFixZIndex: function () {
	            var map = {}
	            return function (z) {
	                if (typeof map[z] != 'number') {
	                    map[z] = 0;
	                }
	                map[z] ++;
	                return (z + map[z]/10000);
	            }
	        }()
	    });
	
	    return Cobject;
	
	})(KISSY,mods['cec/notifier/index']);
	mods['cec/sprite/sprite'] = (function (S, Cobject) {
	    
	    var Sprite = Cobject.extend({
	        __cache__: {
	            images: {},
	            audio: {}
	        },
	        _htmlevents: 'click,dblclick,mousedown,mousemove,mouseover,mouseout,mouseup,keydown,keypress,keyup,touchstart,touchend,touchcancel,touchleave,touchmove',
	        initialize: function (options) {
	            this.supr(options);
	
	            this.parent = null;
	            this.children = [];
	            this.boundingRect = [];
	            
	            this._imgLength = -1;
	            this.backgroundImageReady = false;
	            this.loadedImgs = [];
	
	            this._updateBounding();
	            this._dealImgs();
	            
	        },
	        _updateBounding: function () {
	            // get bounding rect
	            if (this.points) {
	                var xs = [],
	                    ys = [],
	                    minX, maxX, minY, maxY;
	                this.points.forEach(function (o) {
	                    xs.push(o[0]);
	                    ys.push(o[1]);
	                });
	
	                minX = Math.min.apply(null, xs);
	                maxX = Math.max.apply(null, xs);
	                minY = Math.min.apply(null, ys);
	                maxY = Math.max.apply(null, ys);
	
	                this.boundingRect = [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]];
	                this.width = Math.abs(maxX - minX);
	                this.height = Math.abs(maxY - minY);
	
	            } else if (this.width && this.height) {
	                this.points = [[0, 0], [this.width, 0], [this.width, this.height], [0, this.height]];
	                this.boundingRect = this.points;
	            }
	        },
	        _dealImgs: function () {
	            var self = this,
	                hasFC = typeof FlashCanvas != 'undefined';
	            if (typeof this.backgroundImage == 'string') {
	                //hack flashcanvas
	                if (hasFC) {
	                    //console.log(this.backgroundImage)
	                    //this.backgroundImage += /\?/.test(this.backgroundImage) ? ('&t=' + Math.random()) : ('?t='+Math.random());
	                }
	
	                //one img url
	                this._imgLength = 1;
	
	                var src = this.backgroundImage,
	                    cacheImg = this.__cache__.images[src]; //console.log(cacheImg)
	                if (cacheImg) { //debugger;
	                    self.loadedImgs.push(cacheImg);
	                    self._checkImgs();
	                    return;
	                }
	
	                function imgOnload () {
	                    self.loadedImgs.push(img);
	                    self._checkImgs();
	                    self.__cache__.images[src] = img;
	                }
	                var img = new Image();
	                img.onload = imgOnload;
	                img.src = src;
	
	                // fix flashcanvas load image
	                // if (typeof FlashCanvas != 'undefined') {
	                //     img = {};
	                //     img.src = src;
	                //     imgOnload();
	                // }
	            } else if (this.backgroundImage && this.backgroundImage.nodeType == 1 && this.backgroundImage.nodeName == 'IMG') {
	                //one img el
	                this._imgLength = 1;
	                if (this.backgroundImage.width > 0 || this.backgroundImage.height > 0) {
	                    self.loadedImgs.push(this.backgroundImage);
	                    self._checkImgs();
	                } else {
	                    self.backgroundImage.onload = function () {
	                        self.loadedImgs.push(self.backgroundImage);
	                        self._checkImgs();
	                    }
	                }
	
	            } else if (Object.prototype.toString.call(this.img) == '[object Array]') {
	                // img array
	                this._imgLength = this.backgroundImage.length;
	                //todo ...
	            }
	        },
	        _checkImgs: function () {
	            if (this.loadedImgs.length == this._imgLength) {
	                this.backgroundImageReady = true;
	
	                if (this._imgLength == 1) {
	                    this.backgroundImageElement = this.loadedImgs[0];
	                    this.fire('img:ready', this.backgroundImageElement);
	                } else if (this._imgLength > 1) {
	                    this.fire('img:ready', this.loadedImgs);
	                }
	
	            }
	        },
	        
	        _delegateHtmlEvents: function (ev, callback) {
	            //private 
	            var win = window,
	                self = this,
	                html = document.documentElement || {scrollLeft:0, scrollTop: 0};
	            function getWindowScroll() {
	                return {
	                    x: (win.pageXOffset || html.scrollLeft),
	                    y: (win.pageYOffset || html.scrollTop)
	                };
	            }
	            //private
	            function getOffset(el) {
	                el = el || self.canvas;
	                var width = el.offsetWidth || el.width,
	                    height = el.offsetHeight || el.height,
	                    top = el.offsetTop || 0,
	                    left = el.offsetLeft || 0;
	                while (el = el.offsetParent) {
	                    top = top + el.offsetTop;
	                    left = left + el.offsetLeft;
	                }
	                return {
	                    top: top,
	                    left: left,
	                    width: width,
	                    height: height
	                };
	            }
	
	
	            if (this.type == 'stage') {
	                this.canvas.addEventListener(ev, function (e) {
	                    e.originalTarget = e.target;
	                    //find target
	                    var stageOffsetX, stageOffsetY, targetOffsetX, targetOffsetY,
	                        of = getOffset(self.canvas),
	                        winScroll = getWindowScroll();
	
	                    if (/touch/.test(ev) && e.touches[0]) {
	                        var touch = e.touches[0];
	                        stageOffsetX = touch.pageX - of.left;
	                        stageOffsetY = touch.pageY - of.top;
	                    } else {
	                        stageOffsetX = e.clientX + winScroll.x - of.left;
	                        stageOffsetY = e.clientY + winScroll.y - of.top;
	                    }
	
	                    //console.log(stageOffsetX, stageOffsetY)
	                    var target = self._findTarget(stageOffsetX, stageOffsetY);
	                    e.targetSprite = target;
	                    //e._target = target;
	                    e.stageOffsetX = stageOffsetX;
	                    e.stageOffsetY = stageOffsetY;
	                    e.spriteOffsetX = target._ev_offsetX;
	                    e.spriteOffsetY = target._ev_offsetY;
	                    //console.log(stageOffsetX,stageOffsetY,e.spriteOffsetX,e.spriteOffsetY)
	
	                    delete target._ev_offsetX;
	                    delete target._ev_offsetY;
	
	                    callback && callback(e);
	
	                }, false);
	
	            } else {
	                console && console.warn('only `stage` type can delegate HTMLEvents!');
	            }
	        },
	        _findTarget: function (x, y) {
	            var hoverSprites = [];
	            hoverSprites.push(this);
	
	            function find (o, l, t) {
	                if (o.children && o.children.length) {
	                    for (var i = 0, len = o.children.length; i < len; i ++) {
	                        var c = o.children[i],
	                            posc = [l + c.x, t + c.y, l + c.x + c.width, t + c.y + c.height];
	                        if (x > posc[0] && x < posc[2] && y > posc[1] && y < posc[3]) {
	                            c._ev_offsetX = x - (l + c.x);
	                            c._ev_offsetY = y - (t + c.y);
	                            hoverSprites.push(c);
	                        }
	                        find(c, posc[0], posc[1]);
	                    }
	                }
	            }
	            find(this, this.x, this.y);
	
	            //console.log(hoverSprites[hoverSprites.length-1]);
	            return hoverSprites[hoverSprites.length-1];
	        },
	
	        add: function (o) {
	            o.parent = this;
	            o.stage = this.type == 'stage' ? this : this.stage;
	            o.canvas = this.canvas;
	            o.ctx = this.ctx;
	            o._zindex = this._getFixZIndex(parseInt(o.zIndex));
	
	            this.children.push(o);
	            this.children.sort(function (a, b) {
	                return a._zindex - b._zindex;
	            });
	
	            return this;
	        },
	        setZIndex: function (z) {
	            this.zIndex = parseInt(z);
	            this._zindex = this._getFixZIndex(this.zIndex);
	        },
	        appendTo: function (o) {
	            //console.log(o instanceof Sprite);
	            if (o instanceof Sprite) {
	                o.add(this);
	            }
	            return this;
	        },
	        remove: function (o) {
	            var target, parent;
	            if (!o) {
	                target = this;
	                parent = this.parent;
	            } else {
	                target = o;
	                parent = this;
	            }
	            for (var i = 0; i < parent.children.length; i ++) {
	                if (target == parent.children[i]) {
	                    target.parent = null;
	                    target.stage = null;
	                    parent.children.splice(i, 1);
	                    return target;
	                }
	            }
	
	        },
	        getIndex: function () {
	            if (this.parent) {
	                for (var i = 0; i < this.parent.children.length; i ++) {
	                    if (this == this.parent.children[i]) {
	                        return i;
	                    }
	                }
	            }
	            return -1;
	        },
	        getChildIndex: function (c) {
	            for (var i = 0; i < this.children.length; i ++) {
	                if (this.children[i] == c) {
	                    return i;
	                }
	            }
	            return -1;
	        },
	        contains: function (c) {
	            return (this.getChildIndex(c) > -1);
	        },
	        containsPoint: function (p) {
	            var x, y;
	            if (Object.prototype.toString.call(p) == '[object Array]') {
	                x = p[0];
	                y = p[1];
	            } else if (typeof p == 'object') {
	                x = p.x;
	                y = p.y;
	            }
	
	            var cross = 0;
	            for (var i = 0, len = this.points.length; i < len; i ++) {
	                var p0 = this.points[i],
	                    p1 = i == len -1 ? this.points[0] : this.points[i + 1],
	                    p0p1 = Math.sqrt(Math.pow(p1[0]-p0[0], 2) + Math.pow(p1[1]-p0[1], 2)),
	                    pp0 = Math.sqrt(Math.pow(p0[0]-x, 2) + Math.pow(p0[1]-y, 2)),
	                    pp1 = Math.sqrt(Math.pow(p1[0]-x, 2) + Math.pow(p1[1]-y, 2)),
	                    maxY = Math.max(p0[1], p1[1]),
	                    minY = Math.min(p0[1], p1[1]);
	
	                if (pp0 + pp1 == p0p1) {
	                    return true;
	                } else if (y < minY || y > maxY) {
	                    continue;
	                } else {
	                    var _x = (y-minY)*(p1[0]-p0[0])/(p1[1]-p0[1]);
	                    if (_x > x) {
	                        cross ++
	                    }
	                }
	            }
	
	            return (cross%2 == 1);
	        },
	        isVisible: function () {
	            var self = this;
	            while (self) {
	                if (!self.visible) {
	                    return false;
	                }
	                self = self.parent;
	            }
	            return true;
	        },
	        show: function () {
	            this.visible = true;
	            return this;
	        },
	        hide: function () {
	            this.visible = false;
	            return this;
	        },
	        render: function (dt) {
	            var self = this;
	            dt = dt || 0.016;
	
	            if (!self.visible) {return}
	
	            self.ctx.save();
	            self.type == 'stage' && self.ctx.translate(self.x, self.y)
	            self.fire('render:before', dt);
	            self._render(dt);
	            
	            for (var i = 0, len = self.children.length; i < len ; i++) {
	                self.ctx.save();
	                self.ctx.translate(self.children[i].x, self.children[i].y);
	                self.children[i].render(dt);
	                self.ctx.restore();
	            }
	            
	            self.fire('render:after', dt);
	            self.ctx.restore();
	
	            return this;
	        },
	        _render: function (dt) {
	            var p = this.points,
	                relativeX = this.width/2,
	                relativeY = this.height/2;
	            
	            this.ctx.fillStyle = this.fillColor;
	
	            this.ctx.translate(relativeX, relativeY);
	            this.ctx.rotate(this.angle * Math.PI/180);
	            this.ctx.scale(this.scaleX, this.scaleY);
	
	            this.ctx.beginPath();
	            this.ctx.moveTo(p[0][0]-relativeX, p[0][1]-relativeY);
	            for (var i = 1, len = p.length; i < len; i ++) {
	                this.ctx.lineTo(p[i][0]-relativeX, p[i][1]-relativeY);
	            }
	            this.ctx.lineTo(p[0][0]-relativeX, p[0][1]-relativeY);
	            this.ctx.closePath();
	            this.ctx.translate(-relativeX, -relativeY);
	
	            this.ctx.globalAlpha = this.opacity;
	            this.fillColor && this.ctx.fill();
	
	            if (this.borderWidth && this.borderWidth > 0) {
	                this.ctx.lineWidth = parseFloat(this.borderWidth);
	                this.ctx.strokeStyle = this.borderColor;
	                //fix lineWidth=1
	
	                this.ctx.stroke();
	            }
	
	        },
	        clear: function (x, y, w, h) {
	            if (x == undefined) x = 0;
	            if (y == undefined) y = 0;
	            if (w == undefined) w = this.width;
	            if (h == undefined) h = this.height;
	            this.ctx.clearRect(x, y, w, h);
	
	            return this;
	        },
	        on: function (ev, callback) {
	            if ((','+this._htmlevents+',').indexOf(','+ev+',') > -1) {
	                // bubble events binding
	                // todo
	            } else {
	                this.supr(ev, callback);
	            }
	            return this;
	        },
	        delegate: function (ev, callback) {
	            // capture target events binding
	            if ((','+this._htmlevents+',').indexOf(','+ev+',') > -1) {
	                this._delegateHtmlEvents(ev, callback);
	            }
	            return this;
	        },
	        _set: function (param) {
	            for (var k in param) {
	                if (typeof param[k] == 'string') {
	                    var matchSymbol = (''+param[k]).match(/^([\+\-\*\/])(\d+(\.\d+)?)$/);
	                    if (matchSymbol) { 
	                        var symbol = matchSymbol[1],
	                            num = parseFloat(matchSymbol[2]);
	                        switch(symbol) {
	                            case '+':
	                                param[k] = parseFloat(this[k]) + num;
	                                break;
	                            case '-':
	                                param[k] = parseFloat(this[k]) - num;
	                                break;
	                            case '*':
	                                param[k] = parseFloat(this[k]) * num;
	                                break;
	                            case '/':
	                                param[k] = parseFloat(this[k]) / num;
	                                break;
	                        }
	                    }
	                }
	                this[k] = param[k];
	            }
	            return this;
	        },
	        // set 
	        set: function (param, autoRender) {
	            this._set(param);
	            if (autoRender && this.stage) {
	                this.stage.clear();
	                this.stage.render();
	            }
	            return this;
	        },
	        //setAngle
	        setAngle: function (angle, autoRender) {
	            return this.set({angle:angle}, autoRender);
	        },
	        //rotate - alias of setAngle
	        rotate: function (angle, autoRender) {
	            return this.setAngle(angle, autoRender);
	        },
	        setFillColor: function (fillColor, autoRender) {
	            return this.set({fillColor: fillColor}, autoRender);
	        },
	        setXY: function (x, y, autoRender) {
	            if (x == undefined) x = '+0';
	            if (y == undefined) y = '+0';
	            return this.set({x:x, y:y}, autoRender);
	        },
	        //alias of setXY
	        moveTo: function (x, y, autoRender) {
	            return this.setXY(x, y, autoRender);
	        },
	        setX: function (x, autoRender) {
	            return this.setXY(x, '+0', autoRender);
	        },
	        setY: function (y, autoRender) {
	            return this.setXY('+0', y, autoRender);
	        },
	        setScale: function (scalex, scaley, autoRender) {
	            if (scalex == undefined) scalex = '+0';
	            if (scaley == undefined) scaley = '+0';
	            return this.set({scaleX:scalex, scaleY: scaley}, autoRender);
	        },
	        setScaleX: function (scalex, autoRender) {
	            return this.setScale(scalex, '+0', autoRender);
	        },
	        setScaleY: function (scaley, autoRender) {
	            return this.setScale('+0', scaley, autoRender);
	        },
	        setOpacity: function (op, autoRender) {
	            this.set({opacity: op}, autoRender); 
	            this.opacity = Math.min(1, Math.max(this.opacity, 0));
	            return this;  
	        } 
	
	    });
	
	    return Sprite;
	
	})(KISSY,mods['cec/sprite/cobject']);
	mods['cec/sprite/rectsprite'] = (function (S, Sprite) {
		
		var RectSprite = Sprite.extend({
	
			initialize: function (options) {
				
				this.shape = 'rect';
	            this._backgroundCanvas = document && document.createElement('canvas');
	            if (typeof FlashCanvas != "undefined") {
	                FlashCanvas.initElement(this._backgroundCanvas);
	                this._backgroundCanvas.style.position = 'absolute';
	                this._backgroundCanvas.style.left = 0;
	                this._backgroundCanvas.style.top = 0;
	                //document.body.appendChild(this._backgroundCanvas);
	            }
	
	            if (this._backgroundCanvas.getContext) {
	                this._backgroundCanvasCtx = this._backgroundCanvas.getContext('2d');
	            }
	            
	
	            this.supr(options);
			},
	        _checkImgs: function () {
	            this.supr();
	            if (this.backgroundImageReady) {
	                this._getBackgroundPosition();
	                this._updateBackgroundCanvas();
	            }
	        },
	        _updatePoints: function () {
	            this.points = [[0,0], [this.width, 0], [this.width, this.height], [0, this.height]];
	        },
			set: function (param, autoRender) {
				this._set(param);
	            if (/^([\+\-\*\/])?\d+$/.test(param['width']) || /^([\+\-\*\/])?\d+$/.test(param['height'])) {
	                this._updatePoints();
	            	this._updateBounding();	
	            }
	            if (autoRender && this.stage) {
	                this.stage.clear();
	                this.stage.render();
	            }
	            return this;
			},
			setDim: function (w, h, autoRender) {
				if (w == undefined) w = '+0';
				if (h == undefined) h = '+0';
				return this.set({width:w, height:h}, autoRender);
			},
			setWidth: function (w, autoRender) {
				return this.setDim(w, '+0', autoRender);
			},
			setHeight: function (h, autoRender) {
				return this.setDim('+0', h, autoRender);
			},
	        setBackgroundPosition: function (pos, autoRender) {
	            if (!this.backgroundImageReady) return this;
	            this.set({backgroundPosition: (typeof pos == 'string' ? pos : pos.join(' '))}, autoRender);
	            this._getBackgroundPosition();
	            return this;
	        },
	        setBackgroundPositionX: function (x, autoRender) {
	            if (!this.backgroundImageReady) return this;
	            this.set({backgroundPositionX:x});
	            return this.setBackgroundPosition([this.backgroundPositionX, this.backgroundPositionY], autoRender);
	        },
	        setBackgroundPositionY: function (y, autoRender) {
	            if (!this.backgroundImageReady) return this;
	            this.set({backgroundPositionY:y});
	            return this.setBackgroundPosition([this.backgroundPositionX, this.backgroundPositionY], autoRender);
	        },
	        setBackgroundSize: function (size, autoRender) {
	            if (!this.backgroundImageReady) return this;
	            this.set({backgroundSize: (typeof size == 'string' ? size : size.join(' '))}, autoRender);
	            this._getBackgroundPosition();
	            this._updateBackgroundCanvas();
	            return this;
	        },
	        setBackgroundWidth: function (w, autoRender) {
	            if (!this.backgroundImageReady) return this;
	            this.set({backgroundWidth:w});
	            return this.setBackgroundSize([this.backgroundWidth, this.backgroundHeight], autoRender);
	        },
	        setBackgroundHeight: function (h, autoRender) {
	            if (!this.backgroundImageReady) return this;
	            this.set({backgroundHeight:h});
	            return this.setBackgroundSize([this.backgroundWidth, this.backgroundHeight], autoRender);
	        },
			_render: function (dt) {
				this.supr(dt);
				this._drawBackgroundImage(dt);
			},
			_drawBackgroundImage: function (dt) {
				//images
	            if (this.backgroundImageElement) {
	                var bgPos = [this.backgroundPositionX, this.backgroundPositionY],
	                    imgEl = typeof FlashCanvas != 'undefined' ? this.backgroundImageElement : (this._backgroundCanvas || this.backgroundImageElement),
	                    //imgEl = (this._backgroundCanvas || this.backgroundImageElement),
	                    iw = imgEl.width,
	                    ih = imgEl.height,
	                    fixPos = this.borderWidth ? this.borderWidth/2 : 0;
	
	                //rect sprite support image
	                if (this.shape == 'rect') {
	
	                    if (this.backgroundRepeat == 'no-repeat') {
	                        this.ctx.beginPath();
	                        this.ctx.rect(0, 0, this.width, this.height);
	                        this.ctx.closePath();
	                        this.ctx.clip();
	                        this.ctx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, bgPos[0], bgPos[1], imgEl.width, imgEl.height);
	
	                    } else if (this.backgroundRepeat == 'repeat-x') {
	 
	                        var col = Math.ceil(this.width/iw) + 1,
	                            row = 1,
	                            fixX = bgPos[0]%iw;
	                        if (fixX > 0) fixX = fixX - iw;
	
	                        this.ctx.beginPath();
	                        this.ctx.rect(0, 0, this.width, this.height);
	                        this.ctx.closePath();
	                        this.ctx.clip();
	
	                        for (var c = 0; c < col; c ++) {
	                            this.ctx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, c*imgEl.width+fixX, bgPos[1], imgEl.width, imgEl.height);
	                        }
	
	                    } else if (this.backgroundRepeat == 'repeat-y') {
	
	                        var col = 1,
	                            row = Math.ceil(this.height/ih) + 1,
	                            fixY = bgPos[1]%ih;
	                        if (fixY > 0) fixY = fixY - ih;
	
	                        this.ctx.beginPath();
	                        this.ctx.rect(0, 0, this.width, this.height);
	                        this.ctx.closePath();
	                        this.ctx.clip();
	
	                        for (var r = 0; r < row; r ++) {
	                            this.ctx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, bgPos[0], r*ih+fixY, iw, ih);
	                        }
	
	                    } else if (this.backgroundRepeat == 'repeat') {
	                        var col = Math.ceil(this.width/iw) + 1,
	                            row = Math.ceil(this.height/ih) + 1,
	                            fixX = bgPos[0]%iw,
	                            fixY = bgPos[1]%ih;
	                        if (fixX > 0) fixX = fixX - iw;
	                        if (fixY > 0) fixY = fixY - ih;
	
	                        this.ctx.beginPath();
	                        this.ctx.rect(0, 0, this.width, this.height);
	                        this.ctx.closePath();
	                        this.ctx.clip();
	
	                        for (var c = 0; c < col; c ++) {
	                            for (var r = 0; r < row; r ++) {
	                                this.ctx.drawImage(imgEl, 0, 0, iw, ih, c*iw+fixX, r*ih+fixY, iw, ih);
	                            }
	                        } 
	                    }
	                }
	            }
			},
	        _getBackgroundPosition: function () {
	            var pos = [0, 0],
	                bgsize = this._getBackgroundSize(),
	                imgEl = this._backgroundCanvas,
	                imgWidth = bgsize[0] || imgEl.width,
	                imgHeight = bgsize[1] || imgEl.height;
	
	            if (typeof this.backgroundPosition == 'string') {
	                pos = this.backgroundPosition.split(' ');
	                if (pos[0] == 'left') pos[0] = '0%';
	                if (pos[0] == 'center') pos[0] = '50%';
	                if (pos[0] == 'right') pos[0] = '100%';
	                if (pos[1] == 'top') pos[1] = '0%';
	                if (pos[1] == 'center') pos[1] = '50%'
	                if (pos[1] == 'bottom') pos[1] = '100%';
	
	                pos[0] = /^[\+\-]?\d+\%$/.test(pos[0]) ? ((this.width - imgWidth) * parseFloat(pos[0])/100) : parseFloat(pos[0]);
	                pos[1] = /^[\+\-]?\d+\%$/.test(pos[1]) ? ((this.height - imgHeight) * parseFloat(pos[1])/100) : parseFloat(pos[1]);
	
	            } else if (Object.prototype.toString.call(this.backgroundPosition) == '[object Array]') {
	                pos = this.backgroundPosition;
	            }
	
	            this.backgroundPositionX = pos[0];
	            this.backgroundPositionY = pos[1];
	            return pos;
	        },
	        _getBackgroundSize: function () {
	            var imgEl = this.backgroundImageElement,
	                imgWidth = this.frameWidth || imgEl.width,
	                imgHeight = this.frameHeight || imgEl.height,
	                bgsize = [imgWidth, imgHeight];
	            if (typeof this.backgroundSize == 'string') {
	                bgsize = this.backgroundSize.split(' ');
	                if (bgsize.length == 1) bgsize[1] = 'auto';
	                if (bgsize[0] == 'auto' && bgsize[1] == 'auto') {
	                    bgsize[0] = imgWidth;
	                    bgsize[1] = imgHeight;
	                } else if (bgsize[0] == 'auto') {
	                    bgsize[1] = /^[\+\-]?\d+\%$/.test(bgsize[1]) ? (this.height * parseFloat(bgsize[1])/100) : parseFloat(bgsize[1]);
	                    bgsize[0] = imgWidth*bgsize[1]/imgHeight;
	                } else if (bgsize[1] == 'auto') {
	                    bgsize[0] = /^[\+\-]?\d+\%$/.test(bgsize[0]) ? (this.width * parseFloat(bgsize[0])/100) : parseFloat(bgsize[0]);
	                    bgsize[1] = imgHeight*bgsize[0]/imgWidth;
	                } else {
	                    bgsize[0] = /^[\+\-]?\d+\%$/.test(bgsize[0]) ? (this.width * parseFloat(bgsize[0])/100) : parseFloat(bgsize[0]);
	                    bgsize[1] = /^[\+\-]?\d+\%$/.test(bgsize[1]) ? (this.height * parseFloat(bgsize[1])/100) : parseFloat(bgsize[1]);
	                }
	                bgsize[0] = Math.floor(Math.max(0, bgsize[0]));
	                bgsize[1] = Math.floor(Math.max(0, bgsize[1]));
	            }
	            this.backgroundWidth = bgsize[0];
	            this.backgroundHeight = bgsize[1];
	
	            return bgsize;
	        },
	        _updateBackgroundCanvas: function () {
	            var imgEl = this.backgroundImageElement,
	                imgWidth = imgEl.width,
	                imgHeight = imgEl.height;
	            if (this._backgroundCanvas) {
	               this._backgroundCanvas.width = this.backgroundWidth;
	                this._backgroundCanvas.height = this.backgroundHeight;
	                this._backgroundCanvasCtx.drawImage(this.backgroundImageElement, 0, 0, imgWidth, imgHeight, 0, 0, this.backgroundWidth, this.backgroundHeight); 
	            }
	            
	        }
		});
	
		return RectSprite;
	
	})(KISSY,mods['cec/sprite/sprite']);
	mods['cec/sprite/textsprite'] = (function (S, RectSprite) {
	    
	    var TextSprite = RectSprite.extend({
	        text: null,
	        textType: 'fill', //'stroke'
	        textColor: '#000',
	        //font: 'normal normal 14px Arial', // style weight size family
	        fontSize: 14,
	        fontFamily: 'Arial',
	        fontStyle: 'normal',
	        fontWeight: 'normal',
	        lineHeight: 21,
	        textAlign: 'left',
	        verticalAlign: 'top',
	        //textOffset: '0 0 0 0',
	        textOffsetTop: 0,
	        textOffsetRight: 0,
	        textOffsetBottom: 0,
	        textOffsetLeft: 0,
	
	        initialize: function (options) {
	            options = this._prepare(options);
	            this.supr(options);
	
	            this._textCanvas = document.createElement('canvas');
	            if (typeof FlashCanvas != "undefined") {
	                FlashCanvas.initElement(this._textCanvas);
	                this._textCanvas.style.position = 'absolute';
	                this._textCanvas.style.left = 0;
	                this._textCanvas.style.top = 0;
	                //document.body.appendChild(this._textCanvas);
	            }
	            this._textCtx = this._textCanvas.getContext('2d');
	            this._updateTextCanvas();
	        },
	        _prepare: function (opt) {
	            opt = this._prepareFont(opt);
	            opt = this._prepareTextOffset(opt);
	            return opt;
	        },
	        _prepareFont: function (opt) {
	            var style = {
	                normal: 1,
	                italic: 1,
	                oblique: 1
	            },
	            weight = {
	                normal: 1,
	                bold: 1,
	                bolder: 1,
	                lighter: 1
	            };
	
	            if (opt.font) {
	                var arr = opt.font.split(' ');
	                if (arr.length == 1) {
	                    //family
	                    if (!opt.fontFamily) opt.fontFamily = arr[0];
	
	                } else if (arr.length == 2) {
	                    // size family
	                    if (!opt.fontFamily) opt.fontFamily = arr[1];
	                    var k = arr[0];
	                    if (/\d+px|\d+pt/.test(k) && opt.fontSize == undefined) {
	                        var size = parseInt(k);
	                        if (/pt/.test(k)) size = size*4/3;
	                        opt.fontSize = size;
	                    }
	                } else if (arr.length == 3) {
	                    // style|weight size family
	                    var s = arr[0];
	                    if (style[s] || weight[s]) {
	                        if (style[s] && !opt.fontStyle) opt.fontStyle = s;
	                        if (weight[s] && !opt.fontWeight) opt.fontWeight = s;
	                    } else if (/\d+/.test(s) && opt.fontWeight == undefined) {
	                        opt.fontWeight = s;
	                    }
	
	                    if (!opt.fontFamily) opt.fontFamily = arr[2];
	                    var k = arr[1];
	                    if (/\d+px|\d+pt/.test(k) && opt.fontSize == undefined) {
	                        var size = parseInt(k);
	                        if (/pt/.test(k)) size = size*4/3;
	                        opt.fontSize = size;
	                    }
	                } else if (arr.length == 4) {
	                    if (style[arr[0]]) {
	                        if (!opt.fontStyle) opt.fontStyle = arr[0];
	                        if (!opt.fontWeight) opt.fontWeight = arr[1];
	                    } else {
	                        if (!opt.fontStyle) opt.fontStyle = arr[1];
	                        if (!opt.fontWeight) opt.fontWeight = arr[0];
	                    }
	                    if (!opt.fontSize) opt.fontSize = /pt/.test(arr[2]) ? parseInt(arr[2]) * 4/3 : parseInt(arr[2]);
	                    if (!opt.fontFamily) opt.fontFamily = arr[3];
	                }
	            }
	            delete opt.font;
	
	            //line height
	            if (typeof opt.lineHeight == 'string' && /%$/.test(opt.lineHeight)) {
	                opt.lineHeight = (opt.fontSize || this.fontSize) * parseFloat(opt.lineHeight) / 100;
	            }
	
	            return opt;
	        },
	        _prepareTextOffset: function (opt) {
	            if (typeof opt.textOffset == 'string') {
	                var arr = opt.textOffset.split(' ');
	                if (arr.length == 1) {
	                    var k = parseFloat(arr[0]);
	                    arr = [k, k, k, k];
	                } else if (arr.length == 2) {
	                    var l = parseFloat(arr[0]),
	                        t = parseFloat(arr[1]);
	                    arr = [t, l, t, l];
	                } else if (arr.length == 3) {
	                    var t = parseFloat(arr[0]),
	                        r = parseFloat(arr[1]),
	                        b = parseFloat(arr[2]),
	                        l = r;
	                    arr = [t, r, b, l];
	                } else if (arr.length == 4) {
	                    var t = parseFloat(arr[0]),
	                        r = parseFloat(arr[1]),
	                        b = parseFloat(arr[2]),
	                        l = parseFloat(arr[3]);
	                    arr = [t, r, b, l];
	                }
	
	                opt.textOffsetTop = arr[0];
	                opt.textOffsetRight = arr[1];
	                opt.textOffsetBottom = arr[2];
	                opt.textOffsetLeft = arr[3];
	
	                delete opt.textOffset;
	            }
	            return opt;
	        },
	        _render: function (dt) {
	            this.supr(dt);
	            typeof this.text == 'string' && this.text.length > 0 && this._drawText(dt);
	        },
	        _drawText: function (dt) {
	            dt = dt || 0.016;
	            var ctx = this.ctx,
	                textCanvas = this._textCanvas,
	                x = this.textOffsetLeft,
	                y = this.textOffsetTop;
	
	            if (this.verticalAlign == 'middle') {
	                y += (textCanvas.height/2 - textCanvas._textWrapHeight/2);
	            } else if (this.verticalAlign == 'bottom') {
	                y += (textCanvas.height - textCanvas._textWrapHeight);
	            }
	
	            ctx.drawImage(textCanvas, 0, 0, textCanvas.width, textCanvas.height, x, y, textCanvas.width, textCanvas.height);
	        },
	        _updateTextCanvas: function () {
	            if (typeof this.text == 'string' && this.text.length > 0) {
	                var maxWidth = this.width - this.textOffsetLeft - this.textOffsetRight,
	                    maxHeight = this.height - this.textOffsetTop - this.textOffsetBottom,
	                    cvs = this._textCanvas,
	                    ctx = this._textCtx,
	                    text = this.text,
	                    me = this;
	
	                cvs.width = maxWidth;
	                cvs.height = maxHeight; 
	                ctx.font = [this.fontStyle, this.fontWeight, (this.fontSize + 'px'), this.fontFamily].join(' ');
	
	                if (this.textType == 'stroke') {
	                    ctx.strokeStyle = this.textColor;
	                } else if (this.textType == 'fill') {
	                    ctx.fillStyle = this.textColor;
	                }
	
	                var line = '',
	                    x = 0,
	                    y = this.fontSize + Math.max(0, (this.lineHeight-this.fontSize)/2),
	                    lh = this.lineHeight;
	
	                if (this.textAlign == 'left') {
	                    ctx.textAlign = 'left';
	                    x = 0;
	                } else if (this.textAlign == 'center') {
	                    ctx.textAlign = 'center';
	                    x = maxWidth/2;
	                } else if (this.textAlign == 'right') {
	                    ctx.textAlign = 'right';
	                    x = maxWidth;
	                }
	
	                function drawText () {
	                    for (var i = 0, len = text.length; i < len; i ++) {
	                        var testLine = line + text[i],
	                            metrics = ctx.measureText(testLine);
	                        //console.log(testLine, metrics.width)
	                        if (metrics.width > maxWidth && i > 0) {
	                            me.textType == 'stroke' ? ctx.strokeText(line, x, y) : ctx.fillText(line, x, y);
	                            line = text[i] + '';
	                            y += lh;
	                        }
	                        else {
	                            line = testLine;
	                        }
	                    }
	                    me.textType == 'stroke' ? ctx.strokeText(line, x, y) : ctx.fillText(line, x, y);    
	                }
	                 
	                drawText();
	                cvs._textWrapHeight = y + lh;
	                
	            }
	
	        }
	    });
	
	    return TextSprite;
	
	})(KISSY,mods['cec/sprite/rectsprite']);
	mods['cec/sprite/animsprite'] = (function (S, RectSprite) {
		/**
		 * animConfig: {
		 * 		autoPlay: true,
		 * 		loop: true,
		 * 		frameNum:,
		 *		frameRate:,
		 		imgWidth:,
		 		imgHeight:,
		 		arrangeDir:,
		 		//if `imgWidth & imgWidth` in `animConfig`, you can do without `frameData`
	 	 *		frameData: []
		 * }
		 */
	
		var AnimSprite = RectSprite.extend({
			initialize: function (options) {
				this.supr(options);
	
				this.backgroundRepeat = 'no-repeat';
	
				this._autoPlay = this.animConfig.autoPlay == undefined ? true : this.animConfig.autoPlay;
				this._loop = this.animConfig.loop == undefined ? true : this.animConfig.loop;
				this._frameNum = this.animConfig.frameNum;
				this._frameRate = this.animConfig.frameRate || 10;
				this._arrangeDir = this.animConfig.arrangeDir || 'h'; // or 'v'
				this._frames = this._getFrames();
				this._time = 0;
	
				this.playing = false;
				this.currentFrame = 0;
				this.frameWidth = this._frames[0][2];
				this.frameHeight = this._frames[0][3];
				this.animationLength = this._frameNum/this._frameRate;
	
				this._autoPlay && this.play();
			},
	
			_getFrames: function () {
				var frames = [];
				if (Object.prototype.toString.call(this.animConfig.frameData) == '[object Array]' && this.animConfig.frameData.length) {
					frames = this.animConfig.frameData;
				} else if (this.animConfig.imgWidth && this.animConfig.imgHeight) {
					var _x = 0, _y = 0;
					for (var i = 0; i < this._frameNum; i ++) {
						if (this._arrangeDir == 'h') {
							var fw = this.animConfig.imgWidth/this._frameNum,
								fh = this.animConfig.imgHeight;
							var f = [_x, 0, fw, fh];
							_x += fw;
							_x = Math.min((this.animConfig.imgWidth - fw), _x);
							frames.push(f);
						} else if (this._arrangeDir == 'v') {
							var fw = this.animConfig.imgWidth,
								fh = this.animConfig.imgHeight/this._frameNum;
							var f = [0, _y, fw, fh];
							_y += fh;
							_y = Math.min((this.animConfig.imgHeight - fh), _y);
							frames.push(f);
						}
					}
				}
				this._frames = frames;
				return frames;
			},
	
			_drawBackgroundImage: function (dt) {
				// get current frame
				if (this.playing) {
					this._time += dt;
					if (this._time > this.animationLength && this._loop) {
						this._time -= this.animationLength;
					}
					this.currentFrame = Math.min(Math.floor(this._time * this._frameRate), this._frameNum-1);
					this.setFrame(this.currentFrame);
				}
	
				if (this.backgroundImageElement) {
	                var iw = this.backgroundImageElement.width,
	                    ih = this.backgroundImageElement.height,
	                    bgPos = this.backgroundPosition || [0, 0],
	                    frame = this._frames[this.currentFrame];
	                if (typeof bgPos == 'string') bgPos = bgPos.split(' ');
	
	                if (this.shape == 'rect') {
	                	// frame 0
	                    this.ctx.drawImage(this.backgroundImageElement, frame[0], frame[1], frame[2], frame[3], bgPos[0], bgPos[1], this.width, this.height);
	                }
	            }
			},
			play: function () {
				this._time = this.currentFrame/this._frameRate;
				this.playing = true;
				return this;
			},
			stop: function () {
				this.playing = false;
				return this;
			},
			setLoop: function (f) {
				this._loop = !!f;
				return this;
			},
			isLoop: function () {
				return this._loop;
			},
			isPlaying: function () {
				return this.playing;
			},
			setFrame: function (ind) {
				this.currentFrame = Math.min(this._frameNum, Math.max(parseInt(ind), 0));
				this.frameWidth = this._frames[this.currentFrame][2];
				this.frameHeight = this._frames[this.currentFrame][3];
				return this;
			},
			nextFrame: function () {
				var nf = this.currentFrame + 1;
				if (this._loop && nf > this._frameNum - 1) nf = 0;
				return this.setFrame(nf);
			},
			prevFrame: function () {
				var pf = this.currentFrame - 1;
				if (this._loop && pf < 0) pf = this._frameNum - 1;
				return this.setFrame(pf);
			},
			setSpeed: function (sp) {
				var _oldRate = this._frameRate;
				this._frameRate = parseFloat(sp);
				this.animationLength = this._frameNum/this._frameRate;
				this._time *= _oldRate/this._frameRate
				return this;
			},
			getSpeed: function () {
				return this._frameRate;
			},
			getFrameNum: function () {
				return this._frameNum;
			},
			getAnimationLength: function () {
				return this.animationLength;
			}
		});
	
		return AnimSprite;
	
	})(KISSY,mods['cec/sprite/rectsprite']);
	mods['cec/sprite/pathsprite'] = (function (S, Sprite) {
		
		var PathSprite = Sprite.extend({
			initialize: function (options) {
				this.supr(options);
				this.parent = null;
				this.children = [];
			},
	
			_render: function (dt) {
				var p = this.points,
					lineWidth = this.lineWidth || this.borderWidth,
					lineColor = this.lineColor || this.borderColor;
	            
	            this.ctx.rotate(this.angle * Math.PI/180);
	            this.ctx.scale(this.scaleX, this.scaleY);
	
	            this.ctx.beginPath();
	            this.ctx.moveTo(p[0][0], p[0][1]);
	            for (var i = 1, len = p.length; i < len; i ++) {
	                this.ctx.lineTo(p[i][0], p[i][1]);
	            }
	
	            this.ctx.globalAlpha = this.opacity;
	
	            if (lineWidth && lineWidth > 0) {
	                this.ctx.lineWidth = lineWidth;
	                this.ctx.strokeStyle = lineColor;
	                //fix lineWidth=1
	                this.ctx.stroke();
	            }
	
	            this.ctx.closePath();
			},
			setWidth: function (w, autoRender) {
				return this.set({lineWidth: w}, autoRender);
			},
			setColor: function (c, autoRender) {
				return this.set({lineColor: c}, autoRender);
			},
	        setPoint: function (i, p, autoRender) {
	            if (i > 0 && i < this.points.length) {
	                this.points[i] = p;
	            }
	            this._updateBounding();
	            autoRender && this.render();
	            return this;
	        }
		});
	
		return PathSprite;
	
	})(KISSY,mods['cec/sprite/sprite']);
	mods['cec/sprite/segmentsprite'] = (function (S, PathSprite) {
	    
	    var SegmentSprite = PathSprite.extend({
	        initialize: function (options) {
	            if (options.length > 0 && !options.points) {
	                options.points = [[-options.length/2, 0], [options.length/2, 0]];
	            }
	            this.supr(options);
	
	            this.normal = this.getNormal();
	        },
	        getLength: function () {
	            return Math.sqrt(Math.pow(this.points[0][0] - this.points[1][0], 2) + Math.pow(this.points[0][1] - this.points[1][1], 2));
	        },
	        getNormal: function () {
	            var l = this.getLength(),
	                n = [this.points[1][0] - this.points[0][0], this.points[1][1] - this.points[0][1]];
	            this.normal = [n[0]/l, n[1]/l];
	            return this.normal;
	        },
	        setLength: function (l, autoRender) {
	            var sp = this.points[0];
	            this.points = [[sp[0], sp[1]], [sp[0] + l*this.normal[0], sp[1] + l*this.normal[1]]];
	            autoRender && this.render();
	            return this;
	        },
	        setPoint: function (i, p, autoRender) {
	            this.supr(i, p, autoRender);
	            this.getNormal();
	            return this;
	        }
	    });
	
	    return SegmentSprite;
	
	})(KISSY,mods['cec/sprite/pathsprite']);
	mods['cec/sprite/index'] = (function (S, Poly, Rect, Anim, Path, Segment) {
	    
	    var Sprite = Poly;
	    Sprite.Rect = Rect;
	    Sprite.Anim = Anim;
	    Sprite.Path = Path;
	    Sprite.Segment = Segment;
	
	    return Sprite;
	})(KISSY,mods['cec/sprite/sprite'],mods['cec/sprite/textsprite'],mods['cec/sprite/animsprite'],mods['cec/sprite/pathsprite'],mods['cec/sprite/segmentsprite']);
	mods['cec/ticker/index'] = (function (S, Notifier) {
	    
	    var requestAnimFrame =  (function() {
	      return window.requestAnimationFrame ||
	             window.webkitRequestAnimationFrame ||
	             window.mozRequestAnimationFrame ||
	             window.oRequestAnimationFrame ||
	             window.msRequestAnimationFrame ||
	             function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
	               window.setTimeout(callback, 1000/60);
	             };
	    })();
	
	    var Ticker = Notifier.extend({
	        initialize: function () {
	            this._on = true;
	            this._lastStepTime = (+new Date);
	            this._loop();
	            this.dt = 0.016;
	        },
	        _loop: function () {
	            if (!this._on) { return }
	            var me = this;
	            requestAnimFrame(function () {
	                me._loop();
	            });
	
	            var time = (+new Date),
	                dt = (time - me._lastStepTime) / 1000;
	            // get wrong 'dt' back
	            if (dt >= 3) {
	                dt = 1/30;
	            }
	
	            me.fire('tick', dt);
	            me.dt = dt;
	            me._lastStepTime = time;
	        },
	        stop: function () {
	            this._on = false;
	        },
	        resume: function () {
	            this._on = true;
	            this._lastStepTime = (+new Date);
	            this._loop();
	        }
	
	    });
	    Ticker.singleton = new Ticker();
	
	    return Ticker;
	
	})(KISSY,mods['cec/notifier/index']);
	mods['cec/cec'] = (function (S, Loader, Sprite, Ticker) {
	    
	    var CEC = {};
	    CEC.Loader = Loader;
	    CEC.Sprite = Sprite;
	    CEC.Ticker = Ticker;
	
	    return CEC;
	
	})(KISSY,mods['cec/loader/index'],mods['cec/sprite/index'],mods['cec/ticker/index']);
	CEC = mods['cec/cec']; 
	
	})();
	
	exports.Sprite = CEC.Sprite;
	exports.RectSprite = CEC.Sprite.Rect;
	exports.AnimSprite = CEC.Sprite.Anim;
	exports.PathSprite = CEC.Sprite.Path;
	exports.Loader = CEC.Loader;
	CEC.Loader.belongto( CEC.Sprite );;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/adapter/stage/index.js
 */ 
define("scripts/adapter/stage/index.js", function(exports,module){
	/**
	 * stage 原型适配器 for cec
	 */
	
	var CEC = require("scripts/lib/cec");
	var Element = require("scripts/adapter/element/index");
	var device = require("scripts/device");
	var valueZoom = device.isRetina() ? 2 : 1;
	
	var stage = function( conf ){
	  this.canvas = typeof conf.canvas == "string" ? document.getElementById( conf.canvas ) : conf.canvas;
	  this.obj = new CEC.RectSprite( conf.canvas );
	  this.width = this.canvas.width;
	  this.height = this.canvas.height;
	};
	
	stage.prototype.space = function( name ){
	  // TODO: stage.prototype.space
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
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/adapter/element/index.js
 */ 
define("scripts/adapter/element/index.js", function(exports,module){
	/**
	 * element 原型适配器 for cec
	 */
	
	var CEC = require("scripts/lib/cec");
	var device = require("scripts/device");
	var valueZoom = device.isRetina() ? 2 : 1;
	var promise = require("scripts/lib/promise");
	var timeline = require("scripts/timeline").use( "canvas-render" );
	
	var floor = Math.floor;
	
	// TODO: ejecta 环境下不需要用 2 倍的宽高
	
	var element = function( conf ){
	  var obj, c, repeat, p;
	
	  c = {};
	  c.zIndex = conf.zIndex;
	
	  if( conf.type != "path" ){
	    c.width = conf.width * valueZoom;
	    c.height = conf.height * valueZoom;
	    c.x = conf.x * valueZoom;
	    c.y = conf.y * valueZoom;
	    c.opacity = conf.opacity;
	    // c.opacity = .9;
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
	      c.borderWidth = conf.borderWidth * valueZoom;
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
	      p = c.points = conf.points.slice(0);
	      c.lineWidth = conf.strokeWidth * valueZoom;
	      c.lineColor = conf.strokeColor;
	
	      if( valueZoom > 1 )
	        for( var i = 0, l = p.length; i < l; i ++ )
	          p[ i ] = [ p[ i ][ 0 ] * valueZoom, p[ i ][ 1 ] * valueZoom ];
	
	      this.obj = new CEC.PathSprite( c );
	      break;
	  }
	
	  this.animations = {};
	};
	
	element.prototype.extend = function( methods ){
	  for( var i in methods )
	    this[ i ] = methods[ i ];
	};
	
	element.prototype.show = function(){
	  this.obj.visible = true;
	  return this;
	};
	
	element.prototype.hide = function(){
	  var animations = this.animations, i;
	
	  for( i in animations )
	    this.stopFrameAnimation( i );
	
	  this.obj.visible = false;
	
	  return this;
	};
	
	element.prototype.render = function(){
	  this.obj.render();  
	};
	
	element.prototype.x = function( number ){
	  if( typeof number == "number" )
	    this.obj.x = number * valueZoom;
	  else
	    return this.obj.x / valueZoom;
	};
	
	element.prototype.y = function( number ){
	  if( typeof number == "number" )
	    this.obj.y = number * valueZoom;
	  else
	    return this.obj.y / valueZoom;
	};
	
	element.prototype.width = function( number ){
	  if( typeof number == "number" )
	    this.obj.width = number * valueZoom;
	  else
	    return this.obj.width / valueZoom;
	};
	
	element.prototype.height = function( number ){
	  if( typeof number == "number" )
	    this.obj.height = number * valueZoom;
	  else
	    return this.obj.height / valueZoom;
	};
	
	element.prototype.getOrigin = function(){
	  return [ ( this.obj.x + this.obj.width / 2 ) / valueZoom, ( this.obj.y + this.obj.height / 2 ) / valueZoom ];
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
	  // this.obj.setXY( x * valueZoom, y * valueZoom );
	  this.obj.x = x * valueZoom;
	  this.obj.y = y * valueZoom;
	  return this;
	};
	
	element.prototype.remove = function(){
	  var animations = this.animations;
	
	  for( i in animations )
	    if( animations[ i ].running )
	      animations[ i ].reset();
	
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
	
	element.prototype.setPoints = function( points ){
	  // this.obj.setPoint( index, point );
	  var p = this.obj.points;
	
	  for( var i = 0, l = points.length; i < l; i ++ ){
	    p[ i ][ 0 ] = points[ i ][ 0 ] * valueZoom;
	    p[ i ][ 1 ] = points[ i ][ 1 ] * valueZoom;
	  }
	
	  return this;
	};
	
	element.prototype.setStrokeWidth = function( n ){
	  this.obj.lineWidth = n * valueZoom;
	  return this;
	};
	
	element.prototype.setBackgroundPositionX = function( offset ){
	  this.obj.setBackgroundPositionX( floor( offset * valueZoom ) + "" );  
	};
	
	element.prototype.defineFrameAnimation = function( name, config ){
	  // name
	  // config.width || this.obj.width
	  // config.height || this.obj.height
	  // config.x || 0
	  // config.y || 0
	  // config.image
	  // config.imageWidth
	  // config.imageHeight
	  // config.frames
	  // config.duration
	  // config.loop || false
	  // config.framesDir || "h"
	  var el, c, i;
	
	  c = { type: "frames" };
	
	  for( i in config )
	    c[ i ] = config[ i ];
	  
	  if( c.width === undefined )
	    c.width = this.width();
	  
	  if( c.height === undefined )
	    c.height = this.height();
	
	  if( c.x === undefined )
	    c.x = 0;
	
	  if( c.y === undefined )
	    c.y = 0;
	
	  el = this.animations[ name ] = new element( c );
	  el.obj.visible = false;
	  this.obj.add( el.obj );
	
	  el.extend( {
	    frames: config.frames,
	    duration: config.duration,
	    frameTime: config.duration / config.frames,
	    currentFrame: 0,
	    loop: !!config.loop,
	    running: false
	  } );
	};
	
	element.prototype.playFrameAnimation = function( name, callback ){
	  var pm, el, frames, frameTime, index;
	
	  pm = new promise;
	  el = this.animations[ name ];
	  el.running = true;
	
	  el.timer = timeline.createTask( {
	    start: 0, duration: el.loop ? -1 : el.duration, object: el,
	    onTimeStart: function(){
	      this.show();
	    },
	    onTimeUpdate: el.loop ? function( time ){
	      index = parseInt( time / this.frameTime ) % this.frames;
	
	      if( index != this.currentFrame ){
	        this.setFrame( index );
	        this.currentFrame = index;
	        callback && callback( index );
	      }
	    } : function( time ){
	      index = parseInt( time / this.frameTime );
	
	      if( index > this.currentFrame && index < this.frames ){
	        this.setFrame( this.currentFrame = index );
	        callback && callback( index );
	      }
	    },
	    onTimeEnd: function(){
	      el.running = false;
	      pm.resolve( el );
	    }
	  } );
	
	  return pm;
	};
	
	element.prototype.stopFrameAnimation = function( name ){
	  var el;
	
	  if( ( el = this.animations[ name ] ) ){
	    if( el.running ){
	      el.timer.stop();
	      el.running = false;
	      delete el.timer;
	    }
	
	    el.setFrame( 0 );
	    el.currentFrame = 0;
	    el.hide();
	  }
	};
	
	exports.create = function( conf ){
	  return new element( conf );
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/device.js
 */ 
define("scripts/device.js", function(exports,module){
	/**
	 * fullscreen
	 */
	
	var Interaction = require("scripts/interaction");
	var message = require("scripts/message");
	
	var EjectaRegx = /ejecta/i;
	var iPhoneRegx = /iphone/i;
	var iPadRegx = /ipad/i;
	var iPodRegx = /ipod/i;
	var AndroidRegx = /android/i;
	var MacintoshRegx = /macintosh/i;
	var WindowsRegx = /windows/i;
	
	var screenWidth = screen.width, screenHeight = screen.height;
	
	if( screenWidth < screenHeight )
	  screenWidth = [ screenHeight, screenHeight = screenWidth ][ 0 ];
	
	exports.getDeviceName = function(){
	  var ua;
	
	  if( typeof navigator == "object" ){
	    ua = navigator.userAgent;
	
	    if( EjectaRegx.test( ua ) ){
	      return "Ejecta";
	
	    }else if( iPhoneRegx.test( ua ) ){
	      return "iPhone";
	    }else if( iPadRegx.test( ua ) ){
	      return "iPad";
	    }else if( iPodRegx.test( ua ) ){
	      return "iPod";
	
	    }else if( AndroidRegx.test( ua ) ){
	      return "Android";
	
	    }else if( MacintoshRegx.test( ua ) ){
	      return "Macintosh";
	    }else if( WindowsRegx.test( ua ) ){
	      return "Windows";
	    }
	  }else{
	    return "unknow";
	  }
	};
	
	// 以横屏分准的屏幕宽高，宽总是大于高
	exports.getScreenSize = function(){
	  return {
	    width: screenWidth,
	    height: screenHeight
	  }  
	};
	
	exports.getDeviceDir = function(){
	  return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
	};
	
	exports.isRetina = function(){
	  return false;
	  // return window.devicePixelRatio > 1;  
	};
	
	exports.getExtraBarHeight = function(){
	  return this.getScreenSize().width - Math.max( window.innerHeight, window.innerWidth );
	};
	
	exports.supportStandAlone = function(){
	  return "standalone" in window.navigator;
	};
	
	exports.isStandAlone = function(){
	  return window.navigator.standalone;
	};
	
	exports.hookOrientationChange = function(){
	  var listeners = [];
	
	  Ucren.addEvent(window, "orientationchange", function(){
	    for( var i = 0, l = listeners.length; i < l; i ++ )
	      listeners[ i ]();
	  } );
	
	  return function( fn ){
	    var listener;
	
	    listener = function(){
	      fn( this.getDeviceDir() );
	    }.bind( this );
	    
	    listeners.push( listener );
	
	    listener();
	  }
	}();
	
	// only for web
	exports.lockLandscape = function( el, rotateClassName ){
	  var elWidth, elHeight, defaultEventFormater, rotateEventFormater, isRotated, diffSize, deviceName;
	
	  el = el || document.body;
	  elWidth = el.clientWidth;
	  elHeight = el.clientHeight;
	  deviceName = this.getDeviceName();
	
	  defaultEventFormater = Interaction.getEventFormater();
	  rotateEventFormater = function( event ){
	    return { clientX: event.clientY, clientY: screenHeight - event.clientX };
	  };
	
	  diffSize = Math.abs( elWidth - elHeight );
	
	  var doRotate = function(){
	    el.style.webkitTransformOrigin = ( screenHeight / 2 ) + "px " + ( screenHeight / 2 ) + "px";
	    el.style.webkitTransform = "rotate(90deg)";
	    Interaction.setEventFormater( rotateEventFormater );
	    isRotated = true;
	  };
	
	  var restore = function(){
	    el.style.webkitTransformOrigin = "";
	    el.style.webkitTransform = "none";
	    Interaction.setEventFormater( defaultEventFormater );
	    isRotated = false;
	  };
	
	  this.hookOrientationChange( function( name ){
	    if( name == "landscape" && isRotated )
	      restore();
	    else if( name == "portrait" && !isRotated )
	      doRotate();
	  } );
	};
	
	exports.lockPortrait = function(){
	  // TODO: lockPortrait
	};
;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/interaction.js
 */ 
define("scripts/interaction.js", function(exports,module){
	/**
	 * 交互控制器
	 */
	
	var message = require("scripts/message");
    var Ucren = require('scripts/lib/ucren');
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
	
	  Ucren.addEvent(el, touchStart, function( event ){
	    if( isTouch )
	      event = event.touches[ 0 ] || event;
	    event = eventFormater( event );
	    inSweeping = true;
	    pointX = event.clientX;
	    pointY = event.clientY;
	    message.postMessage( "touch-start", pointX, pointY );
	    message.postMessage( "touch-spot", pointX, pointY );
	  }, false );
	
	  Ucren.addEvent(el, touchMove, function( event ){
	    var x, y;
	    
	    if( !inSweeping )
	      return ;
	
	    if( isTouch )
	      event = event.touches[ 0 ] || event;
	
	    event = eventFormater( event );
	
	    x = event.clientX;
	    y = event.clientY;
	
	    if( distance( x, y, pointX, pointY ) > 0 ){
	      pointX = x;
	      pointY = y;
	      message.postMessage( "touch-spot", x, y );
	    }
	
	  }, false );
	
	  Ucren.addEvent(el, touchEnd, function( event ){
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
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/message.js
 */ 
define("scripts/message.js", function(exports,module){
	/**
	 * a simple message manager
	 * @author dron
	 * @date 2012-06-27
	 */
	
	var Ucren = require("scripts/lib/ucren"), array = [];
	
	/**
	 * send a message
	 * @param  {String} to                message address
	 * @param  {Any} message,message...   message contents
	 */
	exports.postMessage = function( to, message/*, message, message... */ ){
	  Ucren.dispatch( to, array.slice.call( arguments, 1 ) );
	};
	
	/**
	 * bind an message handler
	 * @param {String}   from   message address
	 * @param {Function} fn     message handler
	 */
	exports.addEventListener = function( from, fn ){
	  Ucren.dispatch( from, fn );
	};
	
	/**
	 * remove an message handler
	 * @param {String}   from   message address
	 * @param {Function} fn     message handler
	 */
	exports.removeEventListener = function( from, fn ){
	  Ucren.dispatch.remove( from, fn );
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/lib/promise.js
 */ 
define("scripts/lib/promise.js", function(exports,module){
	/**
	 * promise
	 */
	
	var promise = exports = function(){
	    var concat = [].concat;
	
	    var promise = function(){
	        var list;
	        
	        list = this.list = arguments.length ? 
	            concat.apply( [], arguments[ 0 ] ) : null;
	        this.resolves = [];
	        this.rejects = [];
	        this.resolveValues = [];
	        this.rejectValues = [];
	        this.parents = [];
	        this.state = "pending";
	        this.fired = false;
	
	        if( list )
	            for( var i = 0, l = list.length; i < l; i ++ )
	                list[ i ].parents.push( this );
	    };
	
	    promise.prototype = {
	        resolve: function( arg ){
	            if( this.state == "pending" )
	                this.state = "resolved",
	                this.resolveValues = concat.apply( [], arguments )
	                this.fire();
	        },
	
	        reject: function( arg ){
	            if( this.state == "pending" )
	                this.state = "rejected",
	                this.rejectValues = concat.apply( [], arguments )
	                this.fire();
	        },
	
	        then: function( resolved, rejected ){
	            if( resolved )
	                this.resolves.push( resolved );
	            
	            if( rejected )
	                this.rejects.push( rejected );
	
	            if( this.fired )
	                switch( this.state ){
	                    case "resolved":
	                        resolved && 
	                            resolved.apply( null, this.resolveValues );
	                        break;
	                    case "rejected":
	                        rejected &&
	                            rejected.apply( null, this.rejectValues );
	                }
	            else
	                this.fire();
	
	            return this;
	        },
	
	        fire: function(){
	            var callbacks, values, list = this.list, allResolved = true,
	                allResolveValues, parents;
	
	            if( this.fired )
	                return ;
	
	            if( list && this.state == "pending" ){
	                allResolveValues = [];
	
	                for( var i = 0, l = list.length; i < l; i ++ ){
	                    switch( list[ i ].state ){
	                        case "pending":
	                            allResolved = false;
	                            break;
	                        case "resolved":
	                            allResolveValues[ i ] = 
	                                list[ i ].resolveValues[ 0 ];
	                            break;
	                        case "rejected":
	                            return this.reject( list[ i ].rejectValues[ 0 ] );
	                    }
	                }
	                if( allResolved )
	                    return this.resolve( allResolveValues );
	            }
	
	            if( this.state == "pending" )
	                return ;
	
	            if( this.state == "resolved" )
	                callbacks = this.resolves,
	                values = this.resolveValues;
	            else if( this.state == "rejected" )
	                callbacks = this.rejects,
	                values = this.rejectValues;
	
	            for( var i = 0, l = callbacks.length; i < l; i ++ )
	                callbacks[ i ].apply( null, values );
	
	            this.fired = true;
	
	            parents = this.parents;
	            for( var i = 0, l = parents.length; i < l; i ++ )
	                parents[ i ].fire();
	        }
	    };
	
	    promise.when = function(){
	        return new promise( arguments );
	    };
	
	    promise.fuze = function(){
	        var queue = [], fn, infire;
	
	        fn = function( process ){
	            infire ? process() : queue.push( process );
	        };
	
	        fn.fire = function(){
	            while( queue.length )
	                queue.shift()();
	            infire = true;
	        };
	
	        return fn;
	    };
	
	    return promise;
	}();;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/game/main.js
 */ 
define("scripts/game/main.js", function(exports,module){
	/**
	 * 游戏业务
	 */
	
	var state = require("scripts/state");
	var timeline = require("scripts/timeline").use( "canvas-render" );
	var message = require("scripts/message");
	var Sound = require("scripts/game/sound");
	
	// components
	var background = require("scripts/components/background");
	var crawler = require("scripts/components/crawler");
	var wheels = require("scripts/components/wheels");
	var foreground = require("scripts/components/foreground");
	var knife = require("scripts/components/knife");
	var boxes = require("scripts/components/boxes");
	var canvas, floor = Math.floor;
	
	var Speed = function(){
	  return {
	    value: 240,
	
	    set: function( value ){
	      this.value = value || 0;
	    }
	  }
	}();
	
	// TODO: 重构场景管理器 sence-manager
	var MainSence = function(){
	  var movingTimer;
	
	  return {
	    init: function(){
	      var image1, image2;
	
	      background.render();
	      crawler.render( { y: background.topHeight + ( canvas.height - background.topHeight - background.bottomHeight - ( crawler.height + wheels.height ) ) / 2 } );
	      wheels.render( { y: crawler.height + crawler.y } );
	      foreground.render();
	
	      boxes.init();
	      knife.init();
	
	      // Sound.play( "background" );
	      message.addEventListener( "cut-in-boom", function(){
	        Speed.set( 0 );
	      } );
	    },
	
	    start: function(){
	      var x, lastTime = 0, frame = 0, f;
	
	      boxes.createOne( 0 );
	
	      movingTimer = timeline.createTask( {
	        start: 0, duration: -1, object: this,
	        onTimeUpdate: function( time ){
	          x = - ( Speed.value * ( time - lastTime ) / 1000 );
	          boxes.moveLeft( x );
	          crawler.moveLeft( x );
	          lastTime = time;
	          // boxes.shake2( time );
	        }
	      } );
	    }
	  };
	}();
	
	exports.init = function(){
	  canvas = state( "canvas" ).get();
	  MainSence.init();
	  MainSence.start();
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/game/sound.js
 */ 
define("scripts/game/sound.js", function(exports,module){
	/**
	 * 声音管理
	 */
	
	var sound = require("scripts/adapter/sound/index");
	
	exports = function(){
	  // TODO: 声音
	
	  var mapping = {
	    // "background": sound.create( "sounds/background", { loop: true } ),
	    "cut": sound.create( "sounds/cut" ),
	    "boom": sound.create( "sounds/boom" )
	  };
	
	  mapping[ "boom" ].preload();
	
	  return {
	    play: function( name ){
	      mapping[ name ].play();
	    }
	  };
	}();;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/adapter/sound/index.js
 */ 
define("scripts/adapter/sound/index.js", function(exports,module){
	/**
	 * a simple sound controller
	 */
	
	/**
	 * usage:
	 * var snd = sound.create("sounds/myfile");
	 * snd.play();
	 */
	
	var buzz = require("scripts/lib/buzz");
	var supported = typeof ejecta == "undefined" ? buzz.isSupported() : false;
	
	var config = { 
	  formats: [ "mp3" ], 
	  preload: true, 
	  autoload: true,
	  loop: false 
	};
	
	function ClassBuzz( src, conf ){
	  var c = {}, name;
	
	  for( name in config )
	    c[ name ] = config[ name ];
	
	  for( name in conf )
	    c[ name ] = conf[ name ];
	
	  this.sound = new buzz.sound( src, c );
	}
	
	ClassBuzz.prototype.play = function( s ){
	  s = this.sound;
	  s.unmute();
	  s.setPercent( 0 );
	  s.setVolume( 100 );
	  s.play();
	};
	
	ClassBuzz.prototype.stop = function(){
	  this.sound.fadeOut( 1e3, function(){
	      this.pause();
	  } );
	};
	
	ClassBuzz.prototype.preload = function( s ){
	  s = this.sound;
	  s.mute();
	  s.play();
	};
	
	exports.create = function( src, conf ){
	  if( !supported )
	      return unSupported;
	  else
	      return new ClassBuzz( src, conf );
	};
	
	function unSupported(){
	  // TODO: 
	};
	
	unSupported.preload =
	unSupported.play =
	unSupported.stop = function(){
	  // TODO: 
	  console.log( "un support sound" );
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/lib/buzz.js
 */ 
define("scripts/lib/buzz.js", function(exports,module){
	 // ----------------------------------------------------------------------------
	 // Buzz, a Javascript HTML5 Audio library
	 // v1.1.0 - released 2013-08-15 13:18
	 // Licensed under the MIT license.
	 // http://buzz.jaysalvat.com/
	 // ----------------------------------------------------------------------------
	 // Copyright (C) 2010-2013 Jay Salvat
	 // http://jaysalvat.com/
	 // ----------------------------------------------------------------------------
	
	(function(name, context, factory) {
	    exports = factory();
	})("buzz", this, function() {
	    var buzz = {
	        defaults: {
	            autoplay: false,
	            duration: 5e3,
	            formats: [],
	            loop: false,
	            placeholder: "--",
	            preload: "metadata",
	            volume: 80,
	            document: document
	        },
	        types: {
	            mp3: "audio/mpeg",
	            ogg: "audio/ogg",
	            wav: "audio/wav",
	            aac: "audio/aac",
	            m4a: "audio/x-m4a"
	        },
	        sounds: [],
	        el: document.createElement("audio"),
	        sound: function(src, options) {
	            options = options || {};
	            var doc = options.document || buzz.defaults.document;
	            var pid = 0, events = [], eventsOnce = {}, supported = buzz.isSupported();
	            this.load = function() {
	                if (!supported) {
	                    return this;
	                }
	                this.sound.load();
	                return this;
	            };
	            this.play = function() {
	                if (!supported) {
	                    return this;
	                }
	                this.sound.play();
	                return this;
	            };
	            this.togglePlay = function() {
	                if (!supported) {
	                    return this;
	                }
	                if (this.sound.paused) {
	                    this.sound.play();
	                } else {
	                    this.sound.pause();
	                }
	                return this;
	            };
	            this.pause = function() {
	                if (!supported) {
	                    return this;
	                }
	                this.sound.pause();
	                return this;
	            };
	            this.isPaused = function() {
	                if (!supported) {
	                    return null;
	                }
	                return this.sound.paused;
	            };
	            this.stop = function() {
	                if (!supported) {
	                    return this;
	                }
	                this.setTime(0);
	                this.sound.pause();
	                return this;
	            };
	            this.isEnded = function() {
	                if (!supported) {
	                    return null;
	                }
	                return this.sound.ended;
	            };
	            this.loop = function() {
	                if (!supported) {
	                    return this;
	                }
	                this.sound.loop = "loop";
	                this.bind("ended.buzzloop", function() {
	                    this.currentTime = 0;
	                    this.play();
	                });
	                return this;
	            };
	            this.unloop = function() {
	                if (!supported) {
	                    return this;
	                }
	                this.sound.removeAttribute("loop");
	                this.unbind("ended.buzzloop");
	                return this;
	            };
	            this.mute = function() {
	                if (!supported) {
	                    return this;
	                }
	                this.sound.muted = true;
	                return this;
	            };
	            this.unmute = function() {
	                if (!supported) {
	                    return this;
	                }
	                this.sound.muted = false;
	                return this;
	            };
	            this.toggleMute = function() {
	                if (!supported) {
	                    return this;
	                }
	                this.sound.muted = !this.sound.muted;
	                return this;
	            };
	            this.isMuted = function() {
	                if (!supported) {
	                    return null;
	                }
	                return this.sound.muted;
	            };
	            this.setVolume = function(volume) {
	                if (!supported) {
	                    return this;
	                }
	                if (volume < 0) {
	                    volume = 0;
	                }
	                if (volume > 100) {
	                    volume = 100;
	                }
	                this.volume = volume;
	                this.sound.volume = volume / 100;
	                return this;
	            };
	            this.getVolume = function() {
	                if (!supported) {
	                    return this;
	                }
	                return this.volume;
	            };
	            this.increaseVolume = function(value) {
	                return this.setVolume(this.volume + (value || 1));
	            };
	            this.decreaseVolume = function(value) {
	                return this.setVolume(this.volume - (value || 1));
	            };
	            this.setTime = function(time) {
	                if (!supported) {
	                    return this;
	                }
	                var set = true;
	                this.whenReady(function() {
	                    if (set === true) {
	                        set = false;
	                        this.sound.currentTime = time;
	                    }
	                });
	                return this;
	            };
	            this.getTime = function() {
	                if (!supported) {
	                    return null;
	                }
	                var time = Math.round(this.sound.currentTime * 100) / 100;
	                return isNaN(time) ? buzz.defaults.placeholder : time;
	            };
	            this.setPercent = function(percent) {
	                if (!supported) {
	                    return this;
	                }
	                return this.setTime(buzz.fromPercent(percent, this.sound.duration));
	            };
	            this.getPercent = function() {
	                if (!supported) {
	                    return null;
	                }
	                var percent = Math.round(buzz.toPercent(this.sound.currentTime, this.sound.duration));
	                return isNaN(percent) ? buzz.defaults.placeholder : percent;
	            };
	            this.setSpeed = function(duration) {
	                if (!supported) {
	                    return this;
	                }
	                this.sound.playbackRate = duration;
	                return this;
	            };
	            this.getSpeed = function() {
	                if (!supported) {
	                    return null;
	                }
	                return this.sound.playbackRate;
	            };
	            this.getDuration = function() {
	                if (!supported) {
	                    return null;
	                }
	                var duration = Math.round(this.sound.duration * 100) / 100;
	                return isNaN(duration) ? buzz.defaults.placeholder : duration;
	            };
	            this.getPlayed = function() {
	                if (!supported) {
	                    return null;
	                }
	                return timerangeToArray(this.sound.played);
	            };
	            this.getBuffered = function() {
	                if (!supported) {
	                    return null;
	                }
	                return timerangeToArray(this.sound.buffered);
	            };
	            this.getSeekable = function() {
	                if (!supported) {
	                    return null;
	                }
	                return timerangeToArray(this.sound.seekable);
	            };
	            this.getErrorCode = function() {
	                if (supported && this.sound.error) {
	                    return this.sound.error.code;
	                }
	                return 0;
	            };
	            this.getErrorMessage = function() {
	                if (!supported) {
	                    return null;
	                }
	                switch (this.getErrorCode()) {
	                  case 1:
	                    return "MEDIA_ERR_ABORTED";
	
	                  case 2:
	                    return "MEDIA_ERR_NETWORK";
	
	                  case 3:
	                    return "MEDIA_ERR_DECODE";
	
	                  case 4:
	                    return "MEDIA_ERR_SRC_NOT_SUPPORTED";
	
	                  default:
	                    return null;
	                }
	            };
	            this.getStateCode = function() {
	                if (!supported) {
	                    return null;
	                }
	                return this.sound.readyState;
	            };
	            this.getStateMessage = function() {
	                if (!supported) {
	                    return null;
	                }
	                switch (this.getStateCode()) {
	                  case 0:
	                    return "HAVE_NOTHING";
	
	                  case 1:
	                    return "HAVE_METADATA";
	
	                  case 2:
	                    return "HAVE_CURRENT_DATA";
	
	                  case 3:
	                    return "HAVE_FUTURE_DATA";
	
	                  case 4:
	                    return "HAVE_ENOUGH_DATA";
	
	                  default:
	                    return null;
	                }
	            };
	            this.getNetworkStateCode = function() {
	                if (!supported) {
	                    return null;
	                }
	                return this.sound.networkState;
	            };
	            this.getNetworkStateMessage = function() {
	                if (!supported) {
	                    return null;
	                }
	                switch (this.getNetworkStateCode()) {
	                  case 0:
	                    return "NETWORK_EMPTY";
	
	                  case 1:
	                    return "NETWORK_IDLE";
	
	                  case 2:
	                    return "NETWORK_LOADING";
	
	                  case 3:
	                    return "NETWORK_NO_SOURCE";
	
	                  default:
	                    return null;
	                }
	            };
	            this.set = function(key, value) {
	                if (!supported) {
	                    return this;
	                }
	                this.sound[key] = value;
	                return this;
	            };
	            this.get = function(key) {
	                if (!supported) {
	                    return null;
	                }
	                return key ? this.sound[key] : this.sound;
	            };
	            this.bind = function(types, func) {
	                if (!supported) {
	                    return this;
	                }
	                types = types.split(" ");
	                var self = this, efunc = function(e) {
	                    func.call(self, e);
	                };
	                for (var t = 0; t < types.length; t++) {
	                    var type = types[t], idx = type;
	                    type = idx.split(".")[0];
	                    events.push({
	                        idx: idx,
	                        func: efunc
	                    });
	                    this.sound.addEventListener(type, efunc, true);
	                }
	                return this;
	            };
	            this.unbind = function(types) {
	                if (!supported) {
	                    return this;
	                }
	                types = types.split(" ");
	                for (var t = 0; t < types.length; t++) {
	                    var idx = types[t], type = idx.split(".")[0];
	                    for (var i = 0; i < events.length; i++) {
	                        var namespace = events[i].idx.split(".");
	                        if (events[i].idx == idx || namespace[1] && namespace[1] == idx.replace(".", "")) {
	                            this.sound.removeEventListener(type, events[i].func, true);
	                            events.splice(i, 1);
	                        }
	                    }
	                }
	                return this;
	            };
	            this.bindOnce = function(type, func) {
	                if (!supported) {
	                    return this;
	                }
	                var self = this;
	                eventsOnce[pid++] = false;
	                this.bind(type + "." + pid, function() {
	                    if (!eventsOnce[pid]) {
	                        eventsOnce[pid] = true;
	                        func.call(self);
	                    }
	                    self.unbind(type + "." + pid);
	                });
	                return this;
	            };
	            this.trigger = function(types) {
	                if (!supported) {
	                    return this;
	                }
	                types = types.split(" ");
	                for (var t = 0; t < types.length; t++) {
	                    var idx = types[t];
	                    for (var i = 0; i < events.length; i++) {
	                        var eventType = events[i].idx.split(".");
	                        if (events[i].idx == idx || eventType[0] && eventType[0] == idx.replace(".", "")) {
	                            var evt = doc.createEvent("HTMLEvents");
	                            evt.initEvent(eventType[0], false, true);
	                            this.sound.dispatchEvent(evt);
	                        }
	                    }
	                }
	                return this;
	            };
	            this.fadeTo = function(to, duration, callback) {
	                if (!supported) {
	                    return this;
	                }
	                if (duration instanceof Function) {
	                    callback = duration;
	                    duration = buzz.defaults.duration;
	                } else {
	                    duration = duration || buzz.defaults.duration;
	                }
	                var from = this.volume, delay = duration / Math.abs(from - to), self = this;
	                this.play();
	                function doFade() {
	                    setTimeout(function() {
	                        if (from < to && self.volume < to) {
	                            self.setVolume(self.volume += 1);
	                            doFade();
	                        } else if (from > to && self.volume > to) {
	                            self.setVolume(self.volume -= 1);
	                            doFade();
	                        } else if (callback instanceof Function) {
	                            callback.apply(self);
	                        }
	                    }, delay);
	                }
	                this.whenReady(function() {
	                    doFade();
	                });
	                return this;
	            };
	            this.fadeIn = function(duration, callback) {
	                if (!supported) {
	                    return this;
	                }
	                return this.setVolume(0).fadeTo(100, duration, callback);
	            };
	            this.fadeOut = function(duration, callback) {
	                if (!supported) {
	                    return this;
	                }
	                return this.fadeTo(0, duration, callback);
	            };
	            this.fadeWith = function(sound, duration) {
	                if (!supported) {
	                    return this;
	                }
	                this.fadeOut(duration, function() {
	                    this.stop();
	                });
	                sound.play().fadeIn(duration);
	                return this;
	            };
	            this.whenReady = function(func) {
	                if (!supported) {
	                    return null;
	                }
	                var self = this;
	                if (this.sound.readyState === 0) {
	                    this.bind("canplay.buzzwhenready", function() {
	                        func.call(self);
	                    });
	                } else {
	                    func.call(self);
	                }
	            };
	            function timerangeToArray(timeRange) {
	                var array = [], length = timeRange.length - 1;
	                for (var i = 0; i <= length; i++) {
	                    array.push({
	                        start: timeRange.start(i),
	                        end: timeRange.end(i)
	                    });
	                }
	                return array;
	            }
	            function getExt(filename) {
	                return filename.split(".").pop();
	            }
	            function addSource(sound, src) {
	                var source = doc.createElement("source");
	                source.src = src;
	                if (buzz.types[getExt(src)]) {
	                    source.type = buzz.types[getExt(src)];
	                }
	                sound.appendChild(source);
	            }
	            if (supported && src) {
	                for (var i in buzz.defaults) {
	                    if (buzz.defaults.hasOwnProperty(i)) {
	                        options[i] = options[i] || buzz.defaults[i];
	                    }
	                }
	                this.sound = doc.createElement("audio");
	                if (src instanceof Array) {
	                    for (var j in src) {
	                        if (src.hasOwnProperty(j)) {
	                            addSource(this.sound, src[j]);
	                        }
	                    }
	                } else if (options.formats.length) {
	                    for (var k in options.formats) {
	                        if (options.formats.hasOwnProperty(k)) {
	                            addSource(this.sound, src + "." + options.formats[k]);
	                        }
	                    }
	                } else {
	                    addSource(this.sound, src);
	                }
	                if (options.loop) {
	                    this.loop();
	                }
	                if (options.autoplay) {
	                    this.sound.autoplay = "autoplay";
	                }
	                if (options.preload === true) {
	                    this.sound.preload = "auto";
	                } else if (options.preload === false) {
	                    this.sound.preload = "none";
	                } else {
	                    this.sound.preload = options.preload;
	                }
	                this.setVolume(options.volume);
	                buzz.sounds.push(this);
	            }
	        },
	        group: function(sounds) {
	            sounds = argsToArray(sounds, arguments);
	            this.getSounds = function() {
	                return sounds;
	            };
	            this.add = function(soundArray) {
	                soundArray = argsToArray(soundArray, arguments);
	                for (var a = 0; a < soundArray.length; a++) {
	                    sounds.push(soundArray[a]);
	                }
	            };
	            this.remove = function(soundArray) {
	                soundArray = argsToArray(soundArray, arguments);
	                for (var a = 0; a < soundArray.length; a++) {
	                    for (var i = 0; i < sounds.length; i++) {
	                        if (sounds[i] == soundArray[a]) {
	                            sounds.splice(i, 1);
	                            break;
	                        }
	                    }
	                }
	            };
	            this.load = function() {
	                fn("load");
	                return this;
	            };
	            this.play = function() {
	                fn("play");
	                return this;
	            };
	            this.togglePlay = function() {
	                fn("togglePlay");
	                return this;
	            };
	            this.pause = function(time) {
	                fn("pause", time);
	                return this;
	            };
	            this.stop = function() {
	                fn("stop");
	                return this;
	            };
	            this.mute = function() {
	                fn("mute");
	                return this;
	            };
	            this.unmute = function() {
	                fn("unmute");
	                return this;
	            };
	            this.toggleMute = function() {
	                fn("toggleMute");
	                return this;
	            };
	            this.setVolume = function(volume) {
	                fn("setVolume", volume);
	                return this;
	            };
	            this.increaseVolume = function(value) {
	                fn("increaseVolume", value);
	                return this;
	            };
	            this.decreaseVolume = function(value) {
	                fn("decreaseVolume", value);
	                return this;
	            };
	            this.loop = function() {
	                fn("loop");
	                return this;
	            };
	            this.unloop = function() {
	                fn("unloop");
	                return this;
	            };
	            this.setTime = function(time) {
	                fn("setTime", time);
	                return this;
	            };
	            this.set = function(key, value) {
	                fn("set", key, value);
	                return this;
	            };
	            this.bind = function(type, func) {
	                fn("bind", type, func);
	                return this;
	            };
	            this.unbind = function(type) {
	                fn("unbind", type);
	                return this;
	            };
	            this.bindOnce = function(type, func) {
	                fn("bindOnce", type, func);
	                return this;
	            };
	            this.trigger = function(type) {
	                fn("trigger", type);
	                return this;
	            };
	            this.fade = function(from, to, duration, callback) {
	                fn("fade", from, to, duration, callback);
	                return this;
	            };
	            this.fadeIn = function(duration, callback) {
	                fn("fadeIn", duration, callback);
	                return this;
	            };
	            this.fadeOut = function(duration, callback) {
	                fn("fadeOut", duration, callback);
	                return this;
	            };
	            function fn() {
	                var args = argsToArray(null, arguments), func = args.shift();
	                for (var i = 0; i < sounds.length; i++) {
	                    sounds[i][func].apply(sounds[i], args);
	                }
	            }
	            function argsToArray(array, args) {
	                return array instanceof Array ? array : Array.prototype.slice.call(args);
	            }
	        },
	        all: function() {
	            return new buzz.group(buzz.sounds);
	        },
	        isSupported: function() {
	            return !!buzz.el.canPlayType;
	        },
	        isOGGSupported: function() {
	            return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/ogg; codecs="vorbis"');
	        },
	        isWAVSupported: function() {
	            return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/wav; codecs="1"');
	        },
	        isMP3Supported: function() {
	            return !!buzz.el.canPlayType && buzz.el.canPlayType("audio/mpeg;");
	        },
	        isAACSupported: function() {
	            return !!buzz.el.canPlayType && (buzz.el.canPlayType("audio/x-m4a;") || buzz.el.canPlayType("audio/aac;"));
	        },
	        toTimer: function(time, withHours) {
	            var h, m, s;
	            h = Math.floor(time / 3600);
	            h = isNaN(h) ? "--" : h >= 10 ? h : "0" + h;
	            m = withHours ? Math.floor(time / 60 % 60) : Math.floor(time / 60);
	            m = isNaN(m) ? "--" : m >= 10 ? m : "0" + m;
	            s = Math.floor(time % 60);
	            s = isNaN(s) ? "--" : s >= 10 ? s : "0" + s;
	            return withHours ? h + ":" + m + ":" + s : m + ":" + s;
	        },
	        fromTimer: function(time) {
	            var splits = time.toString().split(":");
	            if (splits && splits.length == 3) {
	                time = parseInt(splits[0], 10) * 3600 + parseInt(splits[1], 10) * 60 + parseInt(splits[2], 10);
	            }
	            if (splits && splits.length == 2) {
	                time = parseInt(splits[0], 10) * 60 + parseInt(splits[1], 10);
	            }
	            return time;
	        },
	        toPercent: function(value, total, decimal) {
	            var r = Math.pow(10, decimal || 0);
	            return Math.round(value * 100 / total * r) / r;
	        },
	        fromPercent: function(percent, total, decimal) {
	            var r = Math.pow(10, decimal || 0);
	            return Math.round(total / 100 * percent * r) / r;
	        }
	    };
	    return buzz;
	});;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/components/background.js
 */ 
define("scripts/components/background.js", function(exports,module){
	/**
	 * background
	 */
	
	var Component = require("scripts/component");
	
	var topHeight = 61;
	var bottomHeight = 61;
	
	exports = Component.create().extend( {
	  topHeight: topHeight,
	  bottomHeight: bottomHeight,
	
	  render: function(){
	    if( this.rendered )
	      return ;
	
	    this.add( {
	      type: "image",
	      x: 0,
	      y: 0,
	      width: this.availWidth,
	      height: topHeight,
	      image: "images/background-top.png"
	    } );
	
	    this.add( {
	      type: "image",
	      x: 0,
	      y: this.availHeight - this.bottomHeight,
	      width: this.availWidth,
	      height: bottomHeight,
	      image: "images/background-bottom.png"
	    } );
	
	    this.rendered = true;
	  }
	} );;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/component.js
 */ 
define("scripts/component.js", function(exports,module){
	/**
	 * component
	 */
	var timeline = require("scripts/timeline").use( "canvas-render" );
	var Element = require("scripts/adapter/element/index");
	
	var stage;
	
	var component = function(){
	  this.children = []; // child elements.
	  this.animations = [];
	  this.caches = {};
	  // this.parent = null;
	};
	
	component.prototype.extend = function( methods ){
	  for( var name in methods )
	    this[ name ] = methods[ name ];
	
	  return this;
	};
	
	component.prototype.add = function( unknow ){
	  // if( unknow instanceof component ){
	  //   this.children.push( unknow );
	  //   unknow.parent = this;
	  //   return unknow;
	  // }else{
	    unknow = Element.create( unknow );
	    this.children.push( unknow );
	
	    if( stage )
	      stage.add( unknow );
	  // }
	
	  return unknow;
	};
	
	component.prototype.remove = function( unknow ){
	  var children = this.children;
	
	  // if( unknow instanceof component ){
	  //   unknow.parent = null;
	  //   unknow.removeChildren();
	  // }else{
	    unknow.remove();
	  // }
	  
	  for( var i = children.length - 1; i >= 0; i -- )
	    if( children[ i ] === unknow )
	      children.splice( i, 1 );
	};
	
	component.prototype.removeChildren = function(){
	  var children = this.children, c, l;
	
	  this.stopAnimations();
	
	  for( i = 0, c, l = children.length; i < l; i ++ ){
	    c = children[ i ];
	    
	    // if( c instanceof component ){
	    //   c.parent = null;
	    //   c.removeChildren();
	    // }else{
	      c.remove();
	    // }
	  }
	
	  children.length = 0;
	};
	
	component.prototype.cache = function( key, unknow ){
	  var c;
	
	  if( c = this.caches[ key ] )
	    c.push( unknow );
	  else
	    this.caches[ key ] = [ unknow ];
	};
	
	component.prototype.getCache = function( key ){
	  var c;
	
	  if( c = this.caches[ key ] )
	    return c.shift();
	};
	
	component.prototype.show = function(){
	  var children = this.children;
	
	  for( var i = 0, l = children.length; i < l; i ++ )
	    children[ i ].show();
	
	  return this;
	};
	
	component.prototype.hide = function(){
	  var children = this.children;
	
	  for( var i = 0, l = children.length; i < l; i ++ )
	    children[ i ].hide();
	
	  return this;
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
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/components/crawler.js
 */ 
define("scripts/components/crawler.js", function(exports,module){
	/**
	 * crawler
	 */
	
	var Component = require("scripts/component");
	
	exports = Component.create().extend( {
	  height: 158,
	
	  render: function( conf ){
	    this.element = this.add( {
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
	    this.element.setBackgroundPositionX( offset );
	  }
	} );;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/components/wheels.js
 */ 
define("scripts/components/wheels.js", function(exports,module){
	/**
	 * wheels
	 */
	
	var Component = require("scripts/component");
	
	exports = Component.create().extend( {
	  height: 20,
	
	  render: function( conf ){
	    var wheels;
	    
	    wheels = this.add( {
	      type: "image",
	      x: 0,
	      y: conf.y,
	      width: this.availWidth,
	      height: this.height,
	      image: "images/wheels.png"
	    } );
	  }
	} );;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/components/foreground.js
 */ 
define("scripts/components/foreground.js", function(exports,module){
	/**
	 * foreground
	 */
	
	var Component = require("scripts/component");
	
	exports = Component.create().extend( {
	  render: function( conf ){
	    this.add( {
	      type: "image",
	      x: 56 * this.availWidth / 568,
	      y: this.availHeight - 101.5,
	      width: 100,
	      height: 101.5,
	      image: "images/image-1.png"
	    } );
	
	    this.add( {
	      type: "image",
	      x: 438 * this.availWidth / 568,
	      y: this.availHeight - 101.5,
	      width: 100,
	      height: 101.5,
	      image: "images/image-2.png"
	    } );
	  }
	} );;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/components/knife.js
 */ 
define("scripts/components/knife.js", function(exports,module){
	/**
	 * knife
	 */
	
	// TODO: 刀光再优化一下样式
	
	var Component = require("scripts/component");
	var message = require("scripts/message");
	
	var life = 300;
	var strokeWidth = 10;
	
	var lastPoint;
	
	var style = function(){};
	
	style.prototype = {
	  type: "path",
	  strokeWidth: strokeWidth,
	  strokeColor: "#00ffff",
	  zIndex: 100
	};
	
	exports = Component.create().extend( {
	  init: function(){
	    message.addEventListener( "touch-spot", function( x, y ){
	      this.dotAt( x, y );
	    }.bind( this ) );
	
	    message.addEventListener( "touch-end", function(){
	      lastPoint = null;
	    } );
	  },
	
	  dotAt: function( x, y ){
	    var line, el, n, c;
	
	    if( lastPoint ){
	      line = [ lastPoint, [ x, y ] ];
	
	      if( el = this.getCache( "knife" ) ){
	        el.setPoints( line );
	        el.show();
	      }else{
	        c = new style;
	        c.points = line;
	        el = this.add( c );
	      }
	
	      // el.render();
	      // el.parent.render();
	      
	      message.postMessage( "cut-in", line );
	
	      this.startAnimation( el, {
	        start: 0,
	        duration: life,
	        
	        onTimeUpdate: function( time ){
	          n = 1 - ( time / life );
	          this.obj.lineWidth = strokeWidth * n;
	          this.alpha( n );
	        },
	
	        onTimeEnd: function(){
	          this.cache( "knife", el.hide() );
	          // this.remove( el );
	        }.bind( this )
	      } );
	    }
	
	    lastPoint = [ x, y ];
	  }
	} );;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/components/boxes.js
 */ 
define("scripts/components/boxes.js", function(exports,module){
	/**
	 * boxes
	 */
	
	var Component = require("scripts/component");
	var message = require("scripts/message");
	var collide = require("scripts/game/collide");
	
	var Box = require("scripts/components/box");
	var Boom = require("scripts/components/boom");
	
	var boxTypeNames = [ "nm-h", "nm-v", "ad-h", "boom-h" ];
	var boxTypeNumber = boxTypeNames.length;
	
	var abs = Math.abs, sin = Math.sin, cos = Math.cos, floor = Math.floor;
	
	var random = function( number ){
	  return floor( Math.random() * number );
	};
	
	exports = Component.create().extend( {
	  boxWidth: 195,
	  boxHeight: 195,
	  boxSpacing: 80,
	  boxes: [],
	
	  reset: function(){
	    // TODO: 重置所有变量，如 boxes
	  },
	
	  init: function(){
	    message.addEventListener( "cut-in", function( line ){
	      var collideBoxes = collide.check( this.boxes, line );
	
	      for( var i = 0, l = collideBoxes.length; i < l; i ++ )
	        collideBoxes[ i ].chop( line );
	    }.bind( this ) );
	
	    message.addEventListener( "boom-blast", function( x, y ){
	      var boxes = this.boxes;
	
	      for( var i = 0, l = boxes.length; i < l; i ++ )
	        boxes[ i ].awayFrom( x, y );
	    }.bind( this ) );
	  },
	
	  createOne: function( offsetX ){
	    var boxType, box;
	
	    boxType = boxTypeNames[ random( boxTypeNumber ) ];
	
	    if( box = this.getCache( "box-" + boxType ) ){
	      box.show().reset();
	    }else if( boxType == "boom-h" ){
	      box = Boom.create( boxType, this.availWidth + offsetX );
	    }else{
	      box = Box.create( boxType, this.availWidth + offsetX );
	    }
	    
	    this.boxes.push( box );
	  },
	
	  moveLeft: function( offset ){
	    var firstX, i, l, box, x, boxes = this.boxes;
	
	    if( i = l = boxes.length ){
	      firstX = boxes[ 0 ].x;
	      
	      while( i -- ){
	        box = boxes[ i ];
	
	        x = floor( firstX + i * ( this.boxWidth + this.boxSpacing ) + offset );
	        
	        if( x < -this.boxWidth ){
	          boxes.splice( i, 1 );
	          this.cache( "box-" + box.boxType, box.hide() );
	          continue;
	        }else if( i == l - 1 && x < this.availWidth ){
	          this.createOne( this.availWidth - x );
	        }else{
	          box.setX( x );
	        }
	      }
	    }
	  }
	} );
	
	
	// shake2: function( n ){
	//   var dx, dy;
	
	//   n = ( n / e % 360 ) * Math.PI / 180;
	//   dx = ( Math.sin( n ) * .03 ) + .97;
	//   dy = ( Math.cos( n ) * .03 ) + .97;
	
	//   for( var i = 0, l = this.boxes.length; i < l; i ++ )
	//     // if( !elements[ i ].isStripped )
	//       this.boxes[ i ].scale( dx, dy );
	// };

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/game/collide.js
 */ 
define("scripts/game/collide.js", function(exports,module){
	/**
	 * 碰撞检测
	 */
	
	// TODO: 整理下这段代码
	
	exports.check = function( boxes, line ){
		var result = [];
	
		boxes.forEach( function( box ){
			var ck;
	
			if( box.choped )
			  return ;
	
			ck = lineInEllipse(
				line[ 0 ],
				line[ 1 ],
				box.group.getOrigin(),
				box.radius
			);
	
			if( ck )
				result.push( box );
		} );
	
		return result;
	};
	
	function sqr(x){
		return x * x;
	}
	
	function sign(n){
		return n < 0 ? -1 : ( n > 0 ? 1 : 0 );
	}
	
	function equation12( a, b, c ){
		if(a == 0)return;
	
		var delta = b * b - 4 * a * c;
		if(delta == 0)
			return [ -1 * b / (2 * a), -1 * b / (2 * a) ];
		else if(delta > 0)
			return [ (-1 * b + Math.sqrt(delta)) / (2 * a),  (-1 * b - Math.sqrt(delta)) / (2 * a) ];
	}
	
	// 返回线段和椭圆的两个交点，如果不相交，返回 null
	function lineXEllipse( p1, p2, c, r, e ){
		// 线段：p1, p2    圆心：c    半径：r    离心率：e
		if (r <= 0) return;
		e = e === undefined ? 1 : e;
		var t1 = r, t2 = r * e, k;
	
		a = sqr( t2) * sqr(p1[0] - p2[0]) + sqr(t1) * sqr(p1[1] - p2[1]);
	
		if (a <= 0) return;
		
		b = 2 * sqr(t2) * (p2[0] - p1[0]) * (p1[0] - c[0]) + 2 * sqr(t1) * (p2[1] - p1[1]) * (p1[1] - c[1]);
		c = sqr(t2) * sqr(p1[0] - c[0]) + sqr(t1) * sqr(p1[1] - c[1]) - sqr(t1) * sqr(t2);
		
		if (!( k = equation12(a, b, c, t1, t2) )) return;
		
		var result = [
			[ p1[0] + k[0] * (p2[0] - p1[0]), p1[1] + k[0] * (p2[1] - p1[1]) ],
			[ p1[0] + k[1] * (p2[0] - p1[0]), p1[1] + k[1] * (p2[1] - p1[1]) ]
		];
		
		if ( !( ( sign( result[0][0] - p1[0] ) * sign( result[0][0] - p2[0] ) <= 0 ) &&
			( sign( result[0][1] - p1[1] ) * sign( result[0][1] - p2[1] ) <= 0 ) ) )
			result[0] = null;
	
		if ( !( ( sign( result[1][0] - p1[0] ) * sign( result[1][0] - p2[0] ) <= 0 ) &&
			( sign( result[1][1] - p1[1] ) * sign( result[1][1] - p2[1] ) <= 0 ) ) )
			result[1] = null;
	
		return result;
	}
	
	// 判断计算线段和椭圆是否相交
	function lineInEllipse( p1, p2, c, r, e ){
		var t = lineXEllipse( p1, p2, c, r, e );
		return t && ( t[0] || t[1] );
	};

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/components/box.js
 */ 
define("scripts/components/box.js", function(exports,module){
	/**
	 * box
	 */
	
	var Component = require("scripts/component");
	var Element = require("scripts/adapter/element/index");
	var Sound = require("scripts/game/sound");
	var tools = require("scripts/game/tools");
	var tween = require("scripts/lib/tween");
	var quadratic = tween.quadratic.cio;
	var exponential = tween.exponential.co;
	var dropAnim = tween.quadratic.ci;
	var abs = Math.abs, sin = Math.sin, cos = Math.cos, PI = Math.PI;
	
	var chopAngleScope = 22.5;
	
	var boxData = {
	  "nm-h": {
	    image: "images/box-h-normal.png",
	    
	    chopImage: "images/box-h-strip.png",
	    chopFrames: 3,
	    chopImageWidth: 585,
	    chopImageHeight: 195,
	    chopDuration: 100,
	
	    openImage: "images/box-h-open.png",
	    openFrames: 7,
	    openImageWidth: 1365,
	    openImageHeight: 195,
	    openDuration: 350,
	
	    errorImage: "images/box-h-error.png",
	    errorFrames: 4,
	    errorImageWidth: 780,
	    errorImageHeight: 195,
	    errorDuration: 200,
	
	    radius: 30,
	    dir: "h"
	  },
	
	  "nm-v": {
	    image: "images/box-v-normal.png",
	    
	    chopImage: "images/box-v-strip.png",
	    chopFrames: 3,
	    chopImageWidth: 585,
	    chopImageHeight: 195,
	    chopDuration: 100,
	
	    openImage: "images/box-v-open.png",
	    openFrames: 7,
	    openImageWidth: 1365,
	    openImageHeight: 195,
	    openDuration: 350,
	
	    errorImage: "images/box-v-error.png",
	    errorFrames: 4,
	    errorImageWidth: 780,
	    errorImageHeight: 195,
	    errorDuration: 200,
	
	    radius: 30,
	    dir: "v"
	  },
	
	  "ad-h": {
	    image: "images/box-ad-h-normal.png",
	    
	    chopImage: "images/box-ad-h-strip.png",
	    chopFrames: 3,
	    chopImageWidth: 585,
	    chopImageHeight: 195,
	    chopDuration: 100,
	
	    openImage: "images/box-ad-h-open.png",
	    openFrames: 7,
	    openImageWidth: 1365,
	    openImageHeight: 195,
	    openDuration: 350,
	
	    errorImage: "images/box-h-error.png", // TODO: 缺这强图片
	    errorFrames: 4,
	    errorImageWidth: 780,
	    errorImageHeight: 195,
	    errorDuration: 200,
	
	    radius: 30,
	    dir: "h"
	  }
	};
	
	var lightData = {
	  "h": {
	    image: "images/light-h.png",
	    width: 195,
	    height: 5,
	    x: 0,
	    y: 75
	  },
	
	  "v": {
	    image: "images/light-v.png",
	    width: 5,
	    height: 195,
	    x: 95,
	    y: 0
	  }
	};
	
	var boxWidth, boxHeight;
	
	boxWidth = boxHeight = 195;
	
	var random = function( number ){
	  return Math.floor( Math.random() * number );
	};
	
	var copy = function( from, to ){
	  for( var name in from )
	    to[ name ] = from[ name ];
	};
	
	var createOption = function( options ){
	  var f;
	
	  f = function(){};
	  f.prototype = options;
	
	  return f;
	};
	
	var checkChopAngle = function( box, line ){
	  var angle, s = chopAngleScope;
	
	  angle = tools.getAngleByRadian( tools.pointToRadian( line[ 0 ], line[ 1 ] ) );
	
	  if( box.dir == "v" )
	    return abs( 270 - angle ) < s || abs( 90 - angle ) < s;
	
	  if( box.dir == "h" )
	    return abs( angle ) < s || abs( 360 - angle ) < s || abs( 180 - angle ) < s;
	};
	
	var groupElementOption = createOption( {
	  type: "rect",
	  width: boxWidth,
	  height: boxHeight,
	  x: 0
	} );
	
	var staticImageElementOption =  createOption( {
	  type: "image",
	  // framesDir: "h",
	  width: boxWidth,
	  height: boxHeight,
	  x: 0,
	  y: 0
	} );
	
	var lightElementOption = createOption( { 
	  type: "image", 
	  zIndex: 99
	} );
	
	var starElementOption = createOption( {
	  type: "image",
	  image: "images/star.png",
	  width: 45,
	  height: 45,
	  zIndex: 200
	} );
	
	var boxExtend = /* Component.create().extend */ ( {
	  boxTypeIndex: 0,
	  x: 0,
	
	  render: function(){
	    var c, group, staticImage, d;
	
	    d = this.configData;
	
	    // group
	    copy( { y: ( this.availHeight - boxHeight ) / 2 - 10 }, c = new groupElementOption );
	    group = this.group = this.add( c );
	
	    copy( { image: d.image }, c = new staticImageElementOption );
	    staticImage = this.staticImage = Element.create( c );
	
	    group.obj.add( staticImage.obj );
	
	    group.defineFrameAnimation( "chop", {
	      image: d.chopImage,
	      imageWidth: d.chopImageWidth,
	      imageHeight: d.chopImageHeight,
	      frames: d.chopFrames,
	      duration: d.chopDuration
	    } );
	
	    group.defineFrameAnimation( "open", {
	      image: d.openImage,
	      imageWidth: d.openImageWidth,
	      imageHeight: d.openImageHeight,
	      frames: d.openFrames,
	      duration: d.openDuration
	    } );
	
	    group.defineFrameAnimation( "error", {
	      image: d.errorImage,
	      imageWidth: d.errorImageWidth,
	      imageHeight: d.errorImageHeight,
	      frames: d.errorFrames,
	      duration: d.errorDuration
	    } );
	  },
	
	  reset: function(){
	    if( this.choped ){
	      this.group.stopFrameAnimation( "chop" );
	      this.choped = false;
	    }
	
	    if( this.opened ){
	      this.group.stopFrameAnimation( "open" );
	      this.opened = false;
	    }
	
	    if( this.errored ){
	      this.group.stopFrameAnimation( "error" );
	      this.errored = false;
	    }
	
	    this.staticImage.show();
	
	    return this;
	  },
	
	  setX: function( x ){
	    this.group.x( this.x = x );
	  },
	
	  chop: function( line ){
	    if( this.choped )
	      return ;
	    else
	      this.choped = true;
	
	    Sound.play( "cut" );
	
	    if( !checkChopAngle( this, line ) ){
	      this.showLight( "error" );
	      this.error();
	      return;
	    }
	
	    this.showLight();
	    this.showStar();
	    // this.staticImage.hide();
	    this.group.playFrameAnimation( "chop" ).then( function(){
	      // this.group.animations.chop.hide();
	      this.open();
	    }.bind( this ) );
	  },
	
	  open: function(){
	    if( this.opened )
	      return ;
	    else
	      this.opened = true;
	
	    this.group.playFrameAnimation( "open" ).then( function(){
	      this.staticImage.hide();
	      this.group.stopFrameAnimation( "chop" );
	    }.bind( this ) );
	  },
	
	  error: function(){
	    if( this.errored )
	      return ;
	    else
	      this.errored = true;
	
	    this.staticImage.hide();
	    this.group.playFrameAnimation( "error" ).then( function(){
	      // TODO: 
	    } );
	  },
	
	  showLight: function( type ){
	    var dir, c, light, z;
	
	    if( type == "error" )
	      dir = this.dir == "v" ? "h" : "v";
	    else
	      dir = this.dir;
	
	    copy( lightData[ dir ], c = new lightElementOption );
	
	    if( light = this.getCache( "light-" + dir ) ){
	      light.show();
	    }else{
	      light = Element.create( c );
	      this.group.obj.add( light.obj );
	    }
	
	    this.startAnimation( light, {
	      duration: 200,
	      onTimeUpdate: function( time ){
	        this.scale( z = quadratic( time, 0, 2, 200 ), z );
	      }
	    } );
	
	    this.startAnimation( light, {
	      start: 200,
	      duration: 100,
	      onTimeUpdate: function( time ){
	        this.scale( z = quadratic( time, 2, -2, 200 ), z );
	      },
	      onTimeEnd: function(){
	        this.cache( "light-" + dir, light.hide() );
	        // this.hide();
	      }.bind( this )
	    } ); 
	  },
	
	  showStar: function(){
	    var origin, count = 3, dir = 360 / count;
	
	    origin = this.group.getOrigin();
	
	    for( var i = 0; i < count; i ++ )
	      this.createOneStar( origin[ 0 ], origin[ 1 ], i * dir );
	  },
	
	  awayFrom: function(){
	    // TODO:   
	  },
	
	  createOneStar: function( originX, originY, dir ){
	    var duration, star, c;
	
	    originX -= 42.5;
	    originY -= 40;
	    duration = 1500;
	
	    if( star = this.getCache( "star" ) ){
	      star.show().translate( originX, originY );
	    }else{
	      c = new starElementOption;
	      c.x = originX;
	      c.y = originY;
	      star = this.add( c );
	      star.rotate( random( 360 ) );
	    }
	
	    copy( {
	      distance: random( 180 ) + 50,
	      dir: dir * PI / 180,
	      originX: originX,
	      originY: originY
	    }, star );
	
	    this.startAnimation( star, {
	      duration: duration,
	
	      onTimeUpdate: function( time ){
	        var distance, x, y, z;
	
	        distance = exponential( time, 0, this.distance, duration );
	
	        x = this.originX + distance * cos( this.dir );
	        y = this.originY + distance * sin( this.dir ) + dropAnim( time, 0, 50, duration );
	        z = exponential( time, 1, -1, duration );
	
	        this.translate( x, y ).scale( z, z );
	      },
	      onTimeEnd: function(){
	        this.cache( "star", star.hide() );
	      }.bind( this )
	    } );
	  }
	} );
	
	exports.create = function( boxType, initX ){
	  var b, d;
	
	  d = boxData[ boxType ];
	  b = Component.create().extend( boxExtend );
	
	  b.configData = d;
	  b.boxType = boxType;
	  b.radius = d.radius;
	  b.dir = d.dir;
	  b.render();
	  b.setX( initX );
	
	  return b;
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/game/tools.js
 */ 
define("scripts/game/tools.js", function(exports,module){
	/**
	 * tools
	 */
	
	exports.getAngleByRadian = function( radian ){
	  return radian * 180 / Math.PI;
	}
	
	exports.pointToRadian = function( origin, point ){
	  var PI = Math.PI;
	  
	  if( point[0] === origin[0] ){
	    if ( point[1] > origin[1] )
	      return PI * 0.5;
	    return PI * 1.5
	  }else if( point[1] === origin[1] ){
	    if ( point[0] > origin[0] )
	      return 0;
	    return PI;
	  }
	
	  var t = Math.atan( ( origin[1] - point[1] ) / ( origin[0] - point[0] ) );
	
	  if( point[0] > origin[0] && point[1] < origin[1] )
	    return t + 2 * PI;
	
	  if( point[0] > origin[0] && point[1] > origin[1] )
	    return t;
	
	  return t + PI;
	};

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/lib/tween.js
 */ 
define("scripts/lib/tween.js", function(exports,module){
	exports.exponential = function(){};
	exports.exponential.co = function(index, offset, target, framesNum){ return (index == framesNum) ? offset + target : target * (-Math.pow(2, -10 * index / framesNum) + 1) + offset; };
	// exports.exponential.ci = function(index, offset, target, framesNum){ return (index == 0) ? offset : target * Math.pow(2, 10 * (index / framesNum - 1)) + offset; }
	
	exports.bounce = function(){};
	exports.bounce.co = function(index, offset, target, framesNum){ if((index /= framesNum) < (1 / 2.75)) return target * (7.5625 * index * index) + offset; else if(index < (2 / 2.75)) return target * (7.5625 * (index -= (1.5 / 2.75)) * index + .75) + offset; else if(index < (2.5 / 2.75)) return target * (7.5625 * (index -= (2.25 / 2.75)) * index + .9375) + offset; else return target * (7.5625 * (index -= (2.625 / 2.75)) * index + .984375) + offset; };
	
	exports.quadratic = function(){};
	exports.quadratic.ci = function(index, offset, target, framesNum){ return target * (index /= framesNum) * index + offset; };
	exports.quadratic.co = function(index, offset, target, framesNum){ return - target * (index /= framesNum) * (index - 2) + offset; }
	exports.quadratic.cio = function(index, offset, target, framesNum){ if((index /= framesNum / 2) < 1) return target / 2 * index * index + offset; else return - target / 2 * ((-- index) * (index - 2) - 1) + offset; };
	
	exports.circular = function(index, offset, target, framesNum){ if((index /= framesNum / 2) < 1) return - target / 2 * (Math.sqrt(1 - index * index) - 1) + offset; else return target / 2 * (Math.sqrt(1 - (index -= 2) * index) + 1) + offset; }
	
	exports.linear = function(index, offset, target, framesNum){ return target * index / framesNum + offset; };
	
	exports.back = function(){};
	exports.back.ci = function(index, offset, target, framesNum, s){ s = 1.70158; return target * (index /= framesNum) * index * ((s + 1) * index - s) + offset; };
	exports.back.co = function(index, offset, target, framesNum, s){ s = 1.70158; return target * ((index = index / framesNum - 1) * index * ((s + 1) * index + s) + 1) + offset; };
	
	// TODO: 压缩
	exports.elastic = function(){};
	exports.elastic.co = function(index, offset, target, framesNum, a, p){
	  var s;
	  if(index == 0)
	    return offset;
	  else if((index /= framesNum) == 1)
	    return offset + target;
	
	  if(!p)
	    p = framesNum * .3;
	
	  if(!a || a < Math.abs(target)){
	    a = target;
	    s = p / 4;
	  }else
	    s = p / (2 * Math.PI) * Math.asin(target / a);
	
	  return a * Math.pow(2, -10 * index) * Math.sin((index * framesNum - s) * (2 * Math.PI) / p) + target + offset;
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/components/boom.js
 */ 
define("scripts/components/boom.js", function(exports,module){
	/**
	 * boom
	 */
	
	var Component = require("scripts/component");
	var Element = require("scripts/adapter/element/index");
	var Sound = require("scripts/game/sound");
	var tools = require("scripts/game/tools");
	var tween = require("scripts/lib/tween");
	var message = require("scripts/message");
	var quadratic = tween.quadratic.cio;
	var exponential = tween.exponential.co;
	var dropAnim = tween.quadratic.ci;
	var abs = Math.abs, sin = Math.sin, cos = Math.cos, floor = Math.floor, max = Math.max, min = Math.min, PI = Math.PI;
	
	var boxWidth, boxHeight;
	
	boxWidth = boxHeight = 195;
	
	var random = function( number ){
	  return Math.floor( Math.random() * number );
	};
	
	var copy = function( from, to ){
	  for( var name in from )
	    to[ name ] = from[ name ];
	};
	
	var createOption = function( options ){
	  var f;
	
	  f = function(){};
	  f.prototype = options;
	
	  return f;
	};
	
	var lightData = {
	  "h": {
	    image: "images/light-h.png",
	    width: 195,
	    height: 5,
	    x: 0,
	    y: 75
	  },
	
	  "v": {
	    image: "images/light-v.png",
	    width: 5,
	    height: 195,
	    x: 95,
	    y: 0
	  }
	};
	
	var nmAnimationData = {
	  image: "images/boom-h-normal.png",
	  frames: 3,
	  imageWidth: 585,
	  imageHeight: 195,
	  loop: true,
	  duration: 350
	};
	
	var bombData = {
	  image: "images/boom-h-bomb.png",
	  frames: 5,
	  imageWidth: 975,
	  imageHeight: 195,
	  duration: 800
	};
	
	var boomMaskData = {
	  image: "images/boom-marks.png",
	  frames: 3,
	  imageWidth: 585,
	  imageHeight: 195,
	  duration: 300,
	  loop: true
	};
	
	var groupElementOption = createOption( {
	  type: "rect",
	  width: boxWidth,
	  height: boxHeight,
	  x: 0
	} );
	
	var lightElementOption = createOption( { 
	  type: "image", 
	  zIndex: 99
	} );
	
	var fragmentElementOption = createOption( {
	  type: "frames",
	  image: "images/boom-fragment.png",
	  frames: 34,
	  width: 90,
	  height: 90,
	  imageWidth: 3060,
	  imageHeight: 90,
	  zIndex: 200
	} );
	
	var getChopAngle = function( line ){
	  var angle, s = 45;
	
	  angle = tools.getAngleByRadian( tools.pointToRadian( line[ 0 ], line[ 1 ] ) );
	
	  if( abs( 270 - angle ) < s || abs( 90 - angle ) < s )
	    return "v";
	
	  if( abs( angle ) < s || abs( 360 - angle ) < s || abs( 180 - angle ) < s )
	    return "h";
	};
	
	var boxExtend = /* Component.create().extend */ ( {
	  boxTypeIndex: 0,
	  x: 0,
	
	  render: function(){
	    var c, group, dynamicImage;
	
	    copy( { y: ( this.availHeight - boxHeight ) / 2 - 10 }, c = new groupElementOption );
	    group = this.group = this.add( c );
	
	    group.defineFrameAnimation( "normal", nmAnimationData );
	    group.defineFrameAnimation( "bomb", bombData );
	    group.defineFrameAnimation( "mark", boomMaskData );
	
	    group.playFrameAnimation( "normal" );
	  },
	
	  reset: function(){
	    this.group.playFrameAnimation( "normal" );
	    this.choped = false;
	    return this;
	  },
	
	  chop: function( line ){
	    if( this.choped )
	      return ;
	    else
	      this.choped = true;
	
	    message.postMessage( "cut-in-boom" );
	    this.showLight( getChopAngle( line ) );
	    
	    Sound.play( "boom" );
	
	    this.group.stopFrameAnimation( "normal" );
	    this.group.playFrameAnimation( "bomb", function( frame ){
	      if( frame == 4 )
	        this.blast(); 
	    }.bind( this ) ).then( function(){
	      this.group.stopFrameAnimation( "bomb" );
	      this.group.playFrameAnimation( "mark" );
	    }.bind( this ) );
	  },
	
	  showLight: function( dir ){
	    var c, light, z;
	
	    copy( lightData[ dir ], c = new lightElementOption );
	
	    if( light = this.getCache( "light-" + dir ) ){
	      light.show();
	    }else{
	      light = Element.create( c );
	      this.group.obj.add( light.obj );
	    }
	
	    this.startAnimation( light, {
	      duration: 200,
	      onTimeUpdate: function( time ){
	        this.scale( z = quadratic( time, 0, 2, 200 ), z );
	      }
	    } );
	
	    this.startAnimation( light, {
	      start: 200,
	      duration: 100,
	      onTimeUpdate: function( time ){
	        this.scale( z = quadratic( time, 2, -2, 200 ), z );
	      },
	      onTimeEnd: function(){
	        this.cache( "light-" + dir, light.hide() );
	        // this.hide();
	      }.bind( this )
	    } ); 
	  },
	
	  blast: function(){
	    var origin, count = 34, f = -1;
	
	    origin = this.group.getOrigin();
	
	    message.postMessage( "boom-blast", origin[0], origin[1] );
	
	    for( var i = 0; i < count; i ++ )
	      this.createOneFragment( origin[ 0 ], origin[ 1 ], i );
	  },
	
	  awayFrom: function( x, y ){
	    // TODO:   
	  },
	
	  createOneFragment: function( originX, originY, n ){
	    var duration, fragment, c, dir, dropDuration, scaleDuration, alphaDuration, alphaStart;
	
	    originX -= 42.5;
	    originY -= 65;
	
	    duration = 1200;
	    alphaDuration = 300;
	    alphaStart = duration - alphaDuration;
	
	    dir = ( 150 + random( 210 ) ) * PI / 180;
	    dropDuration = 50 + random( 400 );
	    scaleDuration = - Math.random();
	
	    if( fragment = this.getCache( "fragment" ) ){
	      fragment.show().translate( originX, originY );
	    }else{
	      c = new fragmentElementOption;
	      c.x = originX;
	      c.y = originY;
	      fragment = this.add( c );
	      fragment.setFrame( n );
	    }
	
	    copy( {
	      distance: random( 200 ) + 100,
	      dir: dir,
	      originX: originX,
	      originY: originY
	    }, fragment );
	
	    this.startAnimation( fragment, {
	      duration: duration,
	
	      onTimeUpdate: function( time ){
	        var distance, x, y, z, a;
	
	        distance = exponential( time, 0, this.distance, duration );
	
	        x = this.originX + distance * cos( this.dir );
	        y = this.originY + distance * sin( this.dir ) + dropAnim( time, 0, dropDuration, duration );
	        a = time > alphaStart ? ( 1 - ( time - alphaStart ) / alphaDuration ) : 1;
	
	        this.translate( x, y ).alpha( a );
	      },
	      onTimeEnd: function(){
	        this.cache( "fragment", fragment.hide() );
	      }.bind( this )
	    } );
	  },
	
	  setX: function( x ){
	    this.group.x( this.x = x );
	  }
	} );
	
	exports.create = function( boxType, initX ){
	  var b;
	
	  b = Component.create().extend( boxExtend );
	
	  b.boxType = boxType;
	  b.radius = 30;
	  b.dir = "h";
	  b.render();
	  b.setX( initX );
	
	  return b;
	};;

	return exports;
});


/**
 * @source /Users/Dron/hosting/post-ninja/output/scripts/main.js
 */ 
define("scripts/main.js", function(exports,module){
	/**
	 * 主线业务逻辑
	 * @author dron
	 */
	
	// FIXME: 经常滚动一会儿就没有包裹的图片了
	
	var state = require("scripts/state");
	var CEC = require("scripts/lib/cec");
	var Stage = require("scripts/adapter/stage/index");
	var Game = require("scripts/game/main");
	var renderTimeline = require("scripts/timeline").use( "canvas-render" ).init( 1 );
	var Interaction = require("scripts/interaction");
	var Component = require("scripts/component");
	var promise = require("scripts/lib/promise");
	var device = require("scripts/device");
	
	exports.preloadResources = function(){
	  var resources, pm = new promise;
	  
	  resources = [
	      "images/box-h-normal.png",
	      "images/box-v-normal.png",
	      "images/box-ad-h-normal.png",
	      
	      "images/box-h-strip.png",
	      "images/box-v-strip.png",
	      "images/box-ad-h-strip.png",
	      
	      "images/box-h-open.png",
	      "images/box-v-open.png",
	      "images/box-ad-h-open.png",
	
	      "images/box-h-error.png",
	      "images/box-v-error.png",
	
	      "images/boom-h-normal.png",
	      "images/boom-h-bomb.png",
	      "images/boom-fragment.png", // TODO: 换用 1 倍图
	      "images/boom-marks.png",
	
	      "images/crawler.png",
	      "images/star.png"
	  ];
	
	  new CEC.Loader( resources, function( process, img ){
	    if( process == 1 )
	      pm.resolve();
	  } );
	
	  return pm;
	};
	
	exports.start = function(){
	  var canvas, canvasZoom, canvasWidth, canvasHeight, stage, body, extraBarHeight, landscapeTip;
	
	  body = document.body;
	
	  if( device.supportStandAlone() && !device.isStandAlone() ){
	    body.innerHTML = "<div style='margin: 20px; font-size: 20px; color: red;'>请添加本页到主屏幕后打开！</div>";
	    body.style.backgroundColor = "#f6f6f6";
	    return ;
	  }
	
	  canvas = document.getElementById( "canvas" );
	  landscapeTip = document.getElementById( "landscape-tip" );
	
	  canvasWidth = window.innerWidth || document.documentElement.clientWidth;
	  canvasHeight = window.innerHeight || document.documentElement.clientHeight;
	
	  if( canvasWidth < canvasHeight ){
	    canvasWidth = [ canvasHeight, canvasHeight = canvasWidth ][ 0 ];
	    extraBarHeight = device.getExtraBarHeight();
	    canvasWidth += extraBarHeight;
	    canvasHeight -= extraBarHeight;
	  }
	
	  if( landscapeTip )
	    device.hookOrientationChange( function( name ){name = 'landscape'
	      landscapeTip.style.display = name == "landscape" ? "none" : "block";
	      body.scrollLeft =
	      body.scrollTop = 0;
	    } );
	
	  state( "canvas" ).set( {
	    width: canvas.width = canvasWidth,
	    height: canvas.height = canvasHeight
	  } );
	
	  stage = Stage.create( { canvas: "canvas" } );
	  renderTimeline.createTask( { duration: -1, object: stage, onTimeUpdate: stage.render } );
	
	  Component.init( { stage: stage } );
	  Interaction.init( { canvas: canvas } );
	
	  // Game.init();
	  this.preloadResources().then( Game.init.bind( Game ) );
	
	  Ucren.addEvent(document, "touchmove", function( event ){
	    event.preventDefault();
	  } );
	};;

	return exports;
});


startModule("scripts/main");

}();