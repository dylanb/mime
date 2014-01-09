var assert = require('assert'),
    Sandbox = require('../../mime/sandbox').Sandbox,
    requireLike = require('require-like');

describe('Sandbox', function () {
    describe('Sandbox.require', function () {
        var filename, sandbox, exports;

        beforeEach(function () {
            filename = require.resolve('../../testdata/sandbox1');
            sandbox = new Sandbox();
            exports = sandbox.require(filename)
        });
        it('should return the exports from a module you pass into it', function () {
            assert.ok(exports, 'exports should not be undefined');
            assert.ok(exports.someExport, 'exports should contain an attribute "someExport"');
        });
        it('the value in the exports\' attribute should be correct', function () {
            assert.equal(exports.someExport, 'somevalue', 'The value should be correct');
        });
        it('the function in the export attribute should be a function', function () {
            assert.equal(typeof exports.someFunction, 'function', 'Should be a function');
        });
        it('the function should return the correct scoped value', function () {
            assert.equal(exports.someFunction(), 6, 'Should be 6');
        });
    });
    describe('Sandbox.addGlobal', function () {
        it('should set globals with the specified names in the scope of the module', function () {
            var filename, sandbox, exports;

            filename = require.resolve('../../testdata/sandbox2');
            sandbox = new Sandbox();
            sandbox.addGlobal('testGlobal', '8');
            exports = sandbox.require(filename);
            assert.equal(exports, 8, 'should export the value of our testGlobal');
        });
        it('should be able to get a custom require', function () {
            var filename, sandbox, exports;

            filename = require.resolve('../../testdata/sandbox3'),
            sandbox = new Sandbox();
            sandbox.addGlobal(requireLike(filename, true));
            exports = sandbox.require(filename);
            assert.equal(exports.someFunction(), 6, 'Should be 6');
        });
    });
});
