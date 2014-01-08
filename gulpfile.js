var gulp = require('gulp'),
    exec = require('child_process').exec,
    blanket = require('gulp-blanket-mocha');

gulp.task('default', function(){
  // place code for your default task here
  gulp.run('lint', 'mochaTest', 'docs');
});

gulp.task('docs', function () {
    exec('yuidoc -T simple --themedir ./doctheme', {}, function (error, stdout, stderr) {
        console.log('STDOUT');
        console.log(stdout);
        console.log('STDERR');
        console.log(stderr);
        if (error) {
            console.log('-------ERROR-------');
            console.log(error);
        }
    });
});

gulp.task('mochaTest', function () {
    gulp.src(['tests/**/*.js'], { read: false })
        .pipe(blanket({
            instrument:['mime/mime.js'],
            captureFile: 'coverage.html',
            coverage : {
                reporter: 'html-cov',
                quiet: true
            },
            test : {
                reporter: 'spec'
            }
        }))

});

gulp.task('watch', function () {
    gulp.watch(['examplesrc/*.js', 'examplesrc/*.json', 'tests/unit/*.js', 'mime/*.js'], function(event) {
      console.log('File '+event.path+' was '+event.type+', running tasks...');
      gulp.run('mochaTest');
    });    
});
