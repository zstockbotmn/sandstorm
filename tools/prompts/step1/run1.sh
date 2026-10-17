#!/bin/bash
# usage: run1.sh <prompt-file>  -> Grok Build one step, log to logs/grok-<name>.log
cd /workspace/sandstorm
COMMON="Repo: /workspace/sandstorm (Sandstorm, landscape mobile web FPS, three.js r186, src/*.js, built by node tools/build.js). Make a focused change. Do NOT run browsers, playwright or anything in test/ (a tester is using the machine), do NOT git commit, do not touch logs/, dist/ deploys, tools/meshy*, /workspace/starfall*. Do not call any paid or login services. You may run 'node tools/build.js' to check it compiles and run node scripts that do not launch a browser."
n=$(basename $1 .txt)
timeout 2400 ~/.grok/bin/grok --always-approve -p "$COMMON

TASK: $(cat $1)" > logs/grok-$n.log 2>&1
echo "EXIT $? $(date +%T)" >> logs/grok-$n.log
