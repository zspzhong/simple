var _ = require('lodash');
var gulp = require('gulp');
var cssMin = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var htmlMin = require('gulp-htmlmin');
var useRef = require('gulp-useref');
var RevAll = require('gulp-rev-all');
var filter = require('gulp-filter');
var less = require('gulp-less');
var jade = require('gulp-jade');
var data = require('gulp-data');
var del = require('del');
var blogIndex = require('./src/blog/blogIndex.js');
var gulpSequence = require('gulp-sequence');

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

gulp.task('less', function () {
    var fileList = [
        'src/**/static/css/*.less',
        'src/**/common/css/*.less'
    ];

    gulp.src(fileList)
        .pipe(less())
        .pipe(gulp.dest('src/'));
});

// 通过服务端render的jade模版,从static/jade-dev -> static/jade, 同时处理js/css合并和压缩
gulp.task('jade', jadeHandle());
gulp.task('jadeDev', jadeHandle('dev'));

gulp.task('htmlPro', production);
gulp.task('htmlDev', function () {
    var assets = useRef.assets();
    var jadeFilter = filter('**/*.jade', {restore: true});

    var fileList = [
        'src/**/static/**/*.html',
        'src/index.html',
        'src/blog/**/*.jade',
        'src/**/static/*.jade'
    ];

    gulp.src(fileList, {base: 'src'})
        .pipe(jadeFilter)
        .pipe(data(blogIndexData))
        .pipe(jade())
        .pipe(jadeFilter.restore)
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useRef())
        .pipe(replaceStatic)
        .pipe(gulp.dest('dev/'));
});

gulp.task('default', function () {
    gulpSequence('clean', 'less', 'jade', 'htmlPro');
});

gulp.task('dev', function () {
    gulpSequence('clean', 'less', 'jadeDev', 'htmlDev');
});

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

function production() {
    var assets = useRef.assets();
    var jsFilter = filter(['**/*.js', '!**/*.min.js'], {restore: true});
    var cssFilter = filter('**/*.css', {restore: true});
    var htmlFilter = filter('**/*.html', {restore: true});
    var jadeFilter = filter('**/*.jade', {restore: true});

    var revAll = new RevAll({
        dontRenameFile: ['.html', '.jade'],
        prefix: 'http://localhost:8001'
    });

    var fileList = [
        'src/**/static/**/*.html',
        'src/index.html',
        'src/blog/**/*.jade',
        'src/**/static/*.jade'
    ];

    gulp.src(fileList, {base: process.cwd() + '/src'})
        .pipe(jadeFilter)
        .pipe(data(blogIndexData))
        .pipe(jade())
        .pipe(jadeFilter.restore)

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
        .pipe(gulp.dest('release/'))

        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('release/'));
}


function blogIndexData(file, callback) {
    if (!_.contains(file.path, 'index.jade')) {
        callback(null, {});
        return;
    }

    blogIndex.indexData(function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, {blogList: result});
    });
}