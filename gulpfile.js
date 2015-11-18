require('./src/gulp-task/index.js');
var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('dev', function (callback) {
    runSequence('clean', 'less', 'jade-dev', 'html-dev', callback);
});

gulp.task('default', function (callback) {
    runSequence('clean', 'less', 'jade', 'html', callback);
});