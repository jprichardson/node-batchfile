[![build status](https://secure.travis-ci.org/jprichardson/node-batchfile.png)](http://travis-ci.org/jprichardson/node-batchfile)


Node.js - batchfile
================

Batch operations, transformations, and conversions on files.



Why?
----

Writing logic to 
1. iterate through files
2. check that files exist
3. read the file
4. convert file
5. check that destination directory exists
6. if not, make the directory
7. write the file
8. be notified when all of the files are done

sucks.

### Scenario

Let's assume that we have a collection of Markdown files with [Mustache][mustache] templates. We want to create HTML files from these Markdown files.

Let's assume that our Markdown looks like this:

```markdown
My Biography
============

By {{author}}
-------------

... some text ...

```


#### Old-School Way

```javascript
var marked = require('marked')
  , hogan = require('hogan.js')
  , fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp');

var files = ['bio1.md', 'bio2.md', 'bio3.md'];
var authors = ['JP', 'Leslie', 'Chris'];
var pending = files.length;

files.forEach(function(file, i) {
    fs.exists(file, function(itDoes) {
        it (!itDoes) {
            throw new Error(file + " does not exist.");
        } else {
            fs.readFile(file, 'utf8', function(err, data) {
                if (err) {
                    throw err;
                } else {
                    var bn = path.basename(file, '.md');
                    var newMd = hogan.compile(data).render({author: authors[i]});
                    var html = marked(newMd);
                    var newFile = path.join('/tmp/output/', bn + '.html');

                    var dir = path.dirname(newFile);
                    fs.exists(dir, function(dirExists) {
                        function wf(err) {
                            if (err) {
                                throw err;
                            }

                            fs.writeFile(newFile, html, function(err) {
                                if (err) {
                                    throw err;
                                } else {
                                    pending -= 1;
                                    if (pending === 0) {
                                        console.log("Phew, we are done!");
                                    }
                                }
                            })
                        }

                        if (!dirExists) {
                            mkdirp(dir, wf);
                        } else {
                            wf(null);
                        }
                    })
                }
            })
        }
    })
});
```

Yuck. Very long and hard to follow code. Yes, you can definitely simplify this by using libraries such as [async][async], [seq][seq], or [batchflow][batchflow]. `batchtransform` itself uses [batchflow][batchflow].

Let's see the previous sample rewritten using `batchfile`.

#### New-School way

```javascript
var marked = require('marked')
  , hogan = require('hogan.js')
  , btf = require('batchfile');

var files = ['bio1.md', 'bio2.md', 'bio3.md'];
var authors = ['JP', 'Leslie', 'Chris'];

btf(files).transform(function(i, file, data, write) {
    var bn = path.basename(file, '.md');
    var newMd = hogan.compile(data.toString()).render({author: authors[i]});
    var html = marked(newMd);
    var newFile = path.join('/tmp/output/', bn + '.html');

    write(newFile, html); //<--- always call write() last and only once.
}).error(function(err) {
    throw err;
}).end(function() {
    console.log('We are done! Much clearer!');  
});
```



Installation
------------

    npm install batchfile



Methods
------

### batchfile(files)

Constructor function.

**files:** can be either an array or strings

Returns new BatchTransform object.

Example:
```javascript
var batchfile = require('batchfile');
var myBatch = batchfile('f1', 'file2', 'readme.md');
```


### transform(function(i, file, data, write){})

Transformation callback.

**i:** index of current iteration

**file:** file path

**data:** data buffer (don't forget to convert to a string)

**write:** the write callback. Call this last, and call it only once.

End callback is passed an array of written files.


### read(function(i, file, data, done))

**i:** index of current iteration

**file:** file path

**data:** data buffer (don't forget to convert to a string)

**done:** the done callback. Call this last, and call it only once.

End callback is passed an array of what was passed to the parameter of the done function.



### error(callback)

The error callback.

### end(callback)

The end callback. The callback is passed different parameters depending upon which function was called above.



Author
------

`node-batchfile` was written by [JP Richardson][aboutjp]. You should follow him on Twitter [@jprichardson][twitter]. Also read his coding blog [Procbits][procbits]. If you write software with others, you should checkout [Gitpilot][gitpilot] to make collaboration with Git simple.


License
-------

(MIT License)

Copyright 2012, JP Richardson  <jprichardson@gmail.com>



[seq]: https://github.com/substack/node-seq
[async]: https://github.com/caolan/async
[batchflow]: https://github.com/jprichardson/node-batchflow

[aboutjp]: http://about.me/jprichardson
[twitter]: http://twitter.com/jprichardson
[procbits]: http://procbits.com
[gitpilot]: http://gitpilot.com




