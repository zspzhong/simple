var gulp = require('gulp');
var runSequence = require('run-sequence');

require('./clean.js');
require('./less.js');
require('./jade.js');
require('./html.js');
require('./js.js');
require('./serverJade.js');
require('./blogIndex.js');

gulp.task('build', function (callback) {
    runSequence('clean-all', ['less-build', 'jade-build', 'html-build', 'js-build', 'blog-build'], callback);
});

gulp.task('dev', function (callback) {
    runSequence('build', 'html-dev', callback);
});

gulp.task('default', function (callback) {
    runSequence('build', 'html', 'clean-build', callback);
});