#Mime (npm node-mimejs)

Mime (npm node-mimejs module) is a capturing mock library for Node.js. It uses harmony-reflect Proxy objects (part of the ES 6 JavaScript standard) to allow for very simple capturing mock objects and capturing callbacks to be created and used within an automated test framework such as Mocha.

##Example

Assuming you have the following Mongoose code in a file called "mySrcFile.js"

    var Cat = mongoose.model('Cat', { name: String }),
        kitty = new Cat({ name: 'Zildjian' });
    
    kitty.save(function (err) {
        if (err) {
            console.log('meow');
        }
    });

And you want to not only test the arguments that are passed to mongoose.model, but also to the constructor for the call to make the kitty instance of Cat and then also to make sure that save was called on that instance, you simply do:

    var assert = require('assert'),
        Mime = require('../../mime/mime').Mime,
        mongoose;

    mongoose = global.mongoose = new Mime();
    mongoose._spy('model', function() {
        return this._createClass(function () {
        });
      });
    require('./mySrcFile.js');

    describe('mongooseExample.js', function () {
        it('Should have created the model', function () {
            assert.ok(mongoose._wasCalledWithArguments('model', 'Cat', { name : String }),
              'Should have called model');
        });

        it('Should have called the "Cat" constructor', function () {
            assert.equal(mongoose._getCallArguments('Class', 0)[0].name, 'Zildjian',
              'Should have created a Zildjian cat');
        });

        it('Should have called the "save" method', function () {
            assert.equal(typeof mongoose._getCallArguments('save', 0)[0], 'function',
              'Should have called with a callback');
        });
    });

##Documentation
Documentation can be found in the docs folder. Also available with additional information here: http://dylanb.github.io/mime/overview.html.

##Use
    
[![NPM install node-mimejs](https://nodei.co/npm/node-mimejs.png?mini=true)](https://nodei.co/npm/node-mimejs/)

Then in your test files

    require('node-mimejs');

##Environment

Then ensure that grunt/gulp starts node with the -harmony flag set. I did this by creating a shell script in my PATH (cunningly called "node"), that comes before the actual node executable that then calls the real node executable with the -harmony flag.

Here is the source code of that shell script for you to copy/modify


    #!/bin/bash
    echo $*
    /usr/local/bin/node -harmony $*

##Develop

All you need to do is git clone git@github.com:dylanb/mime.git and then npm install to get everything installed. 

##Known Issues and Workarounds

###Grunt connect watch Proxy not defined error

There is currently a bug when using Mime in tests that run continually using grunt connect watch. Due to the need to start node with the -harmony flag and the fact that watch always spawns a new instance of node, the -harmony flag is lost by the auto spawns.

This issue does not exist when using gulp.watch - maybe you want to use gulp instead of grunt.

There is a fix that is currently in a pull request to fix this https://github.com/gruntjs/grunt/pull/877

If you must use Grunt, you can get around this by fixing the bug in util.spawn that causes this. Here is the change

in the node_modules/grunt/lib/grunt/util.js file, look for this section of code:

    if (opts.grunt) {
        cmd = process.argv[0];
        args = [process.argv[1]].concat(opts.args);
    } else {

And change this line:

        args = [process.argv[1]].concat(opts.args);

To

        args = process.execArgv.concat([process.argv[1]].concat(opts.args));

