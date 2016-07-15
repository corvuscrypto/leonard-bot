function Message(attrs){
  if (attrs.room) this.room = attrs.room;
  this.from = attrs.from;
  this.timestamp = attrs.timestamp || Date.now();
  this.body = attrs.body
}

Message.fromStanza = function(stanza) {
  message = new Message();
  if(stanza.getAttr("type")==="groupchat"){//room message
    message.room = stanza.getAttr("from_jid");
    message.from = message.room.split("/")[1];
  } else {//1-1 chat
    message.from = stanza.getAttr("from");
  }
  //the timestamp is not in a valid format for JS date. Format and parse it
  var ts = parseInt(stanza.getAttr("ts")*1000);
  message.timestamp = new Date(ts);

  message.body = stanza.getChildText("body");
  return message;
}
