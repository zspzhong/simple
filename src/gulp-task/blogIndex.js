/** 针对blog index.jade 生成目录 **/
require(process.cwd() + '/lib/utils/globalExtend.js');

var fs = require('fs');
var glob = require('glob');
var jade = require('jade');
var _ = require('lodash');
var cheerio = require('cheerio');
var gulp = require('gulp');
var gulpJade = require('gulp-jade');
var data = require('gulp-data');
var rename = require('gulp-rename');

gulp.task('blog-build', function () {
    var replaceStatic = rename(function (path) {
        path.dirname = path.dirname.replace('/static', '');
        return path;
    });

    return gulp.src('src/blog/static/index.jade', {base: process.cwd() + '/src'})
        .pipe(data(function (file, callback) {
            indexData(callback);
        }))
        .pipe(gulpJade())
        .pipe(replaceStatic)
        .pipe(gulp.dest('build/'));
});


function indexData(callback) {
    var indexList = [];
    var src = process.cwd() + '/src/blog/static/**/*.jade';

    glob(src, function (err, files) {
        if (err) {
            callback(err);
            return;
        }

        _.each(files, function (item) {
            if (_.contains(item, 'static/index.jade')) {
                return;
            }

            indexList.push(_getInfo(item));
        });

        indexList = _.sortBy(indexList, function (item) {
            return -(new Date(item.time).getTime());
        });

        callback(null, {blogList: indexList});
    });

    function _getInfo(filePath) {
        var html = jade.renderFile(filePath);
        var $ = cheerio.load(html);

        var link = '.' + filePath.split('static')[1].replace('jade', 'html');
        var title = $(':header:first-child').text();
        var timeInPage = $('time').text();
        var time = (timeInPage ? new Date(timeInPage) : '') || fs.statSync(filePath).ctime;
        var preview = $('p').text().replace(/(\n\r)|(\n)/g, ' ').substring(0, 120) + '...';

        return {
            link: link,
            title: title,
            time: time.format('yyyy-MM-dd hh:mm'),
            preview: preview
        };
    }
}