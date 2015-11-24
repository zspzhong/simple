/** 处理服务器端使用的jade, 主要从jade-dev目录输出到jade目录, 并且处理好js, css合并以及引用+md5 **/
var gulp = require('gulp');
var cssMin = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var useRef = require('gulp-useref');
var RevAll = require('gulp-rev-all');
var filter = require('gulp-filter');
var less = require('gulp-less');
var jade = require('gulp-jade');
var data = require('gulp-data');

var replaceJadeDev = rename(function (path) {
    path.dirname = path.dirname.replace('jade-dev', 'jade');
    return path;
});

// static/jade-dev/ copy to static/jade/
gulp.task('server-jade-copy', function () {
    return gulp.src(['src/**/static/jade-dev/*.jade'])
        .pipe(replaceJadeDev)
        .pipe(gulp.dest('src/'))
});

// 开发态
gulp.task('server-jade-dev', function () {
    var assets = useRef.assets();
    var jadeFilter = filter('**/*.jade', {restore: true});
    var notJadeFilter = filter(['**/*', '!**/*.jade'], {restore: true});

    return gulp.src(['src/**/static/jade/*.jade'])
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useRef())

        .pipe(jadeFilter)
        .pipe(replaceJadeDev)
        .pipe(gulp.dest('src/'))
        .pipe(jadeFilter.restore)
        .pipe(notJadeFilter)
        .pipe(gulp.dest('dev/'));
});

// 处理js/css合并, +md5
gulp.task('server-jade', function () {
    var assets = useRef.assets();
    var jsFilter = filter(['**/*.js', '!**/*.min.js'], {restore: true});
    var cssFilter = filter('**/*.css', {restore: true});
    var jadeFilter = filter('**/*.jade', {restore: true});
    var notJadeFilter = filter(['**/*', '!**/*.jade'], {restore: true});

    var revAll = new RevAll({
        dontRenameFile: ['.jade'],
        prefix: 'http://s.amsimple.com'
    });

    return gulp.src(['src/**/static/jade/*.jade'])
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
        .pipe(gulp.dest('release/'));
});