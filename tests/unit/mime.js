var assert = require('assert'),
    Mime = require('../../mime/mime').Mime;

describe('mime.js', function() {
    describe('constructor', function() {
        it('Initializes callsMade', function () {
            assert.deepEqual([], new Mime().__callsMade,
                'callsMade must be an empty array (except for the access to the attribute)');
        });

        it('Initializes deepEqual', function () {
            assert.equal(typeof new Mime().__deepEqual, 'function',
                'By default deepEqual must be a function');
        });

        it('Initializes deepEqual when passed a function', function () {
            var f = function() {
                    return 'mime';
                },
                mime = new Mime(f);
            assert.equal(mime.__deepEqual(), 'mime',
                'When passed a function as an argument, the constructor must set deepEqual to that function');
        });
    });
    describe('_wasCalledWithArguments', function() {
        it('returns true when the name of the function and its arguments match on a call to a non-existent function', function () {
            var mime = new Mime();
            mime.thisFunctionDoesNotExist(1, 2, 3);
            assert.ok(mime._wasCalledWithArguments('thisFunctionDoesNotExist', 1, 2, 3),
                'Function was called and the arguments match');
        });

        it('no arguments call also matches', function () {
            var mime = new Mime();
            mime.empty();
            assert.ok(mime._wasCalledWithArguments('empty'), 'no arguments call');
        });

        it('returns false if the arguments do not match exactly', function () {
            var mime = new Mime();
            mime.thisFunctionDoesNotExist(1, 2, 3);
            assert.ok(!mime._wasCalledWithArguments('thisFunctionDoesNotExist', 1, 2),
                'Must capture the fact that the function was called and the arguments');
        });

        it('returns true when the name of the function and its arguments match on any call to a non-existent function', function () {
            var mime = new Mime();
            mime.thisFunctionDoesNotExist(1, 2, 3);
            mime.thisFunctionDoesNotExist(1, 2, 3);
            mime.thisFunctionDoesNotExist(1);
            mime.thisFunctionDoesNotExist(1, 2);
            assert.ok(mime._wasCalledWithArguments('thisFunctionDoesNotExist', 1, 2),
                'Function was called and the arguments match');
        });

        it('Must capture each call to a non-existent function', function () {
            var mime = new Mime();
            mime.thisFunctionDoesNotExist(1, 2, 3);
            mime.thisFunctionDoesNotExist(1, 2, 3);
            mime.thisFunctionDoesNotExist(1);
            mime.thisFunctionDoesNotExist(1, 2);
            assert.equal(mime.__callsMade.thisFunctionDoesNotExist.length, 4,
                'Must capture each cal independently');
        });

        it('Must be able to handle multiple different non-existent functions', function () {
            var mime = new Mime();
            mime.a(1, 2, 3);
            mime.b(1, 2, 3);
            mime.c(1);
            mime.d(1, 2);
            assert.ok(mime._wasCalledWithArguments('d', 1, 2),
                'Function was called and the arguments match');
            assert.ok(mime._wasCalledWithArguments('c', 1),
                'Function was called and the arguments match');
            assert.ok(mime._wasCalledWithArguments('a', 1, 2, 3),
                'Function was called and the arguments match');
            assert.ok(mime._wasCalledWithArguments('b', 1, 2, 3),
                'Function was called and the arguments match');
        });
        it('must return itself when a non-existing function is called', function () {
            var mime = new Mime();
            mime.doesntExist().doesntExist();
            assert.equal(mime._getAllCallArguments('doesntExist').length, 2,
                'call to undefined must return self');
        });
    });
    describe('_reset', function() {
        it('Must re-initialize the calls made log', function () {
            var mime = new Mime();
            mime.thisFunctionDoesNotExist(1, 2, 3);
            mime._reset();
            assert.ok(!mime._wasCalledWithArguments('thisFunctionDoesNotExist', 1, 2, 3),
                'callsMade log should be empty');
        });

        it('Logging should work again after the reset', function () {
            var mime = new Mime();
            mime.thisFunctionDoesNotExist(1, 2, 3);
            mime._reset();
            mime.thisFunctionDoesNotExist(1, 2, 3);
            assert.equal(mime.__callsMade.thisFunctionDoesNotExist.length, 1,
                'Log should contain only one call');
        });
    });
    describe('_spy', function() {
        it('Must create a function with the name we supplied', function () {
            var mime = new Mime();
            mime._spy('newFunction');
            assert.ok(typeof mime.newFunction === 'function',
                'new function should exist');
        });

        it('Must log calls to the new function', function () {
            var mime = new Mime();
            mime._spy('newFunction');
            mime.newFunction();
            assert.ok(mime._wasCalledWithArguments('newFunction'),
                'Even though the function exists, calls to it should log');
        });

        it('Index must work on calls to the new function', function () {
            var mime = new Mime();
            mime._spy('newFunction');
            mime.newFunction(1, 2, 3);
            mime.newFunction();
            assert.deepEqual(mime._getCallArguments('newFunction', 0), [1, 2, 3],
                'Even though the function exists, calls to it should log');
            assert.deepEqual(mime._getCallArguments('newFunction', 1), [],
                'Even though the function exists, calls to it should log');
        });

        it('Must return the function which, if called will also log', function () {
            var mime = new Mime(),
                f = mime._spy('newFunction');
            f();
            assert.equal(mime.__callsMade.newFunction.length, 1,
                'Event though the function exists, calls to it should log');
        });
        it('Must call the callback, if passed one', function () {
            var mime = new Mime(),
                f = mime._spy('newFunction', function () { return 'calledme'; });
            assert.equal(f(), 'calledme', 'should call my callback function');
        });
        it('Must pass all the arguments to the callback, if passed arguments', function () {
            var mime = new Mime(),
                f = mime._spy('newFunction', function (a, b, c) {
                    return (a === 1 && b === 2 && c === 3);
                });
            assert.ok(f(1, 2, 3), 'should pass all arguments to my callback');
        });
    });
    describe('_getCallArguments', function() {
        it('will return undefined if the function was not called at all', function () {
            var mime = new Mime();
            assert.equal(mime._getCallArguments('newFunction', 0), undefined,
                'Should return undefined');
        });

        it('will return undefined if a log entry at the index does not exist', function () {
            var mime = new Mime();
            mime.newFunction();
            assert.equal(mime._getCallArguments('newFunction', 1), undefined,
                'Should return undefined');
        });

        it('will return an empty array if no arguments were passed to the call at the index', function () {
            var mime = new Mime();
            mime.newFunction();
            assert.deepEqual(mime._getCallArguments('newFunction', 0), [],
                'Should return undefined');
        });

        it('will return an array of the arguments that were passed to the call at the index', function () {
            var mime = new Mime();
            mime.newFunction(1, 2, 3);
            assert.deepEqual(mime._getCallArguments('newFunction', 0), [1, 2, 3],
                'Should return argument array');
        });

        it('Should handle the index correctly', function () {
            var mime = new Mime();
            mime.newFunction();
            mime.newFunction(1, 2, 3);
            assert.deepEqual(mime._getCallArguments('newFunction', 1), [1, 2, 3],
                'Should return argument array');
        });

        it('Index should default to 0', function () {
            var mime = new Mime();
            mime.newFunction(1, 2, 3);
            mime.newFunction();
            assert.deepEqual(mime._getCallArguments('newFunction'), [1, 2, 3],
                'Should return first argument array');
        });
    });
    describe('_getAllCallArguments', function() {
        it('will return undefined if the function was not called at all', function () {
            var mime = new Mime();
            assert.equal(mime._getAllCallArguments('newFunction'), undefined,
                'Should return undefined');
        });

        it('will return an array of empty array(s) if no arguments were passed to the call at the index', function () {
            var mime = new Mime();
            mime.newFunction();
            assert.deepEqual(mime._getAllCallArguments('newFunction'), [[]],
                'Should return [[]]');
        });

        it('Should handle multiple calls', function () {
            var mime = new Mime();
            mime.newFunction();
            mime.newFunction(1, 2, 3);
            assert.deepEqual(mime._getAllCallArguments('newFunction'), [[], [1, 2, 3]],
                'Should return array of argument arrays');
        });
    });
    describe('_mockModule and _unmockModule', function () {
        it('will cause dependency requires to be mocked and then unmocked and then re-mocked', function () {
            var noexist = Mime.getMockedModuleMime('noexist'),
                dependency, failed = true;
            noexist._mockModule('noexist', ['callMe']);
            dependency = require('../../testdata/dep1');
            dependency.f();
            assert.ok(noexist._wasCalledWithArguments('callMe'), 'should have called callMe with no arguments');
            noexist._unmockModule('noexist');
            dependency = require('../../testdata/dep1');
            try {
                dependency.f();
            } catch(err) {
                failed = false;
            }
            assert.ok(!failed, 'Second attempt to require the module should have failed');
            noexist._mockModule('noexist', ['callMe']);
            dependency = require('../../testdata/dep1');
            dependency.f();
        });
        it('should be able to handle multiple modules independently', function () {
            var noexist = Mime.getMockedModuleMime('noexist'),
                other = Mime.getMockedModuleMime('other'),
                dependency;
            noexist._mockModule('noexist', ['callMe']);
            other._mockModule('other', ['callMe']);
            other._unmockModule('other');
            dependency = require('../../testdata/dep1');
            dependency.f();
            assert.ok(noexist._wasCalledWithArguments('callMe'), 'should have called callMe with no arguments');
            noexist._unmockModule('noexist');
        });
        it('allows adding functions to mocked dependencies', function () {
            var noexist = Mime.getMockedModuleMime('noexist'),
                dependency;
            noexist._mockModule('noexist', [{'callMe': function(){ return 'called me';}}]);
            dependency = require('../../testdata/dep2');
            assert.equal(dependency.f(), 'called me', 'Should have called our function');
            noexist._unmockModule('noexist');
        });
        it('allows adding attributes to mocked dependencies', function () {
            var noexist = Mime.getMockedModuleMime('noexist'),
                dependency;
            noexist._mockModule('noexist', [{'myAttribute': 'myValue'}]);
            dependency = require('../../testdata/dep3');
            assert.equal(dependency.f(), 'myValue', 'Should return our attribute value');
            noexist._unmockModule('noexist');
        });
        it('Should still track calls to the functions added', function () {
            var noexist = Mime.getMockedModuleMime('noexist'),
                dependency;
            noexist._mockModule('noexist', [{'callMe': function(){}}]);
            dependency = require('../../testdata/dep2');
            dependency.f();
            assert.ok(noexist._wasCalledWithArguments('callMe'), 'Should have tracked the call');
            noexist._unmockModule('noexist');
        });
        it('Should empty the call log after unmock', function () {
            var noexist = Mime.getMockedModuleMime('noexist'),
                dependency;
            noexist._mockModule('noexist', ['callMe']);
            dependency = require('../../testdata/dep2');
            dependency.f();
            assert.ok(noexist._wasCalledWithArguments('callMe'), 'log should contain an entry');
            noexist._unmockModule('noexist');
            assert.ok(!noexist._wasCalledWithArguments('callMe'), 'log should be empty');
        });
    });
    describe('_createClass', function () {
        it('Will return a class that inherits from Mime', function () {
            var mime = new Mime(),
                NewClass = mime._createClass(function () {}),
                newInstance;

            newInstance = new NewClass();
            assert.equal(typeof newInstance._createClass, 'function',
                'the newly created instance must have inherited from Mime');
        });
        it('Will log every time someone calls the constructor of a new class', function () {
            var mime = new Mime(),
                NewClass = mime._createClass(function () {}),
                newInstance;

            newInstance = new NewClass();
            assert.ok(mime._wasCalledWithArguments('Class'),
                'The constructor call should have been logged');
        });
        it('Will bind all instances of that class to the instance from which it was created', function () {
            var mime = new Mime(),
                NewClass = mime._createClass(function () {}),
                newInstance;

            newInstance = new NewClass();
            newInstance.doesNotExist();
            assert.ok(mime._wasCalledWithArguments('doesNotExist'),
                'Should have logged the call to the instance\'s undefined method with the original Mime instance');
        });
    });
    describe('_registerConstructor', function () {
        it('Will allow a mime attribute to contain a constructor function', function () {
            var mime = new Mime(),
                schema;
            mime._registerConstructor('Schema');
            mime.Schema = mime._createClass(function(){});
            schema = new mime.Schema();
            assert.equal(typeof schema, 'object',
                'new instance should be created');
            assert.equal(mime._getAllCallArguments('Class').length, 1,
                'Call to constructor registered');
        });
    });
    describe('Mime.require', function() {
        it('will defer to the standard require', function () {
            var assert = Mime.require('assert', require);
            assert.ok(true, 'will only reach here if it worked');
        });
    });
    describe('safeObject', function() {
        it('has a catchall function', function () {
            var Safe = safeObject(function () {}),
                safe = new Safe();
            safe.anything();
            assert.ok(true, 'will only reach here if it worked');
        });
    });
    describe('_sandboxRequire', function () {
        it('Should be able to intercept a dependency\'s require', function () {
            var mime, exports;
            mime = new Mime();
            mime._mockModule('something', ['callSomeFunction']);
            exports = mime._sandboxRequire('../../testdata/dep4', require);
            mime._unmockModule('something');
        });
        it('should work with getMockedModuleMime', function () {
            var mime, exports;
            mime = Mime.getMockedModuleMime('something');
            mime._mockModule('something', ['callSomeFunction']);
            exports = mime._sandboxRequire('../../testdata/dep4', require);
            mime._unmockModule('something');
        });
    });
});
