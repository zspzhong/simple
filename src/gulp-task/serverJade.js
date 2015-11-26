/** 处理服务器端使用的jade, 主要从jade-dev目录输出到jade目录, 并且处理好js, css合并以及引用+md5 **/
var gulp = require('gulp');
var rename = require('gulp-rename');
var useRef = require('gulp-useref');
var RevAll = require('gulp-rev-all');
var filter = require('gulp-filter');
var less = require('gulp-less');
var jade = require('gulp-jade');
var data = require('gulp-data');

var replaceJadeDev = rename(function (path) {
    path.dirname = path.dirname.replace('jade-dev', 'static/jade');
    return path;
});

// static/jade-dev/ copy to static/jade/
gulp.task('server-jade-copy', function () {
    return gulp.src(['src/**/static/jade-dev/*.jade'], {base: 'src'})
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace('/static', '');
            return path;
        }))
        .pipe(gulp.dest('build/'))
});

// 开发态
gulp.task('server-jade-dev', function () {
    var assets = useRef.assets();
    var jadeFilter = filter('**/*.jade', {restore: true});
    var notJadeFilter = filter(['**/*', '!**/*.jade'], {restore: true});

    return gulp.src(['build/**/jade-dev/*.jade'], {base: 'build'})
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
    var jadeFilter = filter('**/*.jade', {restore: true});
    var notJadeFilter = filter(['**/*', '!**/*.jade'], {restore: true});

    var revAll = new RevAll({
        dontRenameFile: ['.jade'],
        prefix: 'http://s.amsimple.com'
    });

    return gulp.src(['build/**/jade-dev/*.jade'], {base: 'build'})
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useRef())

        .pipe(revAll.revision())

        .pipe(jadeFilter)
        .pipe(replaceJadeDev)
        .pipe(gulp.dest('src/'))
        .pipe(jadeFilter.restore)

        .pipe(notJadeFilter)
        .pipe(gulp.dest('release/'));
});