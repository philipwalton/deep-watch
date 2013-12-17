# Deep Watch

Exactly like fs.watch, but with sub-directory support. When an instance of  `DeepWatch` is registered on a directory, it scans all of that directories sub-directories and applies watchers to them as well. It also keeps track of newly added or removed directories after the watching has begun.

**Note:** A recursive option for `fs.watch` is currently supported (for OS X only) in a beta version of node [(v0.11.9)](http://nodejs.org/docs/v0.11.9/api/fs.html#fs_fs_watch_filename_options_listener). Supported platforms will use the recursive option, all other platorms will use this library's original implementation.

## API

### new DeepWatch(cwd, [options], callback)

Return a new DeepWatch instance.

`cwd` *String* - the root directory to start watching from

`options` *Object* - see below for options details
  - `exclude`: *Array* - a list of directory names to ignore. Events on those directories, their sud-directories, or any files within are not reported. *(default: [])*
  - `ignoreDotDirectories`: *Boolean* - whether to ignore directories beginning with a `.` *(default: true)*

`callback` *Function* - a callback to be invoked on each file systen event. The callback is invoked with the following arguments `(event, filename)` and the DeepWatch instance as its `this` context.

### DeepWatch#start()

Start listening for file system events.

### DeepWatch#stop()

Stop listening for events and remove any associated watchers.

## Example

```js
var DeepWatch = require('deep-watch')

var dw = new DeepWatch('.', function(event, filename) {
  if (filename == 'foo/bar/index.html') this.stop()
})

dw.start()
```

## Known limitations

- If multiple, nested files or directories are added at the same time (or very quickly), no event will be triggered for the nested file. This can happen when doing something like `mkdir -p  new-directory/new-sub-directory`. The reason is that the sub-directory is created before the callback for the creation of the parent directory is invoked.
