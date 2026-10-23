# A27 winDbg overlay check (Oct 23 ~7:00 AM ET)

URL: `?bld=4&winDbg=1` — green placed, yellow inferred, red skipped; `SS.winDbg` counts.
Harness: `test/windbg-check.js` via `tools/run.sh`.

| tier | placed | inferred | skipped | artWindows | rooms | verdict |
|------|--------|----------|---------|------------|-------|---------|
| low  | 440    | 8        | 300     | 224        | 8     | PASS    |
| high | 632    | 22       | 94      | 327        | 6     | PASS    |

Logs: `logs/a27/windbg-low.log`, `logs/a27/windbg-high.log`
Shots: `logs/a27/windbg_{low,high}_facade{L,R}.png`

Eye check: colored rect overlays visible on art facades (green dominant on Low/High). windows.json counts 12/14/4/9 — provisional but placeable enough for rooms. Proceed to 4e1+.
