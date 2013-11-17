var fs = require('fs')
  , path = require('path')
  , watchers = {}

var excludes = ['.']
  , cwd = process.cwd()


function isExcluded(dir) {
  // never exclude '.'
  if (dir == '.') return false

  return excludes.some(function(exclude) {
    return dir.indexOf(exclude) === 0
  })
}

function isDirectory(filename) {
  // TODO: consider async
  return fs.existsSync(filename)
    ? fs.statSync(filename).isDirectory()
    : false
}

function watchDeep(dir, excludes) {
  dir = path.relative(cwd, dir || '') || '.'

  if (isExcluded(dir))
    return
  else
    watch(dir)

  fs.readdir(dir, function(err, files) {
    files.forEach(function(f) {
      f = path.join(dir, f)
      if (isDirectory(f)) watchDeep(f)
    })
  })
}

function onEvent(filepath) {
  console.log("something happened: " + filepath)

  if (watchers[filepath])
    unwatch(filepath)
  else
    if (isDirectory(filepath)) watch(filepath)
}

function watch(directory) {
  // don't double watch
  if (watchers[directory]) return

  // add to the watchers list
  watchers[directory] = fs.watch(directory, function(event, filename) {
    onEvent(path.join(directory, filename))
  })
}

function unwatch(directory) {
  Object.keys(watchers).forEach(function(dirpath) {
    // remove any watchers on this director and sub-directories
    if (dirpath.indexOf(directory) === 0) {
      console.log('stop watching ' + dirpath)
      watchers[dirpath].close()
      delete watchers[dirpath]
    }
  })
}

excludes.push('node_modules')
watchDeep()
