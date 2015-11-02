var gulp = require('gulp');
var cssMin = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var htmlMin = require('gulp-htmlmin');
var useRef = require('gulp-useref');
var RevAll = require('gulp-rev-all');
var filter = require('gulp-filter');
var less = require('gulp-less');
var del = require('del');

var replaceStatic = rename(function (path) {
    path.dirname = path.dirname.replace('/static', '');
    return path;
});

var replaceJadeDev = rename(function (path) {
    path.dirname = path.dirname.replace('jade-dev', 'jade');
    return path;
});

gulp.task('clean', function () {
    del.sync(['dev']);
    del.sync(['release']);
});

gulp.task('less', ['clean'], function () {
    gulp.src(['src/**/static/css/*.less'])
        .pipe(less())
        .pipe(gulp.dest('src/'));
});

gulp.task('jade', ['less'], jadeHandle());
gulp.task('jadeDev', ['less'], jadeHandle('dev'));

gulp.task('html-pro', ['jade'], function () {
    var assets = useRef.assets();
    var jsFilter = filter(['**/*.js', '!**/*.min.js'], {restore: true});
    var cssFilter = filter('**/*.css', {restore: true});
    var htmlFilter = filter('**/*.html', {restore: true});

    var revAll = new RevAll({
        dontRenameFile: ['.html'],
        prefix: 'http://www.amsimple.com'
    });

    gulp.src(['src/**/static/*.html', 'src/index.html'])
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
        .pipe(gulp.dest('release/'));
});

gulp.task('html-dev', ['jadeDev'], function () {
    var assets = useRef.assets();

    gulp.src(['src/**/static/*.html', 'src/index.html'])
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useRef())
        .pipe(replaceStatic)
        .pipe(gulp.dest('dev/'));
});

gulp.task('default', ['html-pro']);
gulp.task('dev', ['html-dev']);

function jadeHandle(env) {
    return function () {
        var assets = useRef.assets();
        var jsFilter = filter(['**/*.js', '!**/*.min.js'], {restore: true});
        var cssFilter = filter('**/*.css', {restore: true});
        var jadeFilter = filter('**/*.jade', {restore: true});
        var notJadeFilter = filter(['**/*', '!**/*.jade'], {restore: true});

        var prefix = 'http://www.amsimple.com';
        if (env === 'dev') {
            prefix = 'http://localhost:8001'
        }

        var revAll = new RevAll({
            dontRenameFile: ['.jade'],
            prefix: prefix
        });

        gulp.src(['src/**/static/jade-dev/*.jade'])
            .pipe(assets)
            .pipe(assets.restore())
            .pipe(useRef())

            .pipe(cssFilter)
            .pipe(cssMin())
            .pipe(cssFilter.restore)

            .pipe(jsFilter)
            .pipe(uglify({mangle: {except: ['require', 'exports', 'module', 'window', '$scope']}}))
            .pipe(jsFilter.restore)

            .pipe(revAll.revision())
            .pipe(jadeFilter)
            .pipe(replaceJadeDev)
            .pipe(gulp.dest('src/'))
            .pipe(jadeFilter.restore)
            .pipe(notJadeFilter)
            .pipe(gulp.dest('release/'))
            .pipe(gulp.dest('dev/'));
    };
}