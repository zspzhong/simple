#!/usr/bin/env bash
nohup node /root/simple/lib/runScript.js -c /root/simple/conf/script_config.json -a $1 1>>/root/simple/logs/script_access.log 2>>/root/simple/logs/script_error.log &