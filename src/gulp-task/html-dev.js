var _ = require('lodash');
var gulp = require('gulp');
var rename = require('gulp-rename');
var useRef = require('gulp-useref');
var filter = require('gulp-filter');
var less = require('gulp-less');
var jade = require('gulp-jade');
var data = require('gulp-data');
var blogIndex = require('../blog/blogIndex.js');

var replaceStatic = rename(function (path) {
    path.dirname = path.dirname.replace('/static', '');
    return path;
});

gulp.task('html-dev', function () {
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