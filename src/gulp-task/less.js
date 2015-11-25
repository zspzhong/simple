/** parse less to css output to build dir **/
var gulp = require('gulp');
var less = require('gulp-less');
var rename = require('gulp-rename');
var filter = require('gulp-filter');

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
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace('/static', '');
            path.extname = '.css';
            return path;
        }))
        .pipe(gulp.dest('build/'));
});