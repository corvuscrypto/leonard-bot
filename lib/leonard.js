var xmppClient = require('node-xmpp-client')

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

    if (options.host){
      clientOptions.host = options.host;
    }
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
        var timeout = this.options.timeoutInterval || 60000;
        self.client.connection.socket.write(" ");
      }, 60*1000);
    });

    this.client.on("error", function(s){
      console.log(s);
    })

    this.client.on("stanza", function(s){
      console.log(s)
    })
  }

module.exports = Leonard;
