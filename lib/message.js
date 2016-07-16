/**
 * Message is the object to be used in marshaling message data when utilizing Leonard
 * @param attrs:
 *     to: JID of the user this message will mention
 *     room: JID of the room if groupchat
 *     from: full JID of the source of the message
 *     timestamp: when the message is send (leave blank for now time)
 *     body: the actual text of the message
 */
function Message(attrs){
  attrs = attrs || {}
  this.to = attrs.to;
  if (attrs.room) this.room = attrs.room;
  this.sender = attrs.from;
  this.timestamp = attrs.timestamp || Date.now();
  this.body = attrs.body;
}

Message.fromStanza = function(stanza) {
  message = new Message();
  if(stanza.getAttr("type")==="groupchat"){//room message
    message.room = stanza.getAttr("from")||"";
  }
  message.sender = stanza.getAttr("from_jid");
  //the timestamp is not in a valid format for JS date. Format and parse it
  var ts = parseInt(stanza.getAttr("ts")*1000);
  message.timestamp = new Date(ts);

  message.body = stanza.getChildText("body");
  return message;
}

Message.prototype.newResponse = function(message){
  var ret = new Message();
  ret.room = this.room;
  ret.body = message;
  return ret;
}

Message.prototype.newReply = function(message){
  var ret = new Message();
  ret.room = this.room;
  ret.to = this.sender;
  ret.body = message;
  return ret;
}

module.exports = Message;
