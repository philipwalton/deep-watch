var fs = require('fs')
  , path = require('path')
  , watchers = {}
  , defaults = require('lodash.defaults')


var defaultOptions = {
  cwd: '.',
  ignoreDotDirectories: true,
  exclude: []
}

var isDirectory = function(filename) {
  // TODO: consider async
  return fs.existsSync(filename)
    ? fs.statSync(filename).isDirectory()
    : false
}


function WatchDeep(options) {
  this._options = defaults(options, defaultOptions)
  this._watchers = {}
}


WatchDeep.prototype.start = function(cb) {
  if (typeof cb == 'function') {
    this._options.callback = cb
  }
  this._watch(this._options.cwd)

  return this
}

WatchDeep.prototype.stop = function() {
  var _this = this

  Object.keys(this._watchers).forEach(function(watcher) {
    _this._watchers[watcher].close()
  })

  this._watchers = {}
  return this
}


WatchDeep.prototype._watch = function(dir) {
  var _this = this
  dir = path.relative(this._options.cwd, dir) || '.'

  if (this._isExcluded(dir))
    return
  else
    this._addWatcher(dir)

  fs.readdir(dir, function(err, files) {
    files.forEach(function(f) {
      f = path.join(dir, f)
      if (isDirectory(f)) _this._watch(f)
    })
  })
}


WatchDeep.prototype._onEvent = function(event, filepath) {
  this._options.callback.call(this, event, filepath)

  if (this._watchers[filepath])
    this._removeWatcher(filepath)
  else
    if (isDirectory(filepath)) this._addWatcher(filepath)
}


WatchDeep.prototype._addWatcher = function(directory) {
  // don't double watch
  if (this._watchers[directory]) return

  // add to the watchers list
  this._watchers[directory] = fs.watch(directory, function(event, filename) {
    this._onEvent(event, path.join(directory, filename))
  }.bind(this))
}


WatchDeep.prototype._removeWatcher = function(directory) {
  Object.keys(this._watchers).forEach(function(dirpath) {
    // remove any watchers on this director and sub-directories
    if (dirpath.indexOf(directory) === 0) {
      this._watchers[dirpath].close()
      delete this._watchers[dirpath]
    }
  }.bind(this))
}


WatchDeep.prototype._isExcluded = function(dir) {
  options = this._options

  // never exclude the current working directory
  if (path.relative(options.cwd, dir) === '') {
    return false
  }
  else if (options.ignoreDotDirectories && dir[0] == '.') {
    return true
  }
  else {
    return options.exclude.some(function(exclude) {
      return dir.indexOf(exclude) === 0
    })
  }
}

module.exports = WatchDeep
