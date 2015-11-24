var _ = require('lodash');
var gulp = require('gulp');
var cssMin = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var htmlMin = require('gulp-htmlmin');
var useRef = require('gulp-useref');
var RevAll = require('gulp-rev-all');
var filter = require('gulp-filter');

gulp.task('html-build', function () {
    var fileList = [
        'src/**/static/**/*.html',
        'src/index.html'
    ];

    var replaceStatic = rename(function (path) {
        path.dirname = path.dirname.replace('/static', '');
        return path;
    });

    return gulp.src(fileList, {base: process.cwd() + '/src'})
        .pipe(replaceStatic)
        .pipe(gulp.dest('build/'));
});

gulp.task('html-dev', function () {
    var assets = useRef.assets();

    var fileList = [
        'build/**/*.html'
    ];

    return gulp.src(fileList, {base: 'build'})
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useRef())
        .pipe(gulp.dest('dev/'));
});

gulp.task('html', function () {
    var assets = useRef.assets();
    var jsFilter = filter(['**/*.js', '!**/*.min.js'], {restore: true});
    var cssFilter = filter('**/*.css', {restore: true});
    var htmlFilter = filter('**/*.html', {restore: true});

    var revAll = new RevAll({
        dontRenameFile: ['.html', '.jade'],
        dontUpdateReference: ['.html'],
        prefix: 'http://s.amsimple.com'
    });

    var fileList = [
        'build/**/*.html'
    ];

    return gulp.src(fileList, {base: process.cwd() + '/build'})
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
        .pipe(gulp.dest('release/'))

        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('release/'));
});