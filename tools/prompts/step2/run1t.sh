#!/bin/bash
# usage: run1t.sh <prompt-file> [timeout_s]  -> Grok Build one tiny step with a hard timeout
cd /workspace/sandstorm-step1
COMMON="Repo: /workspace/sandstorm-step1 (git worktree, branch step1-movement; three.js FPS, src/*.js, build: node tools/build.js). Focused minimal edit. Do NOT run browsers, playwright or test/, do NOT git commit, do not touch logs/, dist deploys, tools/meshy*, /workspace/starfall*. No paid/login services. Be quick: read only the line ranges you need (rg -n first), then edit."
n=$(basename $1 .txt)
timeout ${2:-900} ~/.grok/bin/grok --always-approve -p "$COMMON

TASK: $(cat $1)" > logs/grok-$n.log 2>&1
echo "EXIT $? $(date +%T)" >> logs/grok-$n.log
