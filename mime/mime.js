/*
 * Copyright (C) 2013, 2014 Dylan Barrell, All Rights Reserved
 *
 * See the licence file asssociated with this project for details on
 * redistribution. This copyright message MUST appear in ALL distributed
 * forms of this file
 *
 */

/**
 * Mime module
 *
 * @module Mime
 */

/**
 * Given a constructor function as an argument, safeObject will create a new
 * JavaScript Class that will not throw an exception when a call is made to a
 * non-existent function member. A call will be made instead to the
 * '__undefinedMethod__' function which can be overridden to implement
 * functionality you find useful.
 * It will also look for symbols that have been registered with the target object's
 * __constructor array and will treat those functions in the way that constructor
 * functions need to be treated.
 *
 * @class safeObject
 * @constructor
 * @param {Function} f - the constructor function that you want to use for your safe class
 * @return {Class}
 */

var proxiedObject = function(target) {
    return Proxy(target, {
        get: function(target, name, receiver) {
            var rVal, newArguments, executionVal, i;
            if (typeof target[name] === 'function' && name !== '__undefinedMethod__') {
                // Existing function that is not the __undefinedMethod__ function
                if (target.__constructors && target.__constructors.indexOf(name) !== -1) {
                    // Constructor
                    rVal = Reflect.get(target, name, arguments);
                } else {
                    rVal = function () {
                        var executionVal = target[name].apply(target, arguments);
                        return executionVal;
                    };
                }
            } else if (typeof target[name] === 'undefined') {
                /*
                 * Either a non-existent function or a non-existent attribute
                 * Cannot tell the difference, so we treat them all like functions
                 */
                rVal = function () {
                    newArguments = [name];
                    for (i = 0; i < arguments.length; i++) {
                        newArguments.push(arguments[i]);
                    }
                    executionVal = target.__undefinedMethod__.apply(target, newArguments);
                    return executionVal;
                };
            } else {
                // Existing attribute or __undefinedMethod__ function
                // Defer to the target
                rVal = Reflect.get(target, name, arguments);
            }
            return rVal;
        }
    });
}
global.safeObject = function(f) {
    var retObject = Proxy(f, {
        construct: function(target, argArray) {
            return proxiedObject(Reflect.construct(target, argArray));
        }
    });
    retObject.prototype.__undefinedMethod__ = function () {
        return proxiedObject(this); // return this so we can chain the calls
    };
    return retObject;
};

(function(){
    var Mime,
        mockedModules = {},
        util;
    
    require('harmony-reflect');
    util = require('util');

    /*
     * Implement the require mocking 'globals'
     */
    /*
     * @private
     */
    function __registerModule(name, exports) {
        mockedModules[name] = exports;
    }

    /**
     * Mime constructor. Takes an optional argument that implements a deepEqual
     * comparison to be able to determine whether the arguments passed into the
     * function call are equal. By default it uses the Node.js assert.deepEqual.
     * You will want to override this if you have objects that do not serialize
     * naturally
     *
     * @class Mime
     * @constructor
     * @param {Function} [f] a deepEqual function that can be used to compare whether two object structures are equal
     * @return {undefined}
     */
    global.Mime = Mime = module.exports.Mime = safeObject(function (f) {
        // This is the constructor for Mime
        this.__callsMade = [];
        this.__constructors = [];
        this.__deepEqual = f || require('assert').deepEqual;
    });

    /**
     * Given a module name and the default require function, Mime.require will
     * return a mocked module for the name if one was registered with _mockModule
     * or it will defer the call to the require function passed in
     *
     * @method require
     * @param {String} name - the module name
     * @param {Function} require - the default require function
     * @return {Object} - of exported module's symbols
     * @example
        // In your module, use Mime.require for any dependency
        http = Mime.require('http', require);
     */
    Mime.require = function(name, require) {
        if (mockedModules[name]) {
            return mockedModules[name];
        }
        return require(name);
    };

    /**
     * Internal method that captures calls to undefined functions into the log
     * structure
     *
     * @private
     * @method __undefinedMethod__
     * @return {undefined}
     */
    Mime.prototype.__undefinedMethod__ = function() {
        var myName = arguments[0],
            restOfArguments = [];
        if ( arguments.length > 1) {
            restOfArguments = Array.prototype.splice.call(arguments, 1, arguments.length-1);
        }
        this.__logCall(myName, restOfArguments);
        return proxiedObject(this); // return this so we can chain the calls
    };

    /**
     * Log a call to a function
     *
     * @private
     * @method __logCall
     * @param {String} name - the name of the function
     * @param {Array} [restOfArguments] - the argument array
     * @return {undefined}
     */
    Mime.prototype.__logCall = function(name, restOfArguments) {
        var callsToMe;
        callsToMe = this.__callsMade[name] || [];
        callsToMe.push(restOfArguments);
        this.__callsMade[name] = callsToMe;
    }

    /**
     * This will reset the call log, so that old undefined calls are no longer present
     *
     * @methdo _reset
     * @return {undefined}
     */
    Mime.prototype._reset = function() {
        this.__callsMade = [];
    };

    /**
     * Create a function with a specific name that is bound to the Mime and
     * return this function. This function can then be passed into a test target
     * and will act as an argument Mime. You can test the arguments passed to
     * these calls in the same way as calls to a mocked object function
     *
     * @method _spy
     * @param {String} name - the name you will use to test the arguments passed into the function when it was called
     * @param {Function} [callback] - optional parameter with a function to call when this method is called
     * @return {Function}
     * @example
        // This will add a "model" function to the mime instance that mimics
        // Mongoose's model function
        mime._spy('model', function(name, schema) {
            return this._createClass(function() {
                // constructor function logic
                ...
            });
        });
     */
    Mime.prototype._spy = function(name, callback) {
        // Bind the 'this' to the function
        var boundThis = this;
        this[name] = function() {
            var args = arguments.length ? 
                    Array.prototype.splice.call(arguments, 0, arguments.length) : 
                    [];
            boundThis.__logCall(name, args);
            if (callback) {
                return callback.apply(this, args);
            }
        };
        return this[name];
    };

    /**
     * Returns true if the function with the name passed in as the first argument
     * was called with the arguments passed in as the rest of the arguments.
     * Returns false under all other conditions
     *
     * @method _wasCalledWithArguments
     * @param {String} name - the name of the function to test
     * @param {Anything} [arguments] - the other arguments to test
     * @return {Boolean}
     * @example
        // The mime instance here was supplied as a mock for a mongoose module
        it('Should have created the model', function () {
            assert.ok(mime._wasCalledWithArguments('model', 'Cat', { name : String }),
              'Should have called model');
        });
     */
    Mime.prototype._wasCalledWithArguments = function() {
        var myName = arguments[0],
            restOfArguments = [],
            callsToMe, passed, i;

        if ( arguments.length > 1) {
            restOfArguments = Array.prototype.splice.call(arguments, 1, arguments.length-1);
        }
        callsToMe = this.__callsMade[myName];
        if (!callsToMe) {
            return false;
        }
        for (i = 0; i < callsToMe.length; i++) {
            passed = true;
            try {
                this.__deepEqual(restOfArguments, callsToMe[i]);
            } catch (exc) {
                passed = false;
            }
            if (passed) {
                return true;
            }
        }
        return false;
    };

    /**
     * Given a function name and an index, returns the arguments of the call at
     * that index. It returns undefined if there was no call at that index.
     * It returns an empty array if there was a call with no arguments at that
     * index. If no index is supplied, the first call (0-index) will be assumed
     *
     * @method _getCallArguments
     * @param {String} name - the name of the function
     * @param {Integer} [index] - which call's arguments to return
     * @return {Array}
     * @example
        // The mime object was turned into a class factory using _createClass
        it('Should have called the child class\'s constructor', function () {
            assert.equal(mime._getCallArguments('Class', 0)[0].name, 'Zildjian',
              'Should have created a Zildjian cat');
        });
     */

    Mime.prototype._getCallArguments = function(name, index) {
        var callsToMe;

        if (!index) {
            index = 0;
        }
        callsToMe = this.__callsMade[name];
        if (!callsToMe) {
            return undefined;
        }
        if (callsToMe.length - 1 < index) {
            return undefined;
        }
        return callsToMe[index] || [];
    };

    /**
     * Given a function name return the array of all the calls to that function.
     *
     * @method _getAllCallArguments
     * @param {String} name - the name of the function
     * @return {Array}
     * @example
        var mime = new Mime();
        mime.newFunction();
        mime.newFunction(1, 2, 3);
        assert.deepEqual(mime._getAllCallArguments('newFunction'), [[], [1, 2, 3]],
            'Should return array of argument arrays');
     */

    Mime.prototype._getAllCallArguments = function(name) {
        var callsToMe;

        callsToMe = this.__callsMade[name];
        if (!callsToMe) {
            return undefined;
        }
        return callsToMe;
    };

    /**
     * Given the name of a module, return the Mime instance that is the cached instance for this
     * module and if one does not exist create it
     *
     * @static getMockedModuleMime
     * @param {String} name - the name of the module as it will be required
     * @return {Mime} - the Mime instance for the mocked module
     * @example
        // In your test file, you use Mime.getMockedModuleMime to obtain a Mime object for the http module
        // This is required so that Node.js's module caching will not get in the way of multiple
        // modules requiring the same dependency
        httpMime = Mime.getMockedModuleMime('http');

        // Then tell the mime instance which symbols to export
        httpMime._mockModule('http', ['setHeader', 'write', 'end']);

        // Then require the module with the dependency
        dependency = require('../src/dependency.js');

        // Now run the tests
        ...
     */
    Mime.getMockedModuleMime = function(name) {
        var retVal;
        if (mockedModules[name]) {
            return mockedModules[name].this;
        } else {
            retVal = new Mime();
            retVal._mockModule(name, []);
            return retVal;
        }
    }
    /**
     * Given a module name and a set of methods, create an exports structure for a module with
     * those methods and bind it to the this object. Put that structure into the global mocked
     * modules registry
     *
     * @method _mockModule
     * @param {String} name - the name of the module as it will be required
     * @param {Array[String|Object} methods - if a String, the name of the method to export and bind, if an Object, its attributes' name will be exported, bound to the Mime instance and the function will also be called when the method is called
     * @return {undefined}
     * @example
        // In your test file, you use Mime.getMockedModuleMime to obtain a Mime object for the http module
        // This is required so that Node.js's module caching will not get in the way of multiple
        // modules requiring the same dependency
        httpMime = Mime.getMockedModuleMime('http');

        // Then tell the mime instance which symbols to export
        httpMime._mockModule('http', ['setHeader', 'write', 'end']);

        // Then require the module with the dependency
        dependency = require('../src/dependency.js');

        // Now run the tests
        ...
     */

    Mime.prototype._mockModule = function(name, methods) {
        var exports = this.__exports || {this:this},
            j, attr, method, symbol;
        for (attr in exports) {
            if (attr !== 'this') {
                delete exports[attr];
            }
        }
        for (j = 0; j < methods.length; j++) {
            method = methods[j];
            if (typeof method === 'string') {
                // create a captor method
                this[method] = this._spy(method);
                exports[method] = this[method];
            } else if (typeof method === 'object') {
                for (symbol in method) {
                    if (method.hasOwnProperty(symbol)) {
                        if (typeof method[symbol] === 'function') {
                            // create a captor method
                            this[symbol] = this._spy(symbol, method[symbol]);
                        } else {
                            // this is some type of object, so create an attribute
                            this[symbol] = method[symbol];
                        }
                        exports[symbol] = this[symbol];
                    }
                }
            }
        }
        this.__exports = exports;
        __registerModule(name, exports);
    };

    /**
     * Unregister the mocked exports for a module
     *
     * @method _unmockModule
     * @param {String} name - the name of the module to unmock
     * @return {undefined}
     */

    Mime.prototype._unmockModule = function(name) {
        var exports = this.__exports,
            func, attr;

        for (attr in exports) {
            if (attr !== 'this') {
                // Remove the symbol from the exported symbols
                delete exports[attr];

                // Remove the method from the Mime instance
                if (this.hasOwnProperty(attr)) {
                    delete this[attr];
                }
                // Empty the call log
                delete this.__callsMade[attr];
            }
        }
    };

    /**
     * Register a symbol as a constructor function so that the proxy will return the
     * function in such a way that it can be used with new
     *
     * @_registerConstructor
     * @param {String} symbol - the symbol name to register
     * @return {undefined}
     */
    Mime.prototype._registerConstructor = function(symbol) {
        this.__constructors.push(symbol);
    };

    /**
     * Given a constructor function as an argument, create a new Class that inherits from
     * the Mime class but whose instances' cal logs are shared with this instance's call log.
     * This is useful when mocking a global or require class so that access can be gained to
     * what happens to the instances of that class.
     * The call log will also log the creation of instances under the symbol 'Class', so that
     * the arguments to those calls can also be captured
     *
     * @method _createClass
     * @param {Function} constructor - the constructor function
     * @return {Function} - the inherited and bound constructor
     * @example
        var assert = require('assert'),
            Cat, kitty, mongoose;

        require('node-mimejs');

        mongoose = new Mime();
        // When mongoose.model is called, it returns a new class
        mongoose._spy('model', function(name, defn) {
            return this._createClass(function() {
            });
          });
        Cat = mongoose.model('Cat', { name: String });

        // Calling the class's constructor, will register a call against the "Class"
        // "method" in the mongoose Mime instance
        kitty = new Cat({ name: 'Zildjian' });

        // Calling the child instance's functions will also register calls against
        // the mongoose Mime instance
        kitty.save(function (err) {
            if (err) {
                console.log('meow');
            }
        });

        // test that with these asserts
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
     */
    Mime.prototype._createClass = function(constructor) {
        var boundThis = this,

            // Create a new safeObject - because util.inherit does not inherit safeObject behavior
            actualConstructor = safeObject(function() {
                // Call super constructor
                Mime.call(this);

                // Bind the logs for the new class to the parent instance's log
                this.__callsMade = boundThis.__callsMade;

                // Call the client's constructor
                constructor.apply(this, arguments);

                // Log the call to the constructor aainst the special "Class" method
                this.__logCall('Class', arguments ? Array.prototype.splice.call(arguments, 0, arguments.length) : undefined);
            });

        // Inherit from Mime
        util.inherits(actualConstructor, Mime);

        // Return the new class
        return actualConstructor;
    };
}());
