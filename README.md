# Deep Watch

Exactly like fs.watch, but with sub-directory support.

## Example:

```js
var DeepWatch = require('deep-watch')

var dw = new DeepWatch({
  exclude: ['node_modules'],
  callback: function(event, filename) {
    if (filename == 'foo/bar/index.html') this.stop()
  }
})

dw.start()
```

## How It Works

A recursive option for `fs.watch` is [natively supported](http://nodejs.org/docs/v0.11.9/api/fs.html#fs_fs_watch_filename_options_listener) (Mac only) in node version 0.11.9+. Supported platforms will use the recursive options.

All other platforms will simply apply `fs.watch` to all subdirectories, keep track of if/when those sub-directories are add and remove, and apply/destory the watchers accordingly.



