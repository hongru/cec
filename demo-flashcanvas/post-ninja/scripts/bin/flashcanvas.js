if(window["ActiveXObject"]&&!window["CanvasRenderingContext2D"]){(function(e,i,t){var n=null;var a="canvas";var r="CanvasRenderingContext2D";var s="CanvasGradient";var o="CanvasPattern";var c="FlashCanvas";var l="G_vmlCanvasManager";var d="external";var u="onfocus";var h="onpropertychange";var m="onreadystatechange";var A="onunload";var f=e[c+"Options"]||{};var g=f["swfPath"]||Q().replace(/[^\/]+$/,"");var v=g+"flashcanvas.swf";var p=1;var k=9;var b=11;var w=12;var y=17;var _=18;function x(e){for(var i=0,t=e.length;i<t;i++)this[e[i]]=i}var B=new x(["toDataURL","save","restore","scale","rotate","translate","transform","setTransform","globalAlpha","globalCompositeOperation","strokeStyle","fillStyle","createLinearGradient","createRadialGradient","createPattern","lineWidth","lineCap","lineJoin","miterLimit","shadowOffsetX","shadowOffsetY","shadowBlur","shadowColor","clearRect","fillRect","strokeRect","beginPath","closePath","moveTo","lineTo","quadraticCurveTo","bezierCurveTo","arcTo","rect","arc","fill","stroke","clip","isPointInPath","font","textAlign","textBaseline","fillText","strokeText","measureText","drawImage","createImageData","getImageData","putImageData","addColorStop","direction","resize"]);var C={};var S={};var I={};var D={};var T={};var M={};var E=function(e,i){this.canvas=e;this._swf=i;this._canvasId=i.id.slice(8);var t=this._canvasId;this._initialize();this._gradientPatternId=0;this._direction="";this._font="";var n=this;setInterval(function(){if(C[t]){n._executeCommand()}},24)};E.prototype={save:function(){this._setCompositing();this._setFillStyle();this._stateStack.push([this._globalAlpha,this._globalCompositeOperation,this._strokeStyle,this._fillStyle,this._lineWidth,this._lineCap,this._lineJoin,this._miterLimit,this._shadowOffsetX,this._shadowOffsetY,this._shadowBlur,this._shadowColor,this._font,this._textAlign,this._textBaseline]);this._queue.push(B.save)},restore:function(){var e=this._stateStack;if(e.length){var i=e.pop();this.globalAlpha=i[0];this.globalCompositeOperation=i[1];this.strokeStyle=i[2];this.fillStyle=i[3];this.lineWidth=i[4];this.lineCap=i[5];this.lineJoin=i[6];this.miterLimit=i[7];this.shadowOffsetX=i[8];this.shadowOffsetY=i[9];this.shadowBlur=i[10];this.shadowColor=i[11];this.font=i[12];this.textAlign=i[13];this.textBaseline=i[14]}this._queue.push(B.restore)},scale:function(e,i){this._queue.push(B.scale,e,i)},rotate:function(e){this._queue.push(B.rotate,e)},translate:function(e,i){this._queue.push(B.translate,e,i)},transform:function(e,i,t,n,a,r){this._queue.push(B.transform,e,i,t,n,a,r)},setTransform:function(e,i,t,n,a,r){this._queue.push(B.setTransform,e,i,t,n,a,r)},_setCompositing:function(){var e=this._queue;if(this._globalAlpha!==this.globalAlpha){this._globalAlpha=this.globalAlpha;e.push(B.globalAlpha,this._globalAlpha)}},_setStrokeStyle:function(){if(this._strokeStyle!==this.strokeStyle){var e=this._strokeStyle=this.strokeStyle;if(typeof e==="string"){}else if(e instanceof R||e instanceof j){e=e.id}else{return}this._queue.push(B.strokeStyle,e)}},_setFillStyle:function(){if(this._fillStyle!==this.fillStyle){var e=this._fillStyle=this.fillStyle;if(typeof e==="string"){}else if(e instanceof R||e instanceof j){e=e.id}else{return}this._queue.push(B.fillStyle,e)}},createLinearGradient:function(e,i,t,n){if(!(isFinite(e)&&isFinite(i)&&isFinite(t)&&isFinite(n))){W(k)}this._queue.push(B.createLinearGradient,e,i,t,n);return new R(this)},createRadialGradient:function(e,i,t,n,a,r){if(!(isFinite(e)&&isFinite(i)&&isFinite(t)&&isFinite(n)&&isFinite(a)&&isFinite(r))){W(k)}if(t<0||r<0){W(p)}this._queue.push(B.createRadialGradient,e,i,t,n,a,r);return new R(this)},createPattern:function(e,i){if(!e){W(y)}var t=e.tagName,r;var s=this._canvasId;if(t){t=t.toLowerCase();if(t==="img"){r=e.getAttribute("src",2)}else if(t===a||t==="video"){return}else{W(y)}}else if(e.src){r=e.src}else{W(y)}if(!(i==="repeat"||i==="no-repeat"||i==="repeat-x"||i==="repeat-y"||i===""||i===n)){W(w)}this._queue.push(B.createPattern,G(r),i);if(!S[s][r]&&C[s]){this._executeCommand();++I[s];S[s][r]=true}return new j(this)},_setLineStyles:function(){var e=this._queue;if(this._lineWidth!==this.lineWidth){this._lineWidth=this.lineWidth;e.push(B.lineWidth,this._lineWidth)}if(this._lineCap!==this.lineCap){this._lineCap=this.lineCap;e.push(B.lineCap,this._lineCap)}if(this._lineJoin!==this.lineJoin){this._lineJoin=this.lineJoin;e.push(B.lineJoin,this._lineJoin)}if(this._miterLimit!==this.miterLimit){this._miterLimit=this.miterLimit;e.push(B.miterLimit,this._miterLimit)}},_setShadows:function(){},clearRect:function(e,i,t,n){this._queue.push(B.clearRect,e,i,t,n)},fillRect:function(e,i,t,n){this._setCompositing();this._setFillStyle();this._queue.push(B.fillRect,e,i,t,n)},strokeRect:function(e,i,t,n){this._setCompositing();this._queue.push(B.strokeRect,e,i,t,n)},beginPath:function(){this._queue.push(B.beginPath)},closePath:function(){this._queue.push(B.closePath)},moveTo:function(e,i){this._queue.push(B.moveTo,e,i)},lineTo:function(e,i){this._queue.push(B.lineTo,e,i)},quadraticCurveTo:function(e,i,t,n){this._queue.push(B.quadraticCurveTo,e,i,t,n)},bezierCurveTo:function(e,i,t,n,a,r){this._queue.push(B.bezierCurveTo,e,i,t,n,a,r)},arcTo:function(e,i,t,n,a){if(a<0&&isFinite(a)){W(p)}this._queue.push(B.arcTo,e,i,t,n,a)},rect:function(e,i,t,n){this._queue.push(B.rect,e,i,t,n)},arc:function(e,i,t,n,a,r){if(t<0&&isFinite(t)){W(p)}this._queue.push(B.arc,e,i,t,n,a,r?1:0)},fill:function(){this._setCompositing();this._setFillStyle();this._queue.push(B.fill)},stroke:function(){this._setCompositing();this._queue.push(B.stroke)},clip:function(){this._queue.push(B.clip)},isPointInPath:function(e,i){},_setFontStyles:function(){var e=this._queue;if(this._font!==this.font){try{var i=M[this._canvasId];i.style.font=this._font=this.font;var t=i.currentStyle;var n=i.offsetHeight;var a=[t.fontStyle,t.fontWeight,n,t.fontFamily].join(" ");e.push(B.font,a)}catch(r){}}if(this._textAlign!==this.textAlign){this._textAlign=this.textAlign;e.push(B.textAlign,this._textAlign)}if(this._textBaseline!==this.textBaseline){this._textBaseline=this.textBaseline;e.push(B.textBaseline,this._textBaseline)}if(this._direction!==this.canvas.currentStyle.direction){this._direction=this.canvas.currentStyle.direction;e.push(B.direction,this._direction)}},fillText:function(e,i,n,a){this._setCompositing();this._setFillStyle();this._queue.push(B.fillText,G(e),i,n,a===t?Infinity:a)},strokeText:function(e,i,n,a){this._setCompositing();this._queue.push(B.strokeText,G(e),i,n,a===t?Infinity:a)},measureText:function(e){var i=M[this._canvasId];try{i.style.font=this.font}catch(t){}i.innerText=(""+e).replace(/[ \n\f\r]/g,"	");return new N(i.offsetWidth)},drawImage:function(e,i,t,n,a,r,s,o,c){if(!e){return;W(y)}var l=e.tagName,d,u=arguments.length;var h=this._canvasId;if(e.src){d=e.src}else{W(y)}this._setCompositing();d=G(d);if(u===3){this._queue.push(B.drawImage,u,d,i,t)}else if(u===5){this._queue.push(B.drawImage,u,d,i,t,n,a)}else if(u===9){if(n===0||a===0){W(p)}this._queue.push(B.drawImage,u,d,i,t,n,a,r,s,o,c)}else{return}if(!S[h][d]&&C[h]){this._executeCommand();++I[h];S[h][d]=true}},createImageData:function(){},getImageData:function(e,i,t,n){},putImageData:function(e,i,t,n,a,r,s){},loadImage:function(e,i,t){var n=e.tagName,a;var r=this._canvasId;if(n){if(n.toLowerCase()==="img"){a=e.getAttribute("src",2)}}else if(e.src){a=e.src}if(!a||S[r][a]){return}if(i||t){D[r][a]=[e,i,t]}this._queue.push(B.drawImage,1,G(a));if(C[r]){this._executeCommand();++I[r];S[r][a]=true}},_initialize:function(){this.globalAlpha=this._globalAlpha=1;this.globalCompositeOperation=this._globalCompositeOperation="source-over";this.strokeStyle=this._strokeStyle="#000000";this.fillStyle=this._fillStyle="#000000";this.lineWidth=this._lineWidth=1;this.lineCap=this._lineCap="butt";this.lineJoin=this._lineJoin="miter";this.miterLimit=this._miterLimit=10;this.shadowOffsetX=this._shadowOffsetX=0;this.shadowOffsetY=this._shadowOffsetY=0;this.shadowBlur=this._shadowBlur=0;this.shadowColor=this._shadowColor="rgba(0, 0, 0, 0.0)";this.font=this._font="10px sans-serif";this.textAlign=this._textAlign="start";this.textBaseline=this._textBaseline="alphabetic";this._queue=[];this._stateStack=[]},_flush:function(){var e=this._queue;this._queue=[];return e},_executeCommand:function(){var e=this._flush();if(e.length>0){this._swf.CallFunction('<invoke name="executeCommand" returntype="javascript"><arguments><string>'+e.join("&#0;")+"</string></arguments></invoke>")}},_resize:function(e,i){this._executeCommand();this._initialize();if(e>0){this._swf.width=e}if(i>0){this._swf.height=i}this._queue.push(B.resize,e,i)}};var R=function(e){this._ctx=e;this.id=e._gradientPatternId++};R.prototype={addColorStop:function(e,i){if(isNaN(e)||e<0||e>1){W(p)}this._ctx._queue.push(B.addColorStop,this.id,e,i)}};var j=function(e){this.id=e._gradientPatternId++};var N=function(e){this.width=e};var P=function(e){this.code=e;this.message=O[e]};P.prototype=new Error;var O={1:"INDEX_SIZE_ERR",9:"NOT_SUPPORTED_ERR",11:"INVALID_STATE_ERR",12:"SYNTAX_ERR",17:"TYPE_MISMATCH_ERR",18:"SECURITY_ERR"};function Y(){if(i.readyState==="complete"){i.detachEvent(m,Y);var e=i.getElementsByTagName(a);for(var t=0,n=e.length;t<n;++t){L.initElement(e[t])}}}function F(){var e=event.srcElement,i=e.parentNode;e.blur();i.focus()}function H(){var e=event.propertyName;if(e==="width"||e==="height"){var i=event.srcElement;var t=i[e];var n=parseInt(t,10);if(isNaN(n)||n<0){n=e==="width"?300:150}if(t===n){i.style[e]=n+"px";i.getContext("2d")._resize(i.width,i.height)}else{i[e]=n}}}function q(){e.detachEvent(A,q);for(var i in T){var t=T[i],a=t.firstChild,d;for(d in a){if(typeof a[d]==="function"){a[d]=n}}for(d in t){if(typeof t[d]==="function"){t[d]=n}}a.detachEvent(u,F);t.detachEvent(h,H)}e[r]=n;e[s]=n;e[o]=n;e[c]=n;e[l]=n}var L={initElement:function(t){if(t.getContext){return t}var a=K();var r=d+a;C[a]=false;S[a]={};I[a]=1;D[a]={};V(t);t.innerHTML='<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"'+' codebase="'+location.protocol+'//fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0"'+' width="100%" height="100%" id="'+r+'">'+'<param name="allowScriptAccess" value="always">'+'<param name="flashvars" value="id='+r+'">'+'<param name="wmode" value="transparent">'+"</object>"+'<span style="margin:0;padding:0;border:0;display:inline-block;position:static;height:1em;overflow:visible;white-space:nowrap">'+"</span>";T[a]=t;var s=t.firstChild;M[a]=t.lastChild;var o=i.body.contains;if(o(t)){s["movie"]=v}else{var c=setInterval(function(){if(o(t)){clearInterval(c);s["movie"]=v}},0)}if(i.compatMode==="BackCompat"||!e.XMLHttpRequest){M[a].style.overflow="hidden"}var l=new E(t,s);t.getContext=function(e){return e==="2d"?l:n};t.toDataURL=function(e,i){if((""+e).replace(/[A-Z]+/g,z)==="image/jpeg"){l._queue.push(B.toDataURL,e,typeof i==="number"?i:"")}else{l._queue.push(B.toDataURL,e)}return l._executeCommand()};s.attachEvent(u,F);return t},saveImage:function(e,i){var t=e.firstChild;t.saveImage(i)},setOptions:function(e){},trigger:function(e,i){var t=T[e];t.fireEvent("on"+i)},unlock:function(e,i,n,a,r){var s,o,n,a;var c,l,d;if(I[e]){--I[e]}if(i===t){s=T[e];o=s.firstChild;V(s);n=s.width;a=s.height;s.style.width=n+"px";s.style.height=a+"px";if(n>0){o.width=n}if(a>0){o.height=a}o.resize(n,a);s.attachEvent(h,H);C[e]=true;if(typeof s.onload==="function"){setTimeout(function(){s.onload()},0)}}else if(c=D[e][i]){l=c[0];d=c[1+r];delete D[e][i];if(typeof d==="function"){d.call({src:i,width:n,height:a})}}}};e.unlock=L.unlock;function Q(){var e=i.getElementsByTagName("script");var t=e[e.length-1];if(i.documentMode>=8){return t.src}else{return t.getAttribute("src",4)}}function K(){return Math.random().toString(36).slice(2)||"0"}function G(e){return(""+e).replace(/&/g,"&amp;").replace(/</g,"&lt;")}function z(e){return e.toLowerCase()}function W(e){throw new P(e)}function V(e){var i=parseInt(e.width,10);var t=parseInt(e.height,10);if(isNaN(i)||i<0){i=300}if(isNaN(t)||t<0){t=150}e.width=i;e.height=t}i.createElement(a);i.createStyleSheet().cssText=a+"{display:inline-block;overflow:hidden;width:300px;height:150px}";if(i.readyState==="complete"){Y()}else{i.attachEvent(m,Y)}e.attachEvent(A,q);if(v.indexOf(location.protocol+"//"+location.host+"/")===0){var U=new ActiveXObject("Microsoft.XMLHTTP");U.open("GET",v,false);U.send(n)}e[r]=E;e[s]=R;e[o]=j;e[c]=L;e[l]={init:function(){},init_:function(){},initElement:L.initElement};keep=[E.measureText,E.loadImage]})(window,document)}