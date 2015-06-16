module.exports = function (grunt) {
    var gruntConfig = {
        less: {
            module: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['**/static/css/*.less'],
                        dest: 'src',
                        ext: '.css'
                    }
                ]
            }
        },
        cssmin: {
            global: {
                files: {
                    'release/global/css/global.min.css': ['src/global/*.css']
                }
            },
            module: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ["**/static/css/*.css"],
                        dest: 'release',
                        ext: '.min.css',
                        rename: clipStaticPath
                    }
                ]
            }
        },
        htmlmin: {
            options: {
                removeComments: true,
                removeCommentsFromCDATA: true,
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true
            },
            module: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ["**/static/*.html"],
                        dest: 'release',
                        ext: '.html',
                        rename: clipStaticPath
                    }
                ]
            }
        },
        uglify: {
            global: {
                options: {
                    mangle: {
                        except: ['require', 'exports', 'module', 'window', '$scope']
                    }
                },
                files: {
                    'release/global/js/global.min.js': ['src/global/*.js']
                }
            },
            module: {
                options: {
                    mangle: {
                        except: ['require', 'exports', 'module', 'window', '$scope']
                    }
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ["**/static/js/*.js"],
                        dest: 'release',
                        ext: '.min.js',
                        rename: clipStaticPath
                    }
                ]
            }
        },
        copy: {
            html: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['**/static/*.html'],
                        dest: 'dev',
                        rename: clipStaticPath
                    }
                ]
            },
            js: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['**/static/js/*.js'],
                        dest: 'dev',
                        ext: '.min.js',
                        rename: clipStaticPath
                    },
                    {
                        expand: true,
                        cwd: 'release',
                        src: ['global/js/*.js'],
                        dest: 'dev'
                    }
                ]
            },
            css: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['**/static/css/*.css'],
                        dest: 'dev',
                        ext: '.min.css',
                        rename: clipStaticPath
                    },
                    {
                        expand: true,
                        cwd: 'release',
                        src: ['global/css/*.css'],
                        dest: 'dev'
                    }
                ]
            }
        }
    };

    grunt.initConfig(gruntConfig);

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['less', 'cssmin', 'htmlmin', 'uglify']);
    grunt.registerTask('dev', ['copy']);
};

// 从src拷贝到部署目录时，去掉中间的static路径
function clipStaticPath(target, src) {
    var arr = src.split('/');

    for (var i = 0, j = 0; i < arr.length; i++) {
        var item = arr[i - j];
        if (item === 'static') {
            arr.splice(i - j, 1);
            j++;
        }
    }

    var splicePath = arr.join('/');
    return target + '/' + splicePath;
}