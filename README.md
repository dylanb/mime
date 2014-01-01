#Mime

Mime is a capturing mock library for Node.js. It uses harmony-reflect Proxy objects (part of the ES 6 JavaScript standard) to allow for very simple capturing mock objects and capturing callbacks to be created and used within an automated test framework such as Mocha.

All you need to do is git clone git@github.com:dylanb/mime.git and then npm install to get everything installed and then ensure that grunt starts node with the -harmony flag set. I did this by creating a shell script in my PATH (cunningly called "node"), that comes before the actual node executable that then calls the real node executable with -harmony.

Here is the source code of that shell script for you to copy/modify


    #!/bin/bash
    echo $*
    /usr/local/bin/node -harmony $*


##Known Issues and Workarounds
There is currently a bug when using Mime in tests that run continually using grunt connect watch. B in grunt that I have only been able to fix by modifying 