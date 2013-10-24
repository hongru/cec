/**
 * this file was compiled by jsbuild 0.9.9
 * @date Thu, 24 Oct 2013 01:37:34 GMT
 * @author dron
 * @site http://ucren.com
 */

void function( global ){
	var oRequire, mapping = {}, cache = {}, extRegx = /\.js$/;

   if( typeof require != 'undefined' )
       oRequire = global.oRequire = require;

	global.startModule = function( m ){
		require( m ).start();
	};

	global.define = function( id, fn ){
		mapping[ id ] = fn;
	};

	global.require = function( id ){
       var m, n, oid = id;

		if( !extRegx.test( id ) )
			id += '.js';
		if( cache[ id ] )
			return cache[ id ];
		else if( m = mapping[ id ] )
			return n = { exports: {} }, cache[ id ] = m( n.exports, n );
       else if( oRequire )
           return oRequire( oid );
	};
}( this );

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
	      return ;
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
 * @source /Users/Dron/hosting/post-ninja/output/scripts/lib/cec-all.js
 */ 
define("scripts/lib/cec-all.js", function(exports,module){
	/**
	 * cec-all
	 */
	
	var promise = require("scripts/lib/promise");
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
 * @source /Users/Dron/hosting/post-ninja/output/scripts/adapter/stage/index.js
 */ 
define("scripts/adapter/stage/index.js", function(exports,module){
	/**
	 * stage 原型适配器 for cec
	 */
	
	var CEC = require("scripts/lib/cec-all");
	var Element = require("scripts/adapter/element/index");
	
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
	
	var CEC = require("scripts/lib/cec-all");
	
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
	};;

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
	
	// variables
	var speed;
	var level;
	
	var canvas;
	
	var resetVariables = function(){
	  speed = 240; // pps: pixel per second
	  level = 1;
	};
	
	// TODO: 重构场景管理器 sence-manager
	var MainSence = function(){
	  var movingTimer;
	
	  return {
	    init: function(){
	      var image1, image2;
	
	      background.render();
	
	      crawler.render( {
	        y: background.topHeight + ( canvas.height - background.topHeight - background.bottomHeight - ( crawler.height + wheels.height ) ) / 2
	      } );
	
	      wheels.render( {
	        y: crawler.height + crawler.y
	      } );
	
	      foreground.render();
	
	      boxes.init();
	      knife.init();
	
	      // setInterval( function(){
	      //   document.title = timeline.getFPS();
	      // }, 200 );
	
	      Sound.play( "background" );
	    },
	
	    start: function(){
	      var x, lastTime = 0, frame = 0, f;
	
	      boxes.createOne( 0 );
	
	      movingTimer = timeline.createTask( {
	        start: 0, duration: -1, object: this,
	        onTimeUpdate: function( time ){
	          x = - speed * ( time - lastTime ) / 1000;
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
	  resetVariables();
	
	  MainSence.init();
	  MainSence.start();
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
 * @source /Users/Dron/hosting/post-ninja/output/scripts/game/sound.js
 */ 
define("scripts/game/sound.js", function(exports,module){
	/**
	 * 声音管理
	 */
	
	var sound = require("scripts/adapter/sound/index");
	
	exports = function(){
	  var mapping = {
	    "background": sound.create( "sounds/background", { loop: true } ),
	    "cut": sound.create( "sounds/cut" )
	  };
	
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
	var supported = buzz.isSupported();
	
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
	  s.setPercent( 0 );
	  s.setVolume( 100 );
	  s.play();
	};
	
	ClassBuzz.prototype.stop = function(){
	  this.sound.fadeOut( 1e3, function(){
	      this.pause();
	  } );
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
	// v 1.0.x beta
	// Licensed under the MIT license.
	// http://buzz.jaysalvat.com/
	// ----------------------------------------------------------------------------
	// Copyright (C) 2011 Jay Salvat
	// http://jaysalvat.com/
	// ----------------------------------------------------------------------------
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files ( the "Software" ), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	// ----------------------------------------------------------------------------
	
	var buzz = {
	    defaults: {
	        autoplay: false,
	        duration: 5000,
	        formats: [],
	        loop: false,
	        placeholder: '--',
	        preload: 'metadata',
	        volume: 80
	    },
	    types: {
	        'mp3': 'audio/mpeg',
	        'ogg': 'audio/ogg',
	        'wav': 'audio/wav',
	        'aac': 'audio/aac',
	        'm4a': 'audio/x-m4a'
	    },
	    sounds: [],
	    el: document.createElement( 'audio' ),
	
	    sound: function( src, options ) {
	        options = options || {};
	
	        var pid = 0,
	            events = [],
	            eventsOnce = {},
	            supported = buzz.isSupported();
	
	        // publics
	        this.load = function() {
	            if ( !supported ) {
	              return this;
	            }
	
	            this.sound.load();
	            return this;
	        };
	
	        this.play = function() {
	            if ( !supported ) {
	              return this;
	            }
	
	            this.sound.play();
	            return this;
	        };
	
	        this.togglePlay = function() {
	            if ( !supported ) {
	              return this;
	            }
	
	            if ( this.sound.paused ) {
	                this.sound.play();
	            } else {
	                this.sound.pause();
	            }
	            return this;
	        };
	
	        this.pause = function() {
	            if ( !supported ) {
	              return this;
	            }
	
	            this.sound.pause();
	            return this;
	        };
	
	        this.isPaused = function() {
	            if ( !supported ) {
	              return null;
	            }
	
	            return this.sound.paused;
	        };
	
	        this.stop = function() {
	            if ( !supported  ) {
	              return this;
	            }
	
	            this.setTime( this.getDuration() );
	            this.sound.pause();
	            return this;
	        };
	
	        this.isEnded = function() {
	            if ( !supported ) {
	              return null;
	            }
	
	            return this.sound.ended;
	        };
	
	        this.loop = function() {
	            if ( !supported ) {
	              return this;
	            }
	
	            this.sound.loop = 'loop';
	            this.bind( 'ended.buzzloop', function() {
	                this.currentTime = 0;
	                this.play();
	            });
	            return this;
	        };
	
	        this.unloop = function() {
	            if ( !supported ) {
	              return this;
	            }
	
	            this.sound.removeAttribute( 'loop' );
	            this.unbind( 'ended.buzzloop' );
	            return this;
	        };
	
	        this.mute = function() {
	            if ( !supported ) {
	              return this;
	            }
	
	            this.sound.muted = true;
	            return this;
	        };
	
	        this.unmute = function() {
	            if ( !supported ) {
	              return this;
	            }
	
	            this.sound.muted = false;
	            return this;
	        };
	
	        this.toggleMute = function() {
	            if ( !supported ) {
	              return this;
	            }
	
	            this.sound.muted = !this.sound.muted;
	            return this;
	        };
	
	        this.isMuted = function() {
	            if ( !supported ) {
	              return null;
	            }
	
	            return this.sound.muted;
	        };
	
	        this.setVolume = function( volume ) {
	            if ( !supported ) {
	              return this;
	            }
	
	            if ( volume < 0 ) {
	              volume = 0;
	            }
	            if ( volume > 100 ) {
	              volume = 100;
	            }
	          
	            this.volume = volume;
	            this.sound.volume = volume / 100;
	            return this;
	        };
	      
	        this.getVolume = function() {
	            if ( !supported ) {
	              return this;
	            }
	
	            return this.volume;
	        };
	
	        this.increaseVolume = function( value ) {
	            return this.setVolume( this.volume + ( value || 1 ) );
	        };
	
	        this.decreaseVolume = function( value ) {
	            return this.setVolume( this.volume - ( value || 1 ) );
	        };
	
	        this.setTime = function( time ) {
	            if ( !supported ) {
	              return this;
	            }
	
	            this.whenReady( function() {
	                this.sound.currentTime = time;
	            });
	            return this;
	        };
	
	        this.getTime = function() {
	            if ( !supported ) {
	              return null;
	            }
	
	            var time = Math.round( this.sound.currentTime * 100 ) / 100;
	            return isNaN( time ) ? buzz.defaults.placeholder : time;
	        };
	
	        this.setPercent = function( percent ) {
	            if ( !supported ) {
	              return this;
	            }
	
	            return this.setTime( buzz.fromPercent( percent, this.sound.duration ) );
	        };
	
	        this.getPercent = function() {
	            if ( !supported ) {
	              return null;
	            }
	
				var percent = Math.round( buzz.toPercent( this.sound.currentTime, this.sound.duration ) );
	            return isNaN( percent ) ? buzz.defaults.placeholder : percent;
	        };
	
	        this.setSpeed = function( duration ) {
				if ( !supported ) {
	              return this;
	            }
	
	            this.sound.playbackRate = duration;
	        };
	
	        this.getSpeed = function() {
				if ( !supported ) {
	              return null;
	            }
	
	            return this.sound.playbackRate;
	        };
	
	        this.getDuration = function() {
	            if ( !supported ) {
	              return null;
	            }
	
	            var duration = Math.round( this.sound.duration * 100 ) / 100;
	            return isNaN( duration ) ? buzz.defaults.placeholder : duration;
	        };
	
	        this.getPlayed = function() {
				if ( !supported ) {
	              return null;
	            }
	
	            return timerangeToArray( this.sound.played );
	        };
	
	        this.getBuffered = function() {
				if ( !supported ) {
	              return null;
	            }
	
	            return timerangeToArray( this.sound.buffered );
	        };
	
	        this.getSeekable = function() {
				if ( !supported ) {
	              return null;
	            }
	
	            return timerangeToArray( this.sound.seekable );
	        };
	
	        this.getErrorCode = function() {
	            if ( supported && this.sound.error ) {
	                return this.sound.error.code;
	            }
	            return 0;
	        };
	
	        this.getErrorMessage = function() {
				if ( !supported ) {
	              return null;
	            }
	
	            switch( this.getErrorCode() ) {
	                case 1:
	                    return 'MEDIA_ERR_ABORTED';
	                case 2:
	                    return 'MEDIA_ERR_NETWORK';
	                case 3:
	                    return 'MEDIA_ERR_DECODE';
	                case 4:
	                    return 'MEDIA_ERR_SRC_NOT_SUPPORTED';
	                default:
	                    return null;
	            }
	        };
	
	        this.getStateCode = function() {
				if ( !supported ) {
	              return null;
	            }
	
	            return this.sound.readyState;
	        };
	
	        this.getStateMessage = function() {
				if ( !supported ) {
	              return null;
	            }
	
	            switch( this.getStateCode() ) {
	                case 0:
	                    return 'HAVE_NOTHING';
	                case 1:
	                    return 'HAVE_METADATA';
	                case 2:
	                    return 'HAVE_CURRENT_DATA';
	                case 3:
	                    return 'HAVE_FUTURE_DATA';
	                case 4:
	                    return 'HAVE_ENOUGH_DATA';
	                default:
	                    return null;
	            }
	        };
	
	        this.getNetworkStateCode = function() {
				if ( !supported ) {
	              return null;
	            }
	
	            return this.sound.networkState;
	        };
	
	        this.getNetworkStateMessage = function() {
				if ( !supported ) {
	              return null;
	            }
	
	            switch( this.getNetworkStateCode() ) {
	                case 0:
	                    return 'NETWORK_EMPTY';
	                case 1:
	                    return 'NETWORK_IDLE';
	                case 2:
	                    return 'NETWORK_LOADING';
	                case 3:
	                    return 'NETWORK_NO_SOURCE';
	                default:
	                    return null;
	            }
	        };
	
	        this.set = function( key, value ) {
	            if ( !supported ) {
	              return this;
	            }
	
	            this.sound[ key ] = value;
	            return this;
	        };
	
	        this.get = function( key ) {
	            if ( !supported ) {
	              return null;
	            }
	
	            return key ? this.sound[ key ] : this.sound;
	        };
	
	        this.bind = function( types, func ) {
	            if ( !supported ) {
	              return this;
	            }
	
	            types = types.split( ' ' );
	
	            var that = this,
					efunc = function( e ) { func.call( that, e ); };
	
	            for( var t = 0; t < types.length; t++ ) {
	                var type = types[ t ],
	                    idx = type;
	                    type = idx.split( '.' )[ 0 ];
	
	                    events.push( { idx: idx, func: efunc } );
	                    this.sound.addEventListener( type, efunc, true );
	            }
	            return this;
	        };
	
	        this.unbind = function( types ) {
	            if ( !supported ) {
	              return this;
	            }
	
	            types = types.split( ' ' );
	
	            for( var t = 0; t < types.length; t++ ) {
	                var idx = types[ t ],
	                    type = idx.split( '.' )[ 0 ];
	
	                for( var i = 0; i < events.length; i++ ) {
	                    var namespace = events[ i ].idx.split( '.' );
	                    if ( events[ i ].idx == idx || ( namespace[ 1 ] && namespace[ 1 ] == idx.replace( '.', '' ) ) ) {
	                        this.sound.removeEventListener( type, events[ i ].func, true );
	                        // remove event
	                        events.splice(i, 1);
	                    }
	                }
	            }
	            return this;
	        };
	
	        this.bindOnce = function( type, func ) {
	            if ( !supported ) {
	              return this;
	            }
	
	            var that = this;
	
	            eventsOnce[ pid++ ] = false;
	            this.bind( pid + type, function() {
	               if ( !eventsOnce[ pid ] ) {
	                   eventsOnce[ pid ] = true;
	                   func.call( that );
	               }
	               that.unbind( pid + type );
	            });
	        };
	
	        this.trigger = function( types ) {
	            if ( !supported ) {
	              return this;
	            }
	
	            types = types.split( ' ' );
	
	            for( var t = 0; t < types.length; t++ ) {
	                var idx = types[ t ];
	
	                for( var i = 0; i < events.length; i++ ) {
	                    var eventType = events[ i ].idx.split( '.' );
	                    if ( events[ i ].idx == idx || ( eventType[ 0 ] && eventType[ 0 ] == idx.replace( '.', '' ) ) ) {
	                        var evt = document.createEvent('HTMLEvents');
	                        evt.initEvent( eventType[ 0 ], false, true );
	                        this.sound.dispatchEvent( evt );
	                    }
	                }
	            }
	            return this;
	        };
	
	        this.fadeTo = function( to, duration, callback ) {
				if ( !supported ) {
	              return this;
	            }
	
	            if ( duration instanceof Function ) {
	                callback = duration;
	                duration = buzz.defaults.duration;
	            } else {
	                duration = duration || buzz.defaults.duration;
	            }
	
	            var from = this.volume,
					delay = duration / Math.abs( from - to ),
	                that = this;
	            this.play();
	
	            function doFade() {
	                setTimeout( function() {
	                    if ( from < to && that.volume < to ) {
	                        that.setVolume( that.volume += 1 );
	                        doFade();
	                    } else if ( from > to && that.volume > to ) {
	                        that.setVolume( that.volume -= 1 );
	                        doFade();
	                    } else if ( callback instanceof Function ) {
	                        callback.apply( that );
	                    }
	                }, delay );
	            }
	            this.whenReady( function() {
	                doFade();
	            });
	
	            return this;
	        };
	
	        this.fadeIn = function( duration, callback ) {
	            if ( !supported ) {
	              return this;
	            }
	
	            return this.setVolume(0).fadeTo( 100, duration, callback );
	        };
	
	        this.fadeOut = function( duration, callback ) {
				if ( !supported ) {
	              return this;
	            }
	
	            return this.fadeTo( 0, duration, callback );
	        };
	
	        this.fadeWith = function( sound, duration ) {
	            if ( !supported ) {
	              return this;
	            }
	
	            this.fadeOut( duration, function() {
	                this.stop();
	            });
	
	            sound.play().fadeIn( duration );
	
	            return this;
	        };
	
	        this.whenReady = function( func ) {
	            if ( !supported ) {
	              return null;
	            }
	
	            var that = this;
	            if ( this.sound.readyState === 0 ) {
	                this.bind( 'canplay.buzzwhenready', function() {
	                    func.call( that );
	                });
	            } else {
	                func.call( that );
	            }
	        };
	
	        // privates
	        function timerangeToArray( timeRange ) {
	            var array = [],
	                length = timeRange.length - 1;
	
	            for( var i = 0; i <= length; i++ ) {
	                array.push({
	                    start: timeRange.start( length ),
	                    end: timeRange.end( length )
	                });
	            }
	            return array;
	        }
	
	        function getExt( filename ) {
	            return filename.split('.').pop();
	        }
	        
	        function addSource( sound, src ) {
	            var source = document.createElement( 'source' );
	            source.src = src;
	            if ( buzz.types[ getExt( src ) ] ) {
	                source.type = buzz.types[ getExt( src ) ];
	            }
        //hack
	            sound.appendChild && sound.appendChild( source );
	        }
	
	        // init
	        if ( supported && src ) {
	          
	            for(var i in buzz.defaults ) {
	              if(buzz.defaults.hasOwnProperty(i)) {
	                options[ i ] = options[ i ] || buzz.defaults[ i ];
	              }
	            }
	
	            this.sound = document.createElement( 'audio' );
	
	            if ( src instanceof Array ) {
	                for( var j in src ) {
	                  if(src.hasOwnProperty(j)) {
	                    addSource( this.sound, src[ j ] );
	                  }
	                }
	            } else if ( options.formats.length ) {
	                for( var k in options.formats ) {
	                  if(options.formats.hasOwnProperty(k)) {
	                    addSource( this.sound, src + '.' + options.formats[ k ] );
	                  }
	                }
	            } else {
	                addSource( this.sound, src );
	            }
	
	            if ( options.loop ) {
	                this.loop();
	            }
	
	            if ( options.autoplay ) {
	                this.sound.autoplay = 'autoplay';
	            }
	
	            if ( options.preload === true ) {
	                this.sound.preload = 'auto';
	            } else if ( options.preload === false ) {
	                this.sound.preload = 'none';
	            } else {
	                this.sound.preload = options.preload;
	            }
	
	            this.setVolume( options.volume );
	
	            buzz.sounds.push( this );
	        }
	    },
	
	    group: function( sounds ) {
	        sounds = argsToArray( sounds, arguments );
	
	        // publics
	        this.getSounds = function() {
	            return sounds;
	        };
	
	        this.add = function( soundArray ) {
	            soundArray = argsToArray( soundArray, arguments );
	            for( var a = 0; a < soundArray.length; a++ ) {
	                sounds.push( soundArray[ a ] );
	            }
	        };
	
	        this.remove = function( soundArray ) {
	            soundArray = argsToArray( soundArray, arguments );
	            for( var a = 0; a < soundArray.length; a++ ) {
	                for( var i = 0; i < sounds.length; i++ ) {
	                    if ( sounds[ i ] == soundArray[ a ] ) {
	                        delete sounds[ i ];
	                        break;
	                    }
	                }
	            }
	        };
	
	        this.load = function() {
	            fn( 'load' );
	            return this;
	        };
	
	        this.play = function() {
	            fn( 'play' );
	            return this;
	        };
	
	        this.togglePlay = function( ) {
	            fn( 'togglePlay' );
	            return this;
	        };
	
	        this.pause = function( time ) {
	            fn( 'pause', time );
	            return this;
	        };
	
	        this.stop = function() {
	            fn( 'stop' );
	            return this;
	        };
	
	        this.mute = function() {
	            fn( 'mute' );
	            return this;
	        };
	
	        this.unmute = function() {
	            fn( 'unmute' );
	            return this;
	        };
	
	        this.toggleMute = function() {
	            fn( 'toggleMute' );
	            return this;
	        };
	
	        this.setVolume = function( volume ) {
	            fn( 'setVolume', volume );
	            return this;
	        };
	
	        this.increaseVolume = function( value ) {
	            fn( 'increaseVolume', value );
	            return this;
	        };
	
	        this.decreaseVolume = function( value ) {
	            fn( 'decreaseVolume', value );
	            return this;
	        };
	
	        this.loop = function() {
	            fn( 'loop' );
	            return this;
	        };
	
	        this.unloop = function() {
	            fn( 'unloop' );
	            return this;
	        };
	
	        this.setTime = function( time ) {
	            fn( 'setTime', time );
	            return this;
	        };
	
	        this.setduration = function( duration ) {
	            fn( 'setduration', duration );
	            return this;
	        };
	
	        this.set = function( key, value ) {
	            fn( 'set', key, value );
	            return this;
	        };
	
	        this.bind = function( type, func ) {
	            fn( 'bind', type, func );
	            return this;
	        };
	
	        this.unbind = function( type ) {
	            fn( 'unbind', type );
	            return this;
	        };
	
	        this.bindOnce = function( type, func ) {
	            fn( 'bindOnce', type, func );
	            return this;
	        };
	
	        this.trigger = function( type ) {
	            fn( 'trigger', type );
	            return this;
	        };
	
	        this.fade = function( from, to, duration, callback ) {
	            fn( 'fade', from, to, duration, callback );
	            return this;
	        };
	
	        this.fadeIn = function( duration, callback ) {
	            fn( 'fadeIn', duration, callback );
	            return this;
	        };
	
	        this.fadeOut = function( duration, callback ) {
	            fn( 'fadeOut', duration, callback );
	            return this;
	        };
	
	        // privates
	        function fn() {
	            var args = argsToArray( null, arguments ),
	                func = args.shift();
	
	            for( var i = 0; i < sounds.length; i++ ) {
	                sounds[ i ][ func ].apply( sounds[ i ], args );
	            }
	        }
	
	        function argsToArray( array, args ) {
	            return ( array instanceof Array ) ? array : Array.prototype.slice.call( args );
	        }
	    },
	
	    all: function() {
	      return new buzz.group( buzz.sounds );
	    },
	
	    isSupported: function() {
	        return !!buzz.el.canPlayType;
	    },
	
	    isOGGSupported: function() {
	        return !!buzz.el.canPlayType && buzz.el.canPlayType( 'audio/ogg; codecs="vorbis"' );
	    },
	
	    isWAVSupported: function() {
	        return !!buzz.el.canPlayType && buzz.el.canPlayType( 'audio/wav; codecs="1"' );
	    },
	
	    isMP3Supported: function() {
	        return !!buzz.el.canPlayType && buzz.el.canPlayType( 'audio/mpeg;' );
	    },
	
	    isAACSupported: function() {
	        return !!buzz.el.canPlayType && ( buzz.el.canPlayType( 'audio/x-m4a;' ) || buzz.el.canPlayType( 'audio/aac;' ) );
	    },
	
	    toTimer: function( time, withHours ) {
	        var h, m, s;
	        h = Math.floor( time / 3600 );
	        h = isNaN( h ) ? '--' : ( h >= 10 ) ? h : '0' + h;
	        m = withHours ? Math.floor( time / 60 % 60 ) : Math.floor( time / 60 );
	        m = isNaN( m ) ? '--' : ( m >= 10 ) ? m : '0' + m;
	        s = Math.floor( time % 60 );
	        s = isNaN( s ) ? '--' : ( s >= 10 ) ? s : '0' + s;
	        return withHours ? h + ':' + m + ':' + s : m + ':' + s;
	    },
	
	    fromTimer: function( time ) {
	        var splits = time.toString().split( ':' );
	        if ( splits && splits.length == 3 ) {
	            time = ( parseInt( splits[ 0 ], 10 ) * 3600 ) + ( parseInt(splits[ 1 ], 10 ) * 60 ) + parseInt( splits[ 2 ], 10 );
	        }
	        if ( splits && splits.length == 2 ) {
	            time = ( parseInt( splits[ 0 ], 10 ) * 60 ) + parseInt( splits[ 1 ], 10 );
	        }
	        return time;
	    },
	
	    toPercent: function( value, total, decimal ) {
			var r = Math.pow( 10, decimal || 0 );
	
			return Math.round( ( ( value * 100 ) / total ) * r ) / r;
	    },
	
	    fromPercent: function( percent, total, decimal ) {
			var r = Math.pow( 10, decimal || 0 );
	
	        return  Math.round( ( ( total / 100 ) * percent ) * r ) / r;
	    }
	};
	
	exports = buzz;;

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
	    
	    wheels = this.addElement( {
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
	
	var Component = require("scripts/component");
	var message = require("scripts/message");
	
	var life = 300;
	var strokeWidth = 10;
	
	var lastPoint;
	
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
	    var line, el, n;
	
	    if( lastPoint ){
	      line = [ lastPoint, [ x, y ] ];
	
	      el = this.addElement( {
	        type: "path",
	        points: line,
	        strokeWidth: strokeWidth,
	        strokeColor: "#00ffff",
	        zIndex: 100
	      } );
	
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
	          this.removeElement( el );
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
	var tools = require("scripts/game/tools");
	var Sound = require("scripts/game/sound");
	var tween = require("scripts/lib/tween");
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
	} );;

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
	
	exports.check = function( elements, line ){
		var result = [];
	
		elements.forEach( function( element ){
	
			if( element.isStripped )
			  return ;
	
			var ck = lineInEllipse(
				line[ 0 ],
				line[ 1 ],
				element.getOrigin(),
				element.radius
			);
	
			if( ck ){
				result.push( element );
			}
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
 * @source /Users/Dron/hosting/post-ninja/output/scripts/interaction.js
 */ 
define("scripts/interaction.js", function(exports,module){
	/**
	 * 交互控制器
	 */
	
	var message = require("scripts/message");
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
	
	  el.addEventListener( touchStart, function( event ){
	    if( isTouch )
	      event = event.touches[ 0 ] || event;
	    event = eventFormater( event );
	    inSweeping = true;
	    pointX = event.clientX;
	    pointY = event.clientY;
	    message.postMessage( "touch-start", pointX, pointY );
	    message.postMessage( "touch-spot", pointX, pointY );
	  }, false );
	
	  el.addEventListener( touchMove, function( event ){
	    var x, y;
	    
	    if( !inSweeping )
	      return ;
	
	    if( isTouch )
	      event = event.touches[ 0 ] || event;
	
	    event = eventFormater( event );
	
	    x = event.clientX;
	    y = event.clientY;
	
	    if( distance( x, y, pointX, pointY ) > 6 ){
	      pointX = x;
	      pointY = y;
	      message.postMessage( "touch-spot", x, y );
	    }
	
	  }, false );
	
	  el.addEventListener( touchEnd, function( event ){
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
 * @source /Users/Dron/hosting/post-ninja/output/scripts/device.js
 */ 
define("scripts/device.js", function(exports,module){
	/**
	 * fullscreen
	 */
	
	var Interaction = require("scripts/interaction");
	
	var screenWidth = screen.width, screenHeight = screen.height;
	
	if( screenWidth > screenHeight )
	  screenWidth = [ screenHeight, screenHeight = screenWidth ][ 0 ];
	
	exports.ge
	
	// 以横屏分准的屏幕宽
	exports.getScreenSize = function(){
	  return {
	    width: screenWidth,
	    height: screenHeight
	  }  
	};
	
	exports.lockLandscape = function( canvas ){
	  var de, rotate, defaultEventFormater, rotateEventFormater;
	
	  de = document.documentElement;
	  defaultEventFormater = Interaction.getEventFormater();
	
	  rotateEventFormater = function( event ){
	    return {
	      clientX: event.clientY,
	      clientY: screenWidth - event.clientX
	    }
	  };
	
	  var doRotate = function(){
	    canvas.style.left = - ( screenHeight - screenWidth ) / 2 + "px";
	    canvas.style.top = ( screenHeight - screenWidth ) / 2 + "px";
	    canvas.style[ "-webkit-transform" ] = "rotate(90deg)";
	    Interaction.setEventFormater( rotateEventFormater );
	  };
	
	  var restore = function(){
	    canvas.style.left =
	    canvas.style.top = 0;
	    canvas.style[ "-webkit-transform" ] = "none";
	    Interaction.setEventFormater( defaultEventFormater );
	  };
	
	  window.addEventListener( "orientationchange", function( f ){
	    return ( f = function(){
	      if( de.clientWidth < de.clientHeight )
	        doRotate();  
	      else
	        restore();
	    } )(), f;
	  }() );
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
	
	var state = require("scripts/state");
	var CEC = require("scripts/lib/cec-all");
	var Stage = require("scripts/adapter/stage/index");
	var Game = require("scripts/game/main");
	var renderTimeline = require("scripts/timeline").use( "canvas-render" ).init( 16 );
	var Interaction = require("scripts/interaction");
	var Component = require("scripts/component");
	var promise = require("scripts/lib/promise");
	// var device = require("scripts/device");
	
	// TODO: 写一个添加到主屏相关的判断
	
	exports.preloadResources = function(){
	  var resources, pm = new promise;
	  
	  resources = [
	      "images/box-h-normal.png",
	      "images/box-v-normal.png",
	      
	      "images/box-h-strip.png",
	      "images/box-v-strip.png",
	      
	      "images/box-h-open.png",
	      "images/box-v-open.png",
	
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
	  var de, canvas, canvasWidth, canvasHeight, stage, screenSize;
	
	  de = document.documentElement;
	  canvas = document.getElementById( "canvas" );
	
	  // FullScreen.lockLandscape( canvas );
	  // screenSize = device.getScreenSize();
	
    //hack
	  state( "canvas" ).set( {
	    width: canvas.width = window.innerWidth || de.clientWidth,
	    height: canvas.height = window.innerHeight || de.clientHeight
	  } );
	
	  // window.addEventListener( "orientationchange", function( f ){
	  //   return ( f = function(){
	  //     canvas.style.width = screenSize.height + "px";
	  //     canvas.style.height = screenSize.width + "px";
	  //   } )(), f;
	  // }() );
	
	  CEC.ready( function(){
	    stage = Stage.create( { canvas: "canvas" } );
	    renderTimeline.createTask( { duration: -1, object: stage, onTimeUpdate: stage.render } );
	
	    Component.init( { stage: stage } );
	    Interaction.init( { canvas: canvas } );
	
	    // Game.init();
	    this.preloadResources().then( Game.init.bind( Game ) );
	  }.bind( this ) );
	
	  // TODO: 如果在网页环境
	  document.addEventListener( "touchmove", function( event ){
	    event.preventDefault();
	  } );
	};;

	return exports;
});


startModule("scripts/main");