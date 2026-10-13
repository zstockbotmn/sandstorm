#!/bin/sh
# Background any heavy job: tools/bg.sh <name> <seconds> cmd...  -> logs/<name>.log, prints pid. Check with AwaitShell/tail.
N=$1; T=$2; shift 2; mkdir -p logs
echo "== $(date) $(uptime)" > logs/$N.log; pgrep -fa 'chrome.*--headless|ss-harness|sg-harness|grok' | cut -c1-120 >> logs/$N.log
nohup timeout -k 10 "$T" "$@" >> logs/$N.log 2>&1 &
echo $!
