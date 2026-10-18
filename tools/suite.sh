#!/bin/bash
# Test suites -> logs/suite-<tag>-<test>.log, summary in logs/suite.txt. One browser at a time via tools/run.sh, unless -j2.
#   tools/suite.sh [-j2] fast [tests...]          logic tests in ?test=fast (tiny flat render, identical logic) on the Low tier
#   tools/suite.sh [-j2] logic [tests...]         logic tests in ?test=fast&norender (no GPU draw; matrices/LOD/LOS kept)
#   tools/suite.sh visual high|low [tests]        the visual/perf set on a real tier (releases and visual changes)
#   tools/suite.sh release                        everything: fast set, then the FULL list on High and on Low
#   tools/suite.sh high|low [tests...]            (legacy) the full list on one real tier
# -j2 (opt-in, default off): 2 tests at once when the box is free - only our own harness browsers, never next to a
# foreign headless Chrome, never two tests on one port, the 2nd starts only with >= 40% idle CPU (tools/busy.sh).
# SOLO tests (fps/timing-sensitive) always run alone.
FAST_TESTS="fast-parity rules-test hit-test fire-hold lowfps-hit waves restart waves-restart far-hit quality-pick waves-passive regen scope-switch scope-drag start-feedback m1v m1w m1x aim-reg"
# no-render logic set: everything in FAST_TESTS that reads no pixels and no fps (fast-parity validates the mode itself)
LOGIC_TESTS="rules-test hit-test fire-hold lowfps-hit waves restart waves-restart far-hit waves-passive regen scope-switch scope-drag m1w m1x aim-reg"
VISUAL_TESTS="art-shots kill-art title-layout stakes-shots ragdoll-shots feedback-shots m1 auto-tier"
ALL_TESTS="rules-test hit-test art-shots kill-art m1 stakes-shots ragdoll-shots soak fire-hold lowfps-hit waves restart waves-restart far-hit quality-pick feedback-shots waves-passive regen auto-tier title-layout scope-switch scope-drag start-feedback m1v m1w m1x aim-reg"
SOLO=" quality-pick auto-tier start-feedback m1v fast-parity soak "
PAR=1; if [ "$1" = "-j2" ]; then PAR=2; shift; fi
one() { local tag=$1 qs=$2 extra=$3 t=$4 s0=$(date +%s)
  SS_PAR=$PAR SS_QS="$qs" SS_EXTRA="$extra" tools/run.sh 900 node test/$t.js > logs/suite-$tag-$t.log 2>&1; local c=$?
  echo "$(date +%T) $tag $t exit=$c $(( $(date +%s) - s0 ))s $(grep -E 'PASS|FAIL' logs/suite-$tag-$t.log | tail -1 | cut -c1-120)" >> logs/suite.txt; }
portof() { local f=test/$1.js r; r=$(grep -oE "require\('\./[a-z0-9-]+\.js'\)" "$f" | head -1 | sed -E "s/.*\.\/([a-z0-9-]+)\.js.*/\1/"); [ -n "$r" ] && f=test/$r.js
  grep -oE "(listen\(|PORT = |127\.0\.0\.1:)[0-9]{4}" "$f" | grep -oE "[0-9]{4}" | head -1; }
run() { local tag=$1 qs=$2 extra=$3; shift 3
  if [ "$PAR" -le 1 ]; then for t in "$@"; do one "$tag" "$qs" "$extra" "$t"; done; return; fi
  local pend=("$@") solo=() t i; declare -A port; for t in "${pend[@]}"; do [[ "$SOLO" == *" $t "* ]] && solo+=("$t"); done
  pend=($(for t in "${pend[@]}"; do [[ "$SOLO" == *" $t "* ]] || echo "$t"; done))
  local busyP=(); # ports of running tests: files in a temp dir
  local D; D=$(mktemp -d)
  while [ ${#pend[@]} -gt 0 ]; do
    local n; n=$(ls "$D" | wc -l)
    if [ "$n" -lt "$PAR" ]; then local pick=-1
      for i in "${!pend[@]}"; do local pt; pt=$(portof "${pend[$i]}"); [ -e "$D/p$pt" ] || { pick=$i; break; }; done
      if [ "$pick" -ge 0 ] && { [ "$n" -eq 0 ] || ! SS_PAR=$PAR tools/busy.sh; }; then t=${pend[$pick]}; local pt; pt=$(portof "$t"); touch "$D/p$pt"
        ( one "$tag" "$qs" "$extra" "$t"; rm -f "$D/p$pt" ) & unset 'pend[pick]'; pend=("${pend[@]}"); sleep 8; continue; fi
    fi; sleep 4
  done; wait; rmdir "$D" 2>/dev/null
  for t in "${solo[@]}"; do one "$tag" "$qs" "$extra" "$t"; done; }
M=$1; shift
case "$M" in
  fast) run fast "&q=low&test=fast" "&test=fast" ${*:-$FAST_TESTS} ;;
  logic) run logic "&q=low&test=fast&norender" "&test=fast&norender" ${*:-$LOGIC_TESTS} ;;
  visual) Q=$1; shift; run "$Q" "&q=$Q" "" ${*:-$VISUAL_TESTS} ;;
  release) run fast "&q=low&test=fast" "&test=fast" $FAST_TESTS; run high "&q=high" "" $ALL_TESTS; run low "&q=low" "" $ALL_TESTS ;;
  high|low) run "$M" "&q=$M" "" ${*:-$ALL_TESTS} ;;
  *) echo "usage: tools/suite.sh [-j2] fast|logic|visual high|low|release|high|low [tests...]" >&2; exit 2 ;;
esac
