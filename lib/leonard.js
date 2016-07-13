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
    jid: options.jid+"/bot",
    password: options.password,
  };

  if (!options.host){
    options.host = options.jid.split("@")[1];
  }

  clientOptions.host = options.host;
  clientOptions.port = options.port||5222;


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
      self._handleIQResult(stanza);
    } else {
      //todo
    }
  })
};

Leonard.prototype._getRooms = function(){
  //use the room discovery protocol as per hipchat's docs
  var s = new Stanza("iq", {
    to:   'conf.hipchat.com',
    id:   'rooms',
    type: 'get'
  }).c("query", {
    xmlns:"http://jabber.org/protocol/disco#items",
    include_archived: false
  })

  this.client.send(s);
};

Leonard.prototype._handleIQResult = function(stanza){
  //we switch based on id which we set for various IQ requests
  switch(stanza.attrs.id){
    case "rooms": // handle the roomlist
      //reset this.roomList
      this.roomList = {}
      //in this case, the second level children are the items. We want these
      for(var room of stanza.children[0].children){
        this.roomList[room.attrs.jid] = {
          name: room.attrs.name,
          id: room.children[0].children[0].children[0]
        }
        this.client.send(new Stanza("iq",{
          type: "get",
          to: room.attrs.jid,
          from: this.options.jid,
          id: "getnick"
        }).c("query", {
          xmlns: 'http://jabber.org/protocol/disco#info',
          node: 'x-roomuser-item'
        }))
      }
      //now do the room joins
      this._joinRooms();
  }
}

Leonard.prototype._joinRooms = function(){
  //send availability presence
  this.client.send(new Stanza('presence',{
    from: this.options.jid+"/bot"
  }))

  //setup the stanza template
  var s = new Stanza("presence", {
    id: "joinroom",
    from: this.options.jid+"/bot"
  }).c("x", {
    xmlns: 'http://jabber.org/protocol/muc'
  });
  //the rooms to join are either specified or default to all
  var rooms = this.options.joinRooms||Object.keys(this.roomList);
  //join all rooms
  for(var roomId of rooms){
    s.to = roomId;
    this.client.send(s)
  }
}

module.exports = Leonard;
