var request = require('request');
var iconv = require('iconv-lite');
var async = require('async');
var _ = require('lodash');


console.log(iconv.encode('中文名', 'GBK').toString());