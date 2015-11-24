/** copy js to build dir **/
var gulp = require('gulp');
var rename = require('gulp-rename');

var replaceStatic = rename(function (path) {
    path.dirname = path.dirname.replace('/static', '');
    return path;
});

gulp.task('js-build', function () {
    var fileList = [
        'src/**/static/js/*.js',
        'src/**/common/**/*.js'
    ];

    return gulp.src(fileList)
        .pipe(replaceStatic)
        .pipe(gulp.dest('build/'));
});