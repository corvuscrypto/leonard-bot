# Leonard

Leonard is a chat bot for hipchat with no flare. I have thus deemed him a depressing bot because he doesn't give you fancy html, just plain old messages in XMPP's text format.

A bit of background for Leonard: One day, when the clouds were super grey and things were quite droll around the office, we had our chat bot based on another popular lib stop responding. Naturally we were saddened at the lack of life from our little buddy!

When we investigated the core cause, it turned out that internally, the library was using the REST API for HipChat for sending all of its messages to elicit a pretty notification card. Furthermore, it turned out that initialization was near impossible because the amount of rooms we had caused him to reach the API limit before he could even get up and running.

Then after much groveling over the sad loss of our friend, it was decided that no more will we bring a bot into the world (our servers) that could not live long and prosper!
`ENTER LEONARD`
While Leonard might not have all the flare of xhtml, he certainly can bolt messages across the internet! His messages, however, are still drab and remind us of our long lost friend of the good old days (07/08/2016), and so I give you Leonard: The bot with a depressing tone, but a helpful spirit!

## Table of Contents

* [Bringing Leonard to life](#bringing-leonard-to-life)
* [Listening for messages](#listening-for-messages)
* [Responding to messages](#responding-to-messages)
* [Getting user info within a callback](#getting-user-info-within-a-callback)
* [Plugins](#plugins)

## Bringing Leonard to life

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

## Listening for messages

Leonard uses RegExp to listen for specific messages. Leonard can also distinguish between mentions and normal
groupchat messages. If you wish to listen for a groupchat message, you can use the `onMessage` method. For mentions, use
`onMention`. Both of these methods require the params `(regex|string, callback)` where callback has the function signature
of `function(client, message, [params])`. Note that `params` is optional

For the callback, `client` is the bot object, `message` is the Message object created on receipt of the message, and `params`
are the array of captures from the RegExp used (if available).

An example of a message handler that prints out a user's name after a "Hello my name is _____" message:
```javascript
bot.onMessage(/Hello my name is (.*)/i, function(client, message, params){
  console.log(params[0]);
});
```

## Responding to messages

Leonard would be pretty useless if he couldn't talk back to people. In order to respond to messages that you listen for,
you must use the `client.send(message)` method. The following echoes back whatever message Leonard hears:

```javascript
bot.onMessage(/.*/, function(client, message){
  client.send(message);
});
```

However this is a bit boring. If we want to respond with our own message, we can choose to reply to the room the message
was received from with a general message, or we can have Leonard mention the user that sent the received message. Either
case is easy since each Message object has the methods `newResponse(content)` and `newReply(content)`. If you want to
send a general message back to the room, use `message.newResponse(content)` to construct a new message. If you want to
mention the original sender, use `message.newReply(content)`. Finally, to send the reply we again use `client.send(newMessage)`.

Putting it all together, the following code creates a handler for `good morning` messages and responds to the user
with a polite `@user_mention_name Good morning! How are you?`

```javascript
bot.onMessage(/good morning/i, function(client, message){
  client.send(message.newReply("Good morning! How are you?"));
});
```

You can also, of course, create your own Message object for sending which allows you to specify a room.
This is useful if you wish to perform broadcasts in a different room than that in which the message was received.

## Getting user info within a callback

If you wish to access user info, Leonard stores users within the `users` attribute. The `users` attribute on a Leonard
bot is stored as map[userJID]userObject where userObject contains the user's JID, nickname, and mention name.

```javascript
//example user bot.users["123456_jid@chat.hipchat.com"]
{
  "jid": "123456_jid@chat.hipchat.com",
  "nick": "Jimmy Smith",
  "mentionName": "JSmith"
}
```

Since the bot object reference is passed into the callback for a message handler, you can easily retrieve user information
at any time when handling a message.

## Plugins

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

Plugins should be preferred because it promotes modularization rather than monolithic code development. If you wish
to place your plugins into a folder with separate files instead, you can specify a plugin folder for Leonard by setting
the `pluginDir` option when initializing the bot. This will cause all proper plugins to be automatically loaded into
the registry upon initializing the bot.

__Note that any plugins registered after the bot is initialized will not be active.__

## API reference

TODO
