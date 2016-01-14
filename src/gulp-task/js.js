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
        '51offer/static/js/index.jsx'
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

function buildWebpackConf(fileList) {
    var config = {
        resolve: {
            root: [process.cwd() + '/node_modules'] // 可配全局library目录
        },
        context: process.cwd() + '/src',
        entry: {},
        output: {
            filename: '[name]'
        },
        module: {
            loaders: [
                {test: /\.less$/, loaders: ['style', 'css', 'less']},
                {test: /(\.jsx$)|(\.js$)/, loaders: ['babel?presets[]=react&presets[]=es2015']}
            ]
        }
    };

    _.each(fileList, function (item) {
        var name = item.replace('/static/', '/');
        config.entry[name] = './' + item;
    });

    return config;
}