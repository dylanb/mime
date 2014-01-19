var gulp = require('gulp'),
    exec = require('child_process').exec,
    cover = require('gulp-coverage'),
    mocha = require('gulp-mocha'),
    jshint = require('gulp-jshint');

gulp.task('default', function(){
  // place code for your default task here
  gulp.run('lint', 'mochaTest', 'docs');
});

gulp.task('lint', function () {
    gulp.src(['mime/*.js', 'examplesrc/*.js', 'tests/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
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
        .pipe(cover.instrument({
            pattern: ['**/mime/mime.js', '**/mime/sandbox.js'],
            debugDirectory: 'debug'
        }))
        .pipe(mocha({
            reporter: 'spec'
        }))
        .pipe(cover.report({
            outFile: 'coverage.html',
            reporter: 'html'
        }))
});

gulp.task('watch', function () {
    gulp.watch(['examplesrc/*.js', 'examplesrc/*.json', 'tests/unit/*.js', 'mime/*.js'], function(event) {
      console.log('File '+event.path+' was '+event.type+', running tasks...');
      gulp.run('mochaTest');
    });    
});
