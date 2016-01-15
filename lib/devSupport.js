/**
 * 仅仅是为了支持开发方便
 * */
var express = require('express');
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');
var config = require(global['rootDir'] + '/conf/webpackDevConfig');

exports.init = init;

function init(app) {
    if (global['mode'] !== 'dev') {
        return;
    }

    app.use(express.static(global['rootDir'] + '/dev'));
    app.use(webpackMiddleware(webpack(config), {noInfo: true}));
}