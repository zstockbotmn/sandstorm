#!/bin/sh
# Sequential test suites (one browser at a time via tools/run.sh) -> logs/suite-<tag>-<test>.log, summary in logs/suite.txt
#   tools/suite.sh fast [tests...]          logic tests in ?test=fast (tiny flat render, identical logic) on the Low tier
#   tools/suite.sh visual high|low [tests]  the visual/perf set on a real tier (releases and visual changes)
#   tools/suite.sh release                  everything: fast set, then the FULL list on High and on Low
#   tools/suite.sh high|low [tests...]      (legacy) the full list on one real tier
FAST_TESTS="fast-parity rules-test hit-test fire-hold lowfps-hit waves restart waves-restart far-hit quality-pick waves-passive regen scope-switch scope-drag start-feedback m1v m1w aim-reg"
VISUAL_TESTS="art-shots kill-art title-layout stakes-shots ragdoll-shots feedback-shots m1 auto-tier"
ALL_TESTS="rules-test hit-test art-shots kill-art m1 stakes-shots ragdoll-shots soak fire-hold lowfps-hit waves restart waves-restart far-hit quality-pick feedback-shots waves-passive regen auto-tier title-layout scope-switch scope-drag start-feedback m1v m1w aim-reg"
run() { tag=$1; qs=$2; extra=$3; shift 3
  for t in "$@"; do
    SS_QS="$qs" SS_EXTRA="$extra" tools/run.sh 900 node test/$t.js > logs/suite-$tag-$t.log 2>&1; c=$?
    echo "$(date +%T) $tag $t exit=$c $(grep -E 'PASS|FAIL' logs/suite-$tag-$t.log | tail -1 | cut -c1-120)" >> logs/suite.txt
  done; }
M=$1; shift
case "$M" in
  fast) run fast "&q=low&test=fast" "&test=fast" ${*:-$FAST_TESTS} ;;
  visual) Q=$1; shift; run "$Q" "&q=$Q" "" ${*:-$VISUAL_TESTS} ;;
  release) run fast "&q=low&test=fast" "&test=fast" $FAST_TESTS; run high "&q=high" "" $ALL_TESTS; run low "&q=low" "" $ALL_TESTS ;;
  high|low) run "$M" "&q=$M" "" ${*:-$ALL_TESTS} ;;
  *) echo "usage: tools/suite.sh fast|visual high|low|release|high|low [tests...]" >&2; exit 2 ;;
esac
