var gulp = require('gulp');
var rename = require('gulp-rename');
var useRef = require('gulp-useref');
var filter = require('gulp-filter');
var jade = require('gulp-jade');
var data = require('gulp-data');

var replaceJadeDev = rename(function (path) {
    path.dirname = path.dirname.replace('jade-dev', 'jade');
    return path;
});

// 通过服务端render的jade模版, 从static/jade-dev -> static/jade, 同时处理js/css合并和压缩
gulp.task('jade-dev', function () {
    var assets = useRef.assets();
    var jadeFilter = filter('**/*.jade', {restore: true});
    var notJadeFilter = filter(['**/*', '!**/*.jade'], {restore: true});

    gulp.src(['src/**/static/jade-dev/*.jade'])
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