'use strict';

var xmppClient = require('node-xmpp-client');
var Stanza = xmppClient.Stanza;

/**
 * Leonard is the hipchat bot. Instantiate him with a JSON object
 * containing his jabber id and password.
 *
 * @param object
 *        jid: required - jabber id
 *        password: required - jabber password
 *        apiTokenV2: required - hipchat api v2 token
 *        host - optional - the hipchat server host (default: chat.hipchat.com)
 *        port - optional - the hipchat server port (default: 5222)
 */
function Leonard(options){
  this.options = options||{};

  var requiredOptions = ['jid','password'];
  for (var i in requiredOptions){
    var key = requiredOptions[i];
    if (!options[key]){
      throw new Error("Missing required option: " + key);
    }
  }

  //setup the options for the xmpp client
  var clientOptions = {
    jid: options.jid,
    password: options.password,
  };

  if (!options.host){
    options.host = options.jid.split("@")[1];
  }

  clientOptions.host = options.host;

  if (options.port){
    clientOptions.port = options.port;
  }

  //instantiate an XMPP client
  this.client = new xmppClient(clientOptions);

  //initialize Leonard
  this._init();
}

/**
 * TODO
 */
Leonard.prototype._init = function(){
  var self = this;

  //set the online handler
  this.client.on("online", function(){
    //set an interval of 60 seconds to send a packet with just " " as the content as per
    //hipchat guidelines
    setInterval(function(){
      var timeout = self.options.timeoutInterval || 60000;
      self.client.connection.socket.write(" ");
    }, 60*1000);

    self._getRooms();
  });

  this.client.on("error", function(s){

  })

  this.client.on("stanza", function(stanza){
    if (stanza.is("iq") && stanza.attrs.type === "result"){
      //TODO write query result handler
    }
  })
};

Leonard.prototype._getRooms = function(){
  //use the room discovery protocol as per hipchat's docs
  var s = new Stanza("iq", {
    to:"conf.hipchat.com",
    'type': 'get'
  }).c("query", {
    xmlns:"http://jabber.org/protocol/disco#items"
  })

  this.client.send(s);
};

module.exports = Leonard;
