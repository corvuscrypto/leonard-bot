use strict;

var xmppClient = require('node-xmpp-client')

module.exports.Leonard = (function(){
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
    options = options||{};

    var requiredOptions = ['jid','password'];
    for (var i in requiredOptions){
      var key = requiredOptions[i];
      if (!options[key]){
        throw new Error("Missing required option: " + key);
      }
    }

    //First we gather the information about the jabber account
    this.jid = options.jabber_id;
    this.password = options.jabber_password;

    //setup the options for the xmpp client
    var clientOptions = {
      jid: this.jid,
      password: this.password
    };

    if (options.host){
      clientOptions.host = options.host;
    }
    if (options.port){
      clientOptions.port = options.port;
    }

    //instantiate an XMPP client
    this.client = xmppClient(clientOptions)

    //initialize Leonard
    this._init();
  }

  /**
   * TODO
   */
  Leonard.prototype._init = function(){
  }

  return Leonard;
}());
