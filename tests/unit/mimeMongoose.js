var assert = require('assert'),
    Mime = require('../../mime/mime').Mime,
    mongoose;

mongoose = global.mongoose = new Mime();
mongoose._spy('model', function() {
    return this._createClass(function() {
    });
  });
require('../../examplesrc/mongooseExample.js');

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
