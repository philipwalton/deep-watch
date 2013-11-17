var DeepWatcher = require('..')

var dw = new DeepWatcher({
  exclude: ['node_modules'],
  callback: function(event, filename) {
    if (filename == 'foo/bar/index.html') this.stop()
  }
})

dw.start()
