/** copy js to build dir **/
var _ = require('lodash');
var gulp = require('gulp');
var rename = require('gulp-rename');
var gulpWebpack = require('gulp-webpack');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var webpackConfig = require(process.cwd() + '/conf/webpackDevConfig');

gulp.task('js-build', function () {
    var webpackFileList = [
        'blog/static/js/blog.js',
        '51offer/static/js/index.jsx'
    ];
    var webpackFilter = filter(function (file) {
        return !_.isEmpty(_.filter(webpackFileList, function (item) {
            return _.contains(file.path, item);
        }));
    }, {restore: true});

    var fileList = [
        'src/**/static/js/*.js',
        'src/**/common/**/*.js'
    ];

    // 需要丑化的js filter, 因为js 使用es2015语法导致丑化报错
    var needUglify = filter(function (file) {
        return !_.contains(file.path, 'blogCatalog.js');
    }, {restore: true});

    return gulp.src(fileList, {base: 'src'})
        .pipe(webpackFilter)
        .pipe(gulpWebpack(webpackConfig))
        .pipe(webpackFilter.restore)

        .pipe(needUglify)
        .pipe(uglify({mangle: {except: ['require', 'exports', 'module', 'window', '$scope']}}))
        .pipe(needUglify.restore)

        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace('/static', '');
            path.extname = path.extname.replace('jsx', 'js');
            return path;
        }))
        .pipe(gulp.dest('build/'));
});