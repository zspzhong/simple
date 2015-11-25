/** parse less to css output to build dir **/
var gulp = require('gulp');
var less = require('gulp-less');
var rename = require('gulp-rename');
var filter = require('gulp-filter');

var replaceStatic = rename(function (path) {
    path.dirname = path.dirname.replace('/static', '');
    return path;
});

gulp.task('less-build', function () {
    var lessFilter = filter('*.less', {restore: true});

    var fileList = [
        'src/common/**/*.less',
        'src/**/static/css/*.less',
        'src/**/static/css/*.css',
        'src/common/**/*.css'
    ];

    return gulp.src(fileList, {base: 'src'})
        .pipe(lessFilter)
        .pipe(less())
        .pipe(lessFilter.restore)
        .pipe(replaceStatic)
        .pipe(gulp.dest('build/'));
});