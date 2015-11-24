/** parse jade to html output to build dir **/
var _ = require('lodash');
var gulp = require('gulp');
var rename = require('gulp-rename');
var jade = require('gulp-jade');

var replaceStatic = rename(function (path) {
    path.dirname = path.dirname.replace('/static', '');
    return path;
});

gulp.task('jade-build', function () {
    var fileList = [
        'src/**/static/**/*.jade',
        '!src/**/static/jade/*.jade',
        '!src/**/static/jade-dev/*.jade',
        '!src/blog/static/index.jade'
    ];

    return gulp.src(fileList, {base: process.cwd() + '/src'})
        .pipe(jade())
        .pipe(replaceStatic)
        .pipe(gulp.dest('build/'));
});