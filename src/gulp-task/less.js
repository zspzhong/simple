var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', function () {
    var fileList = [
        'src/**/static/css/*.less',
        'src/**/common/css/*.less'
    ];

    gulp.src(fileList)
        .pipe(less())
        .pipe(gulp.dest('src/'));
});