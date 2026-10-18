#!/bin/sh
# Is the shared box busy for a new headless test run?  exit 0 = busy (wait), 1 = free.
# SS_PAR unset/1 (default): busy while ANY headless Chrome runs (ours or the tester's) - strictly one at a time.
# SS_PAR=N (opt-in): up to N of OUR tagged harness browsers at once, never alongside a foreign headless Chrome, and only
# with CPU headroom (>= SS_PAR_IDLE % idle over 1 s, default 40).
P=${SS_PAR:-1}
if [ "$P" -le 1 ]; then pgrep -f -- '[-]-ss-harness' >/dev/null || pgrep -f -- 'chrom[e].*--headless' >/dev/null; exit $?; fi
ours=$(pgrep -f -- '[-]-ss-harness' | wc -l)
foreign=$(pgrep -af -- 'chrom[e].*--headless' | grep -v -- '--type=' | grep -vc -- '--ss-harness')
[ "$foreign" -gt 0 ] && exit 0
[ "$ours" -ge "$P" ] && exit 0
[ "$ours" -eq 0 ] && exit 1
idle() { awk '/^cpu /{print $5+$6, $2+$3+$4+$5+$6+$7+$8+$9}' /proc/stat; }
a=$(idle); sleep 1; b=$(idle)
pct=$(echo "$a $b" | awk '{d=$4-$2; print (d>0) ? int(100*($3-$1)/d) : 100}')
[ "$pct" -lt "${SS_PAR_IDLE:-40}" ] && exit 0
exit 1
