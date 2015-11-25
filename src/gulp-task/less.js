/** parse less to css output to build dir **/
var gulp = require('gulp');
var less = require('gulp-less');
var rename = require('gulp-rename');
var filter = require('gulp-filter');
var gulpCopy = require('gulp-copy');

var replaceStatic = rename(function (path) {
    path.dirname = path.dirname.replace('/static', '');
    return path;
});

gulp.task('css-copy', function () {
    var fileList = [
        'src/**/static/css/*.css',
        'src/common/**/*.css'
    ];

    return gulp.src(fileList, {base: 'src'})
        .pipe(gulpCopy('build/'));
});

gulp.task('less-build', ['css-copy'], function () {
    var fileList = [
        'src/**/static/css/*.less',
        'src/common/**/*.less'
    ];

    return gulp.src(fileList, {base: 'src'})
        .pipe(less())
        .pipe(replaceStatic)
        .pipe(gulp.dest('build/'));
});
