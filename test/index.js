
var fs = require('fs-extra')
  , expect = require('chai').expect
  , shell = require('shelljs')
  , DeepWatch = require('..')

describe('DeepWatch', function() {

  beforeEach(function(done) {
    fs.outputFile('test/fixtures/one.txt', 'one.txt')
    fs.outputFile('test/fixtures/two.txt', 'two.txt')
    fs.outputFile('test/fixtures/sub-dir/one.txt', 'one.txt')
    fs.outputFile('test/fixtures/sub-dir/two.txt', 'two.txt')
    fs.outputFile('test/fixtures/sub-dir/sub-sub-dir/one.txt', 'one.txt')
    fs.outputFile('test/fixtures/sub-dir/sub-sub-dir/two.txt', 'two.txt')

    // wait to prevent these file system writes from invoke fs.watch callbacks
    setTimeout(function() {
      done()
    }, 100)
  })

  after(function() {
    fs.removeSync('test/fixtures')
  })

  describe('#start', function() {

    it('can set the current working directory', function(done) {

      var cwd = process.cwd()
      process.chdir('test/fixtures')

      var dw = new DeepWatch({
        callback: onChange
      })
      dw.start()

      var originalText = fs.readFileSync('two.txt', 'utf-8')
      fs.writeFileSync('two.txt', 'foo')

      function onChange(event, filename) {
        this.stop()

        expect(filename).to.equal('two.txt')
        // fs.writeFileSync('two.txt', originalText)

        process.chdir(cwd)
        done()
      }
    })

    it('can detect changes in the pre-existing directories', function(done) {

      var dw = new DeepWatch({
        cwd: 'test/fixtures',
        callback: onChange
      })
      dw.start()

      var originalText = fs.readFileSync('test/fixtures/one.txt', 'utf-8')
      fs.writeFileSync('test/fixtures/one.txt', 'foo')

      function onChange(event, filename) {
        this.stop()

        expect(filename).to.equal('test/fixtures/one.txt')
        // fs.writeFileSync('test/fixtures/one.txt', originalText)

        done()
      }
    })

  })

})
