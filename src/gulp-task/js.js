/** copy js to build dir **/
var _ = require('lodash');
var gulp = require('gulp');
var rename = require('gulp-rename');
var webpack = require('gulp-webpack');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');

var webpackFileList = [
    'src/blog/static/js/blog.js',
    'src/spider/static/js/image.js'
];
var webpackConfig = buildWebpackConf(webpackFileList);

gulp.task('js-build', function () {
    var webpackFilter = filter(function (file) {
        return !_.isEmpty(_.filter(webpackFileList, function (item) {
            return _.contains(file.path, item);
        }));
    }, {restore: true});

    var fileList = [
        'src/**/static/js/*.js',
        'src/**/common/**/*.js'
    ];

    return gulp.src(fileList, {base: 'src'})
        .pipe(webpackFilter)
        .pipe(webpack(webpackConfig))
        .pipe(webpackFilter.restore)

        .pipe(uglify({mangle: {except: ['require', 'exports', 'module', 'window', '$scope']}}))
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace('/static', '');
            return path;
        }))
        .pipe(gulp.dest('build/'));
});


function buildWebpackConf(fileList) {
    var config = {
        entry: {},
        output: {
            filename: '[name]'
        }
    };

    _.each(fileList, function (item) {
        var name = item.replace('/static/', '/').replace('src/', '');
        config.entry[name] = './' + item;
    });

    return config;
}