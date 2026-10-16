#!/bin/bash
# Run after accepting Firebase terms at https://console.firebase.google.com
set -e; export PATH=$HOME/.local/bin:$PATH; cd "$(dirname "$0")"
ID=${1:-daily-games-rb-$(printf %04d $((RANDOM%10000)))}
true
firebase apps:create WEB "Daily Games" --project "$ID"
APP=$(firebase apps:list WEB --project "$ID" --json | python3 -c "import json,sys;print(json.load(sys.stdin)['result'][0]['appId'])")
CFG=$(firebase apps:sdkconfig WEB "$APP" --project "$ID" --json | python3 -c "import json,sys;print(json.dumps(json.load(sys.stdin)['result']['sdkConfig']))")
firebase firestore:databases:create "(default)" --location africa-south1 --project "$ID" || firebase firestore:databases:create "(default)" --location europe-west1 --project "$ID"
firebase deploy --only firestore:rules --project "$ID"
python3 - "$CFG" <<'PY'
import sys;s=open('index.html').read();s=s.replace('const FB_CONFIG=null;','const FB_CONFIG='+sys.argv[1]+';');open('index.html','w').write(s)
PY
echo "Project: $ID"
