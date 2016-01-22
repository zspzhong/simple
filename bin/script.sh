#!/usr/bin/env bash
nohup node /root/simple/lib/runScript.js -c /root/simple/conf/scriptConfig.json -a $1 1>>/root/simple/logs/scriptAccess.log 2>>/root/simple/logs/scriptError.log &