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

Plugin.prototype.onMessage = function(regex, callback){
  this.messageHandlers.push({re: regex, plugin: this.name, cb: callback});
}

Plugin.prototype.onMention = function(regex, callback){
  this.mentionHandlers.push({re: regex, plugin: this.name, cb: callback});
}

module.exports = Plugin;
module.exports._plugins = _plugins;
