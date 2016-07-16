/**
 * Here we make a pretty simple plugin registry :P
 */

var _plugins = {}

function Plugin(name){
  this.name = name;
  //register the plugin
  _plugins[name] = this;
  this.messageHandlers = [];
  this.mentionHandlers = [];
}

/**
 * onMessage registers a general listener. The regex must compile to proper regex. The
 * callback must take the form function(bot, message, [params]) where bot is the bot instance
 * (to allow access to sending a message) and message is an instance of Message (see './message.js'),
 * and params is an object of matches to regex captures if any are present.
 */
Plugin.prototype.onMessage = function(regex, callback){
  this.messageHandlers.push({re: new RegExp(regex), plugin: this.name, cb: callback});
}

/**
* onMention registers a general listener. The regex must compile to proper regex. The
* callback must take the form function(bot, message, [params]) where bot is the bot instance
* (to allow access to sending a message) and message is an instance of Message (see './message.js'),
* and params is an object of matches to regex captures if any are present.
*/
Plugin.prototype.onMention = function(regex, callback){
  this.mentionHandlers.push({re: new RegExp(regex), plugin: this.name, cb: callback});
}

module.exports = Plugin;
module.exports._plugins = _plugins;
