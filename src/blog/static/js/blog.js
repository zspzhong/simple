var hl = require('highlight.js');
var tags = require('blog-tags');
var catalog = require('blog-catalog');
var blogList = require('./blogCatalog.js');

hl.initHighlightingOnLoad();

var blogTags = ['gulp', 'webpack', 'node', 'react', 'html', 'css', 'http'];
tags.init(document.getElementById('tags'), blogTags);
catalog.init(document.getElementById('catalog'), blogList);