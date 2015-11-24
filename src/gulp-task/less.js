/** parse less to css output to build dir **/
var gulp = require('gulp');
var less = require('gulp-less');
var rename = require('gulp-rename');

var replaceStatic = rename(function (path) {
    path.dirname = path.dirname.replace('/static', '');
    return path;
});

gulp.task('less-build', function () {
    var fileList = [
        'src/**/static/css/*.less',
        'src/**/common/css/*.less',
        'src/**/static/css/*.css',
        'src/**/common/css/*.css'
    ];

    return gulp.src(fileList)
        .pipe(less())
        .pipe(replaceStatic)
        .pipe(gulp.dest('build/'));
});