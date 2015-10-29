var gulp = require('gulp');
var cssMin = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var htmlMin = require('gulp-htmlmin');
var useRef = require('gulp-useref');
var RevAll = require('gulp-rev-all');
var filter = require('gulp-filter');
var del = require('del');

var assets = useRef.assets();
var replaceStatic = rename(function (path) {
    path.dirname = path.dirname.replace('/static', '');
    return path;
});

gulp.task('cleanRelease', function (callback) {
    del(['release']).then(function () {
        callback(null);
    });
});

gulp.task('html-pro', ['cleanRelease'], function () {
    var jsFilter = filter(['**/*.js', '!**/*.min.js'], {restore: true});
    var cssFilter = filter('**/*.css', {restore: true});
    var htmlFilter = filter('**/*.html', {restore: true});

    var write2Release = gulp.dest('release/');
    var revAll = new RevAll({
        dontRenameFile: ['.html'],
        prefix: 'http://www.amsimple.com'
    });

    gulp.src(['src/**/static/*.html'])
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useRef())

        .pipe(htmlFilter)
        .pipe(htmlMin({collapseWhitespace: true}))
        .pipe(htmlFilter.restore)

        .pipe(cssFilter)
        .pipe(cssMin())
        .pipe(cssFilter.restore)

        .pipe(jsFilter)
        .pipe(uglify({mangle: {except: ['require', 'exports', 'module', 'window', '$scope']}}))
        .pipe(jsFilter.restore)

        .pipe(revAll.revision())
        .pipe(replaceStatic)
        .pipe(write2Release);
});

gulp.task('cleanDev', function (callback) {
    del(['dev']).then(function () {
        callback(null);
    });
});

gulp.task('html-dev', ['cleanDev'], function () {
    var write2Dev = gulp.dest('dev');

    gulp.src(['src/**/static/*.html'])
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useRef())
        .pipe(replaceStatic)
        .pipe(write2Dev);
});

gulp.task('default', ['html-pro']);
gulp.task('dev', ['html-dev']);
