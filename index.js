var fs = require('fs')
  , path = require('path')
  , defaults = require('lodash.defaults')
  , semver = require('semver')

var supportsRecursiveWatch = process.platform == 'darwin'
  && semver.gte(process.version, '0.11.9')

var defaultOptions = {
  ignoreDotDirectories: true,
  exclude: []
}

var isDirectory = function(filename) {
  // TODO: consider async
  return fs.existsSync(filename)
    ? fs.statSync(filename).isDirectory()
    : false
}


function DeepWatch(cwd, options, callback) {
  // argument shifting
  if (typeof options == 'function') {
    callback = options
    options = {}
  }

  this._cwd = cwd
  this._callback = callback
  this._options = defaults(options, defaultOptions)
  this._watchers = {}
}


DeepWatch.prototype.start = function(cb) {
  this._watch(this._cwd)

  return this
}


DeepWatch.prototype.stop = function() {
  var _this = this

  Object.keys(this._watchers).forEach(function(watcher) {
    _this._watchers[watcher].close()
  })

  this._watchers = {}
  return this
}


DeepWatch.prototype._watch = function(dir) {
  var _this = this

  if (this._isExcluded(dir))
    return
  else
    this._addWatcher(dir)

  fs.readdirSync(dir).forEach(function(f) {
    f = path.join(dir, f)
    if (isDirectory(f)) _this._watch(f)
  })
}


DeepWatch.prototype._onEvent = function(event, filepath) {
  // Creating and deleting directories will trigger events on their
  // parent watcher. As such, check if the remove event is a directory
  // and is in the exclude list before invoking the callback
  if (this._isExcluded(filepath)) return

  this._callback.call(this, event, filepath)

  if (this._watchers[filepath])
    this._removeWatcher(filepath)
  else
    if (isDirectory(filepath)) this._addWatcher(filepath)
}


DeepWatch.prototype._addWatcher = function(directory) {
  // don't double watch
  if (this._watchers[directory]) return

  // add to the watchers list
  this._watchers[directory] = fs.watch(directory, function(event, filename) {
    this._onEvent(event, path.join(directory, filename))
  }.bind(this))
}


DeepWatch.prototype._removeWatcher = function(directory) {
  Object.keys(this._watchers).forEach(function(dirpath) {
    // remove any watchers on this director and sub-directories
    if (dirpath.indexOf(directory) === 0) {
      this._watchers[dirpath].close()
      delete this._watchers[dirpath]
    }
  }.bind(this))
}


DeepWatch.prototype._isExcluded = function(dir) {
  options = this._options

  // never exclude the current working directory
  if (path.relative(this._cwd, dir) === '') {
    return false
  }
  else if (options.ignoreDotDirectories && dir[0] == '.') {
    return true
  }
  else {
    return options.exclude.some(function(exclude) {
      return dir === exclude
    })
  }
}


module.exports = DeepWatch
