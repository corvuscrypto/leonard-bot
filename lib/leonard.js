'use strict';

var xmppClient = require('node-xmpp-client');
var Stanza = xmppClient.Stanza;

/**
 * Leonard is the hipchat bot. Instantiate him with a JSON object
 * containing his jabber id and password at minimum.
 *
 * @param object
 *        jid: required - jabber id
 *        password: required - jabber password
 *        apiTokenV2: optional - hipchat api v2 token
 *        host - optional - the hipchat server host (default: chat.hipchat.com)
 *        port - optional - the hipchat server port (default: 5222)
 */
function Leonard(options){
  this.options = options||{};
  options.fullJid = this.options.jid+"/bot";

  var requiredOptions = ['jid','password'];
  for (var i in requiredOptions){
    var key = requiredOptions[i];
    if (!options[key]){
      throw new Error("Missing required option: " + key);
    }
  }

  //setup the options for the xmpp client
  var clientOptions = {
    jid: options.fullJid,
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
 * this initializes the client and makes the required calls to get the profile information as well as the info
 * required to join rooms.
 */
Leonard.prototype._init = function(){
  var self = this;

  //set the online handler
  this.client.on("online", function(){

    //set to available
    self.client.send(new Stanza("presence", {
      type: 'available'
    }).c("show").t("chat"));

    //set an interval of 60 seconds to send a packet with just " " as the content as per
    //hipchat guidelines
    setInterval(function(){
      var timeout = self.options.timeoutInterval || 60000;
      self.client.connection.socket.write(" ");
    }, 60*1000);

    self._startup();
  });

  this.client.on("error", function(s){
    //print out all client errors
    console.log(s.toString());
  })

  this.client.on("stanza", function(stanza){
    if (stanza.is("iq") && stanza.attrs.type === "result"){
      self._handleIQResult(stanza);
    } else if (stanza.attrs.type == "error"){
      //just print out the stanza
      console.log(stanza.toString())
    }
  })
};

/**
 * This function sends a discovery for the bot's own profile so we get the reserved nickname for the bot's jabber
 * account
 */
Leonard.prototype._startup = function(){
  var s = new Stanza("iq", {
    type: 'get',
    id: 'startup',
  }).c('query', {xmlns: "http://hipchat.com/protocol/startup", send_auto_join_user_presences: 'false'})
  this.client.send(s);
}

//sends a roomlist request to the server. Just to keep things organized, call this after startup
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

/**
 * This is the handle switch for the IQ results received from the server. At some point I'll move to using some kind of
 * callback handler
 */
Leonard.prototype._handleIQResult = function(stanza){
  //we switch based on id which we set for various IQ requests
  switch(stanza.attrs.id){
    case "rooms": // handle the roomlist
      //reset this.roomList
      this.roomList = {}
      //in this case, the second level children are the items. We want these
      //we will manually traverse to save some cpu :P
      for(var room of stanza.getChild("query").getChildren("item")){
        this.roomList[room.getAttr("jid")] = {
          name: room.getAttr("name"),
          id: room.getChild("x").getChildText("id")
        }
      }
      //now do the room joins
      this._joinRooms();
      break;
    case 'startup': // handle the startup response
      var profileChildren = stanza.getChild("query");
      this.options.nick = profileChildren.getChildText("name");
      this.options.mentionName = profileChildren.getChildText("mention_name");
      this._getRooms();
  }
}

/**
 * this function iterates either the provided autojoin room list, or the whole discovered room list, joining each room
 * provided.
 */
Leonard.prototype._joinRooms = function(){
  //setup the stanza template
  var s = new Stanza("presence",{
    xmlns: 'http://jabber.org/protocol/muc',
    from: this.options.fullJid
  }).c("x", {xmlns: 'http://jabber.org/protocol/muc'});

  //the rooms to join are either specified or default to all
  var rooms = this.options.joinRooms||Object.keys(this.roomList);
  //join all rooms
  for(var roomId of rooms){
    s.tree().attrs.to = roomId+"/"+this.options.nick;
    this.client.send(s);
  }
}

module.exports = Leonard;
