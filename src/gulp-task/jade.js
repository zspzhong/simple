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

// 通过服务端render的jade模版, 从static/jade-dev -> static/jade, 同时处理js/css合并和压缩
gulp.task('jade', function () {
    var assets = useRef.assets();
    var jsFilter = filter(['**/*.js', '!**/*.min.js'], {restore: true});
    var cssFilter = filter('**/*.css', {restore: true});
    var jadeFilter = filter('**/*.jade', {restore: true});
    var notJadeFilter = filter(['**/*', '!**/*.jade'], {restore: true});

    var revAll = new RevAll({
        dontRenameFile: ['.jade'],
        prefix: 'http://www.amsimple.com'
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
        .pipe(gulp.dest('release/'));
});