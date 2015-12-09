var gulp = require('gulp');

gulp.task('copy', function () {
    return gulp.src('src/favicon.ico', {base: 'src'})
        .pipe(gulp.dest('dev/'))
        .pipe(gulp.dest('release/'));
});