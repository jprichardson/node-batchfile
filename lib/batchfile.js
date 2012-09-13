var fs = require('fs-extra')
  , batch = require('batchflow')
  , path = require('path')
  , nargs = require('nargs');


function BatchFile(files) {
    this.files = files
    this.iterableCallback = null;
    this.errorCallback = function(err) { throw err; };
}

BatchFile.prototype.transform = function(callback) {
    var self = this;
    this.iterableCallback = function(i, file, done) {
        function writeCallback(file, data) {
            var dir = path.dirname(file);

            function wf(){
                fs.writeFile(file, data, function(err) {
                    if (err) {
                        self.errorCallback(err);
                        done(null)
                    } else {
                        done(file);
                    }
                });
            }

            fs.exists(dir, function(itDoes) {
                if (!itDoes) {
                    fs.mkdir(dir, wf);
                } else {
                    wf();
                }
            })
        }

        fs.exists(file, function(itDoes) {
            if (!itDoes) {
                self.errorCallback(new Error(file + " does not exist."))
                done(null);
            } else {
                fs.readFile(file, function(err, data) {
                    if (err) {
                        self.errorCallback(err);
                        done(null);
                    } else {
                        callback(i, file, data, writeCallback);
                    }
                })
            }
        })
    }

    return this;
};

BatchFile.prototype.read = function(callback) {
    var self = this;
    this.iterableCallback = function(i, file, done) {
        fs.exists(file, function(itDoes) {
            if (!itDoes) {
                self.errorCallback(new Error(file + " does not exist."));
                done(null);
            } else {
                fs.readFile(file, function(err, data) {
                    if (err) {
                        self.errorCallback(err);
                        done(null);
                    } else {
                        callback(i, file, data, done);
                    }
                })
            }
        });
    }
    return this;
};

BatchFile.prototype.error = function(callback) {
    this.errorCallback = callback;
    return this;
}

BatchFile.prototype.end = function(endCallback) {
    var self = this;
    batch(self.files).seq().each(function(i, file, done) {
        self.iterableCallback(i, file, done);
    }).end(function(results) {
        endCallback(results);
    });
};


module.exports = function() {
    var files = nargs(arguments);
    return new BatchFile(files);
}

//PRIVATE METHODS

