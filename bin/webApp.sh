#!/usr/bin/env bash
node /root/simple/lib/webApp.js -c /root/simple/conf/webAppConfig.json 1>../logs/webAppAccess.log 2>../logs/webAppError.log