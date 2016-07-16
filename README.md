# Leonard

Leonard is a chat bot for hipchat. Full stop.

# Table of Contents

TODO

# Bringing Leonard to life

TODO

# Plugins

Leonard can use plugins which are registered upon instantiation of the leonard-bot `Plugin` object.
The following registers a plugin module names "test" and adds a general listener for a hello message:

```javascript
var Plugin = require('leonard-bot').Plugin;

//make a new 'test' plugin
var testPlugin = new Plugin("test");

testPlugin.onMessage(/hello/i, function(){
    //do stuff
});
```

Easy as that. By instantiating a new plugin object Leonard will automatically add it to its registry.
Plugins should be preferred because it promotes modularization rather than monolithic code development
