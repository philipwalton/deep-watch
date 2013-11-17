# Watch Deep

Exactly like fs.watch, but with sub-directory support.


Examples:

```js
var WatchDeep = require('watch-deep')

var watcher = new WatchDeep({
  exclude: ['node_modules'],
  callback: function(event, filename) {
    if (filename == 'foo/bar/index.html') this.stop()
  }
})

watcher.start()
```
