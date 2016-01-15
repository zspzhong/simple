#!/usr/bin/env bash
node /root/simple/lib/webApp.js -c /root/simple/conf/webApp_config.json 1>../logs/webApp_access.log 2>../logs/webApp_error.log