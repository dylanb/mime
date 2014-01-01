app.all('/status', function(request, response) {
  var statusText;
  if (request.query.statusType === 'network') {
    statusText = getNetworkStatus();
  } else if (request.query.statusType === 'sensors') {
    statusText = getSensorsStatus();
  } else if (request.query.statusType === 'all') {
    statusText = getAllStatii();
  }
  response.setHeader('content-type', 'application/json');
  response.setHeader('cache-control', 'no-cache');
  response.write(statusText);
  response.end();
});
