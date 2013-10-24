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
    window.Ucren = Ucren;