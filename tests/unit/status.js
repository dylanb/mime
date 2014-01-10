var assert = require('assert'),
    Mime = require('../../mime/mime').Mime,
    statusCallback,
    app;

app = global.app = new Mime();
require('../../examplesrc/status.js');

// Fetch the callback
statusCallback = app._getCallArguments('all', 0)[1];

describe('status.js', function() {
    describe('Route registration', function() {
        it('Will register a callback function against the "/status" route', function () {
            assert.equal(app._getCallArguments('all', 0)[0], '/status',
                'Route must be registered');
        });
        it('Will not register any other routes', function () {
            assert.equal(app._getAllCallArguments('all').length, 1,
                'No other "all" routes registered');
            assert.equal(app._getAllCallArguments('get'), undefined,
                'No "get" routes registered');
            assert.equal(app._getAllCallArguments('post'), undefined,
                'No "post" routes registered');
        });
    });
    describe('Callback functionality', function() {
        var request, response, thisObject;
        beforeEach(function() {
            request = new Mime();
            response = new Mime();
            thisObject = new Mime();
        });
        it('Network status request will call the getNetworkStatus global, set the correct headers and call write and end', function () {
            // Setup the input data by addign it to our mock object
            request.query = { statusType : 'network' };
            
            global.getNetworkStatus = thisObject._spy('getNetworkStatus');
            statusCallback(request, response);

            // Test that getNetworkStatus was called
            assert.ok(thisObject._wasCalledWithArguments('getNetworkStatus'),
                'Should have called getNetworkStatus');
            assert.ok(response._wasCalledWithArguments('setHeader', 'content-type', 'application/json'),
                'Should have set the content-type header');
            assert.ok(response._wasCalledWithArguments('setHeader', 'cache-control', 'no-cache'),
                'Should have set the cache-control header');
            assert.ok(response._wasCalledWithArguments('write', undefined),
                'Should have called write');
            assert.ok(response._wasCalledWithArguments('end'), 'Should have called end');
        });
        it('Sensors status request will call the getSensorsStatus global', function () {
            request.query = { statusType : 'sensors' };
            global.getSensorsStatus = thisObject._spy('getSensorsStatus');
            statusCallback(request, response);
            assert.ok(thisObject._wasCalledWithArguments('getSensorsStatus'),
                'Should have called getSensorsStatus');
        });
        it('All status request will call the getAllStatii global', function () {
            request.query = { statusType : 'all' };
            global.getAllStatii = thisObject._spy('getAllStatii');
            statusCallback(request, response);
            assert.ok(thisObject._wasCalledWithArguments('getAllStatii'),
                'Should have called getAllStatii');
        });
    });
});
