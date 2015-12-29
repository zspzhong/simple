var hl = require('highlight.js');
var tags = require('blog-tags');
var catalog = require('blog-catalog');

hl.initHighlightingOnLoad();

var blogTags = ['gulp', 'webpack', 'node', 'react', 'html', 'css', 'http'];
tags.init(document.getElementById('tags'), blogTags);

var blogList = [
    {
        link: './article/2015-12/blog-1.html',
        title: 'H5开发',
        time: '2015-12-21 22:48',
        preview: '最近配合市场部门做了几个H5营销小游戏, 本文记录一些常见小问题...'
    },
    {
        link: './article/2015-11/blog-3.html',
        title: '关于gulp构建',
        time: '2015-11-29 00:40',
        preview: '最近在弄blog站, 涉及到一些静态资源处理. 选择使用比较流行gulp来构建, 本文记录自己gulp task的组织方式, 以及过程中遇到的一些问题. 项目构建过程主要完成以下几点功能因为不同gulp task的流不能串起来, 如果不划分...'
    },
    {
        link: './article/2015-11/blog-2.html',
        title: 'gulp-useref不支持已压缩文件的解决办法',
        time: '2015-11-25 23:20',
        preview: '前段时间跟一个常年在国外的同事合作写几个小页面, 看他用的jade, 第一感觉: 清爽, 简洁, 美观. 刚好最近准备写博客, 所以打算用jade来写, 顺便学习一下jade语法.网站的前端文件通过gulp来构建, 自然就想到用gulp插件...'
    },
    {
        link: './article/2015-11/blog-1.html',
        title: '第一篇博客',
        time: '2015-11-10 22:20',
        preview: '留个白, 哪天来更新个人介绍...'
    }
];
catalog.init(document.getElementById('catalog'), blogList);