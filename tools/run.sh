#!/bin/sh
# Run one test/render script on the shared box: waits while any other headless run is going (our tagged --ss-harness Chrome
# or the tester's headless Chrome), never runs in parallel unless SS_PAR is set, and caps wall-clock time (default 10 min). The script itself
# closes its browser on exit (tools/guard.js) and keeps a watchdog.
# Usage: tools/run.sh [seconds] node test/m3/checks.js
case "$1" in [0-9]*) T=$1; shift;; *) T=600;; esac
busy() { "$(dirname "$0")/busy.sh"; } # SS_PAR=2 (opt-in, tools/suite.sh -j2): up to 2 of our runs with CPU headroom
while busy; do echo "run.sh: another headless run is active ($(uptime | sed 's/.*load/load/')), waiting..." >&2; sleep 20; done
uptime >&2
timeout -k 10 "$T" "$@"
