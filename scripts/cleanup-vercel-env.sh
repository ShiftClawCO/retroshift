#!/bin/bash
# Cleanup old Vercel env vars and set new ones

set -e
cd /Users/shiftclaw/.openclaw/workspace/retroshift

PROJECT_ID="prj_Im9uYFMPD7VcSgdpByeTSmyOzt79"
TEAM_ID="team_3KYEiwuTybrx6AMBe9mRtJVd"
VERCEL_TOKEN=$(cat "$HOME/Library/Application Support/com.vercel.cli/auth.json" | grep '"token"' | cut -d'"' -f4)

echo "🗑️ Removing old environment variables..."

# Get all env vars
envs=$(curl -s "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN")

# Delete each one
echo "$envs" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for e in d.get('envs', []):
    print(e['id'])
" | while read env_id; do
    curl -s -X DELETE \
        "https://api.vercel.com/v10/projects/$PROJECT_ID/env/$env_id?teamId=$TEAM_ID" \
        -H "Authorization: Bearer $VERCEL_TOKEN" > /dev/null
    echo "  Deleted $env_id"
done

echo ""
echo "✅ All old env vars removed. Now run setup-vercel-env.sh"
