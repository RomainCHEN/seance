#!/bin/bash
# Helpers around `orca computer` for driving Brave (com.brave.Browser).
#
# Lessons baked in here:
#  - element indexes go stale fast, so every action re-reads state and resolves
#    the target element in the SAME call;
#  - `orca computer` occasionally returns empty output, so reads are retried;
#  - python programs are passed with -c (never via a stdin heredoc that would
#    also be the data pipe).
set -uo pipefail
APP="com.brave.Browser"
TMPD="$(mktemp -d)"
trap 'rm -rf "$TMPD"' EXIT

read_state() { # $1 = output file
  local out i
  for i in 1 2 3 4 5 6 7 8; do
    out=$(orca computer get-app-state --app "$APP" --no-screenshot --json 2>/dev/null)
    case "$out" in
      *'"ok": true'*) printf '%s' "$out" > "$1"; return 0;;
    esac
    # AX sometimes loses the window entirely; activating the app re-registers it.
    if [ "$i" = 3 ] || [ "$i" = 6 ]; then
      osascript -e 'tell application "Brave Browser" to activate' >/dev/null 2>&1
      sleep 1.5
    fi
    sleep 1.2
  done
  printf '%s' "$out" > "$1"
  return 1
}

title() { # $1 = state file
  python3 -c '
import json,sys
d=json.load(open(sys.argv[1]))
r=d.get("result") or {}
if not d.get("ok"):
    print("ERROR:", (d.get("error") or {}).get("code")); raise SystemExit
print(((r.get("snapshot") or {}).get("window") or {}).get("title") or "")
' "$1"
}

dump_tree() { # $1 = state file
  python3 -c '
import json,sys
d=json.load(open(sys.argv[1]))
r=d.get("result") or {}
if not d.get("ok"):
    print("ERROR", json.dumps(d.get("error"), ensure_ascii=False)); raise SystemExit
snap=r.get("snapshot") or {}
print("TITLE:", (snap.get("window") or {}).get("title"))
t=snap.get("treeText") or ""
i=t.find("pop up button Tab search")
print(t[:i] if i>0 else t)
' "$1"
}

resolve() { # $1=state file, $2=regex, $3=nth
  python3 -c '
import json,sys,re
d=json.load(open(sys.argv[1]))
pat=sys.argv[2]; nth=int(sys.argv[3])
t=((d.get("result") or {}).get("snapshot") or {}).get("treeText","")
rx=re.compile(pat)
hits=[]
for line in t.splitlines():
    m=re.match(r"\s*(\d+)\s+(.*)$", line)
    if m and rx.search(m.group(2)):
        hits.append((m.group(1), m.group(2)[:120]))
if not hits:
    print("NOMATCH"); raise SystemExit
if len(hits) >= nth:
    print(hits[nth-1][0])
else:
    print("NOMATCH")
' "$1" "$2" "$3"
}

filter_tree() { # $1=state file, $2=regex
  python3 -c '
import json,sys,re
d=json.load(open(sys.argv[1]))
t=((d.get("result") or {}).get("snapshot") or {}).get("treeText","")
print("TITLE:", (((d.get("result") or {}).get("snapshot") or {}).get("window") or {}).get("title"))
rx=re.compile(sys.argv[2], re.I)
for line in t.splitlines():
    if rx.search(line): print(line.rstrip()[:180])
' "$1" "$2"
}

case "${1:-}" in
  nav)
    open -a "Brave Browser" "$2"
    sleep "${3:-7}"
    S="$TMPD/s.json"; read_state "$S"; dump_tree "$S"
    ;;
  title)
    S="$TMPD/s.json"; read_state "$S"; title "$S"
    ;;
  tree)
    S="$TMPD/s.json"; read_state "$S"
    if [ -n "${2:-}" ]; then filter_tree "$S" "$2"; else dump_tree "$S"; fi
    ;;
  find)
    S="$TMPD/s.json"; read_state "$S"; filter_tree "$S" "$2"
    ;;
  click)
    S="$TMPD/s.json"; read_state "$S"
    echo "TITLE-BEFORE: $(title "$S")"
    idx=$(resolve "$S" "$2" "${3:-1}")
    if [ "$idx" = "NOMATCH" ] || [ -z "$idx" ]; then echo "NOMATCH for: $2"; exit 1; fi
    echo "CLICK index=$idx pattern=$2"
    orca computer click --app "$APP" --element-index "$idx" --no-screenshot --json 2>&1 | python3 -c '
import json,sys
raw=sys.stdin.read()
try: d=json.loads(raw)
except Exception: print("click raw:",raw[:300]); raise SystemExit
a=(d.get("result") or {}).get("action") or {}
v=a.get("verification") or {}
print("click ok:",d.get("ok"),"verification:",v.get("state"),v.get("reason") or "")
if not d.get("ok"): print("err:",json.dumps(d.get("error"),ensure_ascii=False)[:300])
'
    sleep "${4:-3}"
    S2="$TMPD/s2.json"; read_state "$S2"; echo "TITLE-AFTER: $(title "$S2")"
    ;;
  fill)
    S="$TMPD/s.json"; read_state "$S"
    idx=$(resolve "$S" "$2" "${4:-1}")
    if [ "$idx" = "NOMATCH" ] || [ -z "$idx" ]; then echo "NOMATCH for: $2"; exit 1; fi
    echo "FILL index=$idx pattern=$2"
    printf '%s' "$3" | orca computer set-value --app "$APP" --element-index "$idx" --value-stdin --no-screenshot --json 2>&1 | python3 -c '
import json,sys
raw=sys.stdin.read()
try: d=json.loads(raw)
except Exception: print("fill raw:",raw[:300]); raise SystemExit
a=(d.get("result") or {}).get("action") or {}
v=a.get("verification") or {}
print("fill ok:",d.get("ok"),"verification:",v.get("state"),v.get("reason") or "")
if not d.get("ok"): print("err:",json.dumps(d.get("error"),ensure_ascii=False)[:300])
'
    ;;
  key)
    orca computer press-key --app "$APP" --key "$2" --no-screenshot --json 2>&1 | python3 -c '
import json,sys
raw=sys.stdin.read()
try: d=json.loads(raw)
except Exception: print("key raw:",raw[:200]); raise SystemExit
print("key ok:",d.get("ok"))
'
    ;;
  hotkey)
    orca computer hotkey --app "$APP" --key "$2" --no-screenshot --json 2>&1 | python3 -c '
import json,sys
raw=sys.stdin.read()
try: d=json.loads(raw)
except Exception: print("hotkey raw:",raw[:200]); raise SystemExit
print("hotkey ok:",d.get("ok"))
'
    ;;
  shot)
    screencapture -x -t png "$2"; echo "$2"
    ;;
  *)
    echo "usage: $0 {nav <url> [sleep]|title|tree [regex]|find <regex>|click <regex> [nth] [sleep]|fill <regex> <value> [nth]|key <KEY>|hotkey <CHORD>|shot <file>}"; exit 1;;
esac
