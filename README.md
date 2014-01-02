#Mime (npm node-mimejs)

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Mime (npm node-mimejs module) is a capturing mock library for Node.js. It uses harmony-reflect Proxy objects (part of the ES 6 JavaScript standard) to allow for very simple capturing mock objects and capturing callbacks to be created and used within an automated test framework such as Mocha.

##Use
    
    [![NPM install node-mimejs](https://nodei.co/npm/node-mimejs.png?mini=true)](https://nodei.co/npm/node-mimejs/)

Then in your test files

    require('node-mimejs');

##Develop

All you need to do is git clone git@github.com:dylanb/mime.git and then npm install to get everything installed. 

##Environment

Then ensure that grunt starts node with the -harmony flag set. I did this by creating a shell script in my PATH (cunningly called "node"), that comes before the actual node executable that then calls the real node executable with the -harmony flag.

Here is the source code of that shell script for you to copy/modify


    #!/bin/bash
    echo $*
    /usr/local/bin/node -harmony $*

##Documentation
Documentation can be found in the docs folder. Also available with additional information here: http://dylanb.github.io/mime/overview.html.

##Known Issues and Workarounds

###Grunt connect watch Proxy not defined error

There is currently a bug when using Mime in tests that run continually using grunt connect watch. Due to the need to start node with the -harmony flag and the fact that watch always spawns a new instance of node, the -harmony flag is lost by the auto spawns.

See the fix that is currently in a pull request to fix this https://github.com/gruntjs/grunt/pull/877

You can get around this by implementing your own custom watch task (tedious) OR you can fix the bug in util.spawn that causes this. I took the latter approach. Here is the change

in the node_modules/grunt/lib/grunt/util.js file, look for this section of code:

    if (opts.grunt) {
        cmd = process.argv[0];
        args = [process.argv[1]].concat(opts.args);
    } else {

And change this line:

        args = [process.argv[1]].concat(opts.args);

To

        args = process.execArgv.concat([process.argv[1]].concat(opts.args));

