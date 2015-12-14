/** copy js to build dir **/
var _ = require('lodash');
var gulp = require('gulp');
var rename = require('gulp-rename');
var gulpWebpack = require('gulp-webpack');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');

gulp.task('js-build', function () {
    var webpackFileList = [
        'blog/static/js/blog.js',
        'spider/static/js/image.js'
    ];
    var webpackConfig = buildWebpackConf(webpackFileList);

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
        .pipe(gulpWebpack(webpackConfig))
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
        resolve: {
            root: [process.cwd() + '/component', process.cwd() + '/node_modules']
        },
        context: process.cwd() + '/src',
        entry: {},
        output: {
            filename: '[name]'
        }
    };

    _.each(fileList, function (item) {
        var name = item.replace('/static/', '/');
        config.entry[name] = './' + item;
    });

    return config;
}