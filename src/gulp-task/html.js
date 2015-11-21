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
var blogIndex = require('../blog/blogIndex.js');

var replaceStatic = rename(function (path) {
    path.dirname = path.dirname.replace('/static', '');
    return path;
});

gulp.task('html', function () {
    var assets = useRef.assets();
    var jsFilter = filter(['**/*.js', '!**/*.min.js'], {restore: true});
    var cssFilter = filter('**/*.css', {restore: true});
    var htmlFilter = filter('**/*.html', {restore: true});
    var jadeFilter = filter('**/*.jade', {restore: true});

    var revAll = new RevAll({
        dontRenameFile: ['.html', '.jade'],
        prefix: 'http://s.amsimple.com'
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
});

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