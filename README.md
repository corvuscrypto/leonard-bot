# Leonard

Leonard is a chat bot for hipchat with no flare. I have thus deemed him a depressing bot because he doesn't give you fancy html, just plain old messages in XMPP's text format.

A bit of background for Leonard: One day, when the clouds were super grey and things were quite droll around the office, we had our chat bot based on another popular lib stop responding. Naturally we were saddened at the lack of life from our little buddy!

When we investigated the core cause, it turned out that internally, the library was using the REST API for HipChat for sending all of its messages to elicit a pretty notification card. Furthermore, it turned out that initialization was near impossible because the amount of rooms we had caused him to reach the API limit before he could even get up and running.

Then after much groveling over the sad loss of our friend, it was decided that no more will we bring a bot into the world (our servers) that could not live long and prosper!
`ENTER LEONARD`
While Leonard might not have all the flare of xhtml, he certainly can bolt messages across the internet! His messages, however, are still drab and remind us of our long lost friend of the good old days (07/08/2016), and so I give you Leonard: The bot with a depressing tone, but a helpful spirit!

# Table of Contents

TODO

# Bringing Leonard to life

To bring Leonard to life, you only need to import this library and initialize a Leonard object with a JSON Object containing your jabber ID (jid) and password. Example:

```javascript
var Leonard = require("leonard-bot");

var bot = new Leonard({
  jid:'example_jid@chat.hipchat.com',
  password: 'password',
});
```

Leonard will automatically gather information about current rooms and users that are present on the chat. You will see the following console output during normal initialization:

```
Loading plugins...
Loading options...
Negotiating session...
Starting Leonard...
Getting room list...
Joining rooms...
Done! :)
```

After startup, Leonard will now be listening intently to your conversations.

# Plugins

Leonard can use plugins which are registered upon instantiation of the leonard-bot `Plugin` object.
The following registers a plugin module names "test" and adds a general listener for a hello message:

```javascript
var Leonard = require("leonard-bot");
var Plugin = Leonard.Plugin;

var testPlugin = new Plugin("test")
testPlugin.onMessage(/hello/i, function(client, message){
  client.send(message.newResponse("Hello!"));
})
testPlugin.onMention(/hello/i, function(client, message){
  client.send(message.newReply("sup"));
})

var l = new Leonard({
  jid:'example_jid@chat.hipchat.com',
  password: 'password',
});
```

Easy as that. By instantiating a new plugin object Leonard will automatically add it to its registry. By typing `hello` into your HipChat client, Leonard will perform a general reply with `Hello!`. However, by mentioning him using `@mention_name hello` he will now respond with `@your_name sup`, thus replying directly to you.

Plugins should be preferred because it promotes modularization rather than monolithic code development
