require('blanket')({
  // Only files that match the pattern will be instrumented
  pattern: ['mime/mime.js', 'mime/sandbox.js']
});
