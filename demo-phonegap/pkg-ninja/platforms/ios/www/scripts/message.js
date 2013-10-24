/**
 * a simple message manager
 * @author dron
 * @date 2012-06-27
 */

var Ucren = require( "./lib/ucren" ), array = [];

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
};