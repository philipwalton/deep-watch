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
## The Future

This library may or may not be needed once [this feature](https://github.com/joyent/node/commit/33c9f0c) is released in stable.
