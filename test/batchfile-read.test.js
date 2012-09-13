var testutil = require('testutil')
  , btf = require('../lib/batchfile')
  , fs = require('fs-extra')
  , path = require('path')
  , batch = require('batchflow')
  , hogan = require('hogan.js')
  , marked = require('marked')
  , next = require('nextflow')
  , S = require('string');

TEST_DIR = ''

beforeEach(function(done) {
    TEST_DIR = testutil.generateTestPath('test-batchfile');
    fs.mkdir(TEST_DIR, done);
})

var md = "\n" + 
    "Cool Project\n" +
    "============\n" +
    "\n" +
    "Yo **{{name}}**\n" +
"";



suite('batchfile')

test('read scenario', function(done) {
    var files = [
        path.join(TEST_DIR, 't1.md'),
        path.join(TEST_DIR, 't2.md'),
        path.join(TEST_DIR, 't3.md')
    ];

    next({
        ERROR: function(err) {
            done(err);
        },
        createTestFiles: function() {
            var next = this.next;
            batch(files).par().each(function(i, file, done) {
                fs.writeFile(file, i + md, done);
            }).end(function(){
                next();
            });
        },
        readTestFiles: function() {
            var next = this.next;
            btf(files).read(function(i, file, data, done) {
                done(data + i);
            })
            .error(function(err) {
                throw err;
            })
            .end(function(results) {
                next(results);
            });
        },
        checkResults: function(results) {
            for (var i = 0; i < results.length; ++i) {
                T (S(results[i]).startsWith(i + ''))
                T (S(results[i]).endsWith(i + ''));
            }
            done();
        }
    });
    

})

