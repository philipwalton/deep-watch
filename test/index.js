
var fs = require('fs')
  , expect = require('chai').expect
  , shell = require('shelljs')
  , DeepWatch = require('..')

describe('DeepWatch', function() {

  describe('#start', function() {

    it('can detect changes in the pre-existing directories', function(done) {

      var dw = new DeepWatch({
        cwd: 'test/fixtures',
        callback: onChange
      })
      dw.start()

      var originalText = fs.readFileSync('test/fixtures/one.txt', 'utf-8')
      fs.writeFileSync('test/fixtures/one.txt', 'foo')

      function onChange(event, filename) {
        expect(filename).to.equal('test/fixtures/one.txt')
        fs.writeFileSync('test/fixtures/one.txt', originalText)

        done()
      }
    })

  })

})
