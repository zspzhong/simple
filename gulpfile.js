var gulp = require('gulp');
var less = require('gulp-less');
var cssMin = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var htmlMin = require('gulp-htmlmin');
var del = require('del');

var dest = 'release/';

gulp.task('html', function () {
    gulp.src(['src/**/static/*.html'])
        .pipe(htmlMin({collapseWhitespace: true, removeComments: true}))
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace('/static', '');
            return path;
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('js', function () {
    gulp.src(['src/**/static/js/*.js'])
        .pipe(uglify({mangle: {except: ['require', 'exports', 'module', 'window', '$scope']}}))
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace('/static/', '/');
            path.extname = ".min" + path.extname;
            return path;
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('less', function () {
    gulp.src(['src/**/static/css/*.less', 'src/**/css/*.less'])
        .pipe(less())
        .pipe(cssMin())
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace('/static/', '/');
            path.extname = ".min" + path.extname;
            return path;
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('copy', function () {
    gulp.src(['src/global/3rd/**/*'])
        .pipe(rename(function (path) {
            path.dirname = 'global/3rd/' + path.dirname;
            return path;
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('clean', function (callback) {
    del(['build'], callback);
});

gulp.task('default', ['html', 'js', 'less', 'copy']);