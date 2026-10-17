#!/bin/sh
# Sequential test suite on one tier: tools/suite.sh high|low [tests...] -> logs/suite-<tier>-<test>.log, summary in logs/suite.txt
Q=$1; shift; TESTS=${*:-"rules-test hit-test art-shots kill-art m1 stakes-shots ragdoll-shots soak fire-hold"}
for t in $TESTS; do
  SS_QS="&q=$Q" tools/run.sh 900 node test/$t.js > logs/suite-$Q-$t.log 2>&1; c=$?
  echo "$(date +%T) $Q $t exit=$c $(grep -E 'PASS|FAIL' logs/suite-$Q-$t.log | tail -1 | cut -c1-120)" >> logs/suite.txt
done
