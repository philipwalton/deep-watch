var fs = require('fs-extra')
var expect = require('chai').expect
var DeepWatch = require('..')

// this needs to be enough time for the watch events to fire
var delay = 100

describe('DeepWatch', function() {

  var cwd = process.cwd()
  var events

  function storeData(event, filename) {
    // Annoyingly, storing the event type doesn't seem to work well with
    // creating fixtures manually. Until this is resolved, just check for
    // the presense of the filename, and don't care about the event.
    // https://github.com/joyent/node/issues/6714
    events.push({filename:filename, event:event})
  }

  beforeEach(function(done) {
    events = []

    fs.removeSync('test/fixtures')
    fs.mkdirpSync('test/fixtures')
    process.chdir('test/fixtures')

    fs.outputFileSync('one.txt', 'one.txt')
    fs.outputFileSync('two.txt', 'two.txt')
    fs.outputFileSync('sub-dir/one.txt', 'one.txt')
    fs.outputFileSync('sub-dir/two.txt', 'two.txt')
    fs.outputFileSync('sub-dir/sub-sub-dir/one.txt', 'one.txt')
    fs.outputFileSync('sub-dir/sub-sub-dir/two.txt', 'two.txt')

    // wait to prevent these file system writes from invoke fs.watch callbacks
    setTimeout(done, delay)
  })

  afterEach(function() {
    process.chdir(cwd)
  })

  after(function() {
    fs.removeSync('test/fixtures')
  })

  describe('#start', function(done) {

    it('can detect changes to files', function(done) {
      var dw = new DeepWatch('.', function(event, filename) {
        storeData(event, filename)
        if (events.length === 3) {
          expect(events[0].filename).to.equal('new.txt')
          expect(events[1].filename).to.equal('two.txt')
          expect(events[2].filename).to.equal('one.txt')
          this.stop()
          done()
        }
      })
      dw.start()
      fs.writeFileSync('new.txt', 'new file')
      fs.removeSync('two.txt')
      fs.appendFileSync('one.txt', 'additional text...')
    })

    it('can detect changes to files in sub-directories', function(done) {
      var dw = new DeepWatch('.', function(event, filename) {
        storeData(event, filename)
        if (events.length === 3) {
          expect(events[0].filename).to.equal('sub-dir/new.txt')
          expect(events[1].filename).to.equal('sub-dir/two.txt')
          expect(events[2].filename).to.equal('sub-dir/one.txt')
          this.stop()
          done()
        }
      })
      dw.start()
      fs.writeFileSync('sub-dir/new.txt', 'foo')
      fs.removeSync('sub-dir/two.txt')
      fs.appendFileSync('sub-dir/one.txt', 'additional text...')
    })

    it('can detect changes to files in sub-sub-directories', function(done) {
      var dw = new DeepWatch('.', function(event, filename) {
        storeData(event, filename)
        if (events.length === 3) {
          expect(events[0].filename).to.equal('sub-dir/sub-sub-dir/new.txt')
          expect(events[1].filename).to.equal('sub-dir/sub-sub-dir/two.txt')
          expect(events[2].filename).to.equal('sub-dir/sub-sub-dir/one.txt')
          this.stop()
          done()
        }
      })
      dw.start()
      fs.writeFileSync('sub-dir/sub-sub-dir/new.txt', 'foo')
      fs.removeSync('sub-dir/sub-sub-dir/two.txt')
      fs.appendFileSync('sub-dir/sub-sub-dir/one.txt', 'additional text...')
    })

    it('can detect changes to files in directories created after the watching started', function(done) {
      var dw = new DeepWatch('.', function(event, filename) {
        storeData(event, filename)
        if (events.length === 3) {
          expect(events[0].filename).to.equal('new-dir')
          expect(events[1].filename).to.equal('new-dir/foo.txt')
          expect(events[2].filename).to.equal('new-dir/foo.txt')
          this.stop()
          done()
        }
      })
      dw.start()
      fs.mkdirpSync('new-dir')
      // timeouts are needed to account for the delay in file system events
      setTimeout(function() {
        fs.outputFileSync('new-dir/foo.txt', 'foo')
        setTimeout(function() {
          fs.removeSync('new-dir/foo.txt')
        }, delay)
      }, delay)
    })

    it('can detect the removal of directories created after the watching started', function(done) {
      var dw = new DeepWatch('.', function(event, filename) {
        storeData(event, filename)
        if (events.length === 3) {
          expect(events[0].filename).to.equal('new-dir')
          expect(events[1].filename).to.equal('new-dir/new-sub-dir')
          expect(events[2].filename).to.equal('new-dir/new-sub-dir')
          this.stop()
          done()
        }
      })
      dw.start()
      fs.mkdirpSync('new-dir')
      // timeouts are needed to account for the delay in file system events
      setTimeout(function() {
        fs.mkdirpSync('new-dir/new-sub-dir')
        setTimeout(function() {
          fs.removeSync('new-dir/new-sub-dir')
        }, delay)
      }, delay)
    })

  })

  describe('#stop', function(done) {

    it('removes all bound watchers', function(done) {
      var dw = new DeepWatch('.', storeData)
      dw.start()
      fs.appendFileSync('one.txt', 'additional text...')
      fs.appendFileSync('sub-dir/one.txt', 'additional text...')
      fs.appendFileSync('sub-dir/sub-sub-dir/one.txt', 'additional text...')
      setTimeout(function() {
        dw.stop()
        fs.appendFileSync('one.txt', 'additional text...')
        fs.appendFileSync('sub-dir/one.txt', 'additional text...')
        fs.appendFileSync('sub-dir/sub-sub-dir/one.txt', 'additional text...')
        setTimeout(function() {
          expect(events.length).to.equal(3)
          done()
        }, delay)
      }, delay)
    })

  })

})
