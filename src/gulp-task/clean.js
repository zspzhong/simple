var gulp = require('gulp');
var del = require('del');

gulp.task('clean-all', ['clean-build', 'clean-dev', 'clean-release'], function (callback) {
    callback(null);
});

gulp.task('clean-build', function () {
    del.sync(['build']);
});

gulp.task('clean-dev', function () {
    del.sync(['dev']);
});

gulp.task('clean-release', function () {
    del.sync(['release']);
});