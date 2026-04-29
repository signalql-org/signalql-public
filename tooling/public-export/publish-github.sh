#!/usr/bin/env bash
set -euo pipefail

TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
OWNER="${1:-}"
REPO_NAME="${2:-}"
PUBLIC_DIR="${3:-}"

usage() {
  echo "Usage: GH_TOKEN=... $0 <github_owner> <repo_name> <path_to_public_repo_checkout>"
  echo "Example: GH_TOKEN=... $0 signalql-org signalql-public /Users/me/Dev/signalql-public"
  exit 1
}

[[ -n "${TOKEN}" ]] || {
  echo "Set GH_TOKEN or GITHUB_TOKEN"
  usage
}
[[ -n "${OWNER}" && -n "${REPO_NAME}" && -n "${PUBLIC_DIR}" ]] || usage
[[ -d "${PUBLIC_DIR}" ]] || {
  echo "Not a directory: ${PUBLIC_DIR}"
  exit 1
}

API_BASE="https://api.github.com"
AUTH_HEADER="Authorization: Bearer ${TOKEN}"
ACCEPT_HEADER="Accept: application/vnd.github+json"

exists_repo=$(curl -sS -o /tmp/gh_repo_check.json -w "%{http_code}" \
  -H "${AUTH_HEADER}" -H "${ACCEPT_HEADER}" \
  "${API_BASE}/repos/${OWNER}/${REPO_NAME}")

if [[ "${exists_repo}" == "404" ]]; then
  LOGIN=$(curl -sS -H "${AUTH_HEADER}" -H "${ACCEPT_HEADER}" "${API_BASE}/user" | python3 -c "import sys,json; print(json.load(sys.stdin).get('login',''))")
  ACCOUNT_TYPE=$(curl -sS -H "${AUTH_HEADER}" -H "${ACCEPT_HEADER}" "${API_BASE}/users/${OWNER}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('type',''))")

  if [[ "${ACCOUNT_TYPE}" == "Organization" ]]; then
    CREATE_URL="${API_BASE}/orgs/${OWNER}/repos"
  elif [[ "${LOGIN}" == "${OWNER}" ]]; then
    CREATE_URL="${API_BASE}/user/repos"
  else
    echo "Cannot create repo under ${OWNER}: not org admin or owner login mismatch."
    exit 1
  fi

  curl -sS -f -X POST \
    -H "${AUTH_HEADER}" \
    -H "${ACCEPT_HEADER}" \
    "${CREATE_URL}" \
    -d "{\"name\":\"${REPO_NAME}\",\"private\":false,\"auto_init\":false}" >/tmp/gh_create.json

  echo "Created GitHub repo ${OWNER}/${REPO_NAME}"
elif [[ "${exists_repo}" != "200" ]]; then
  echo "Unexpected GitHub API response checking repo: HTTP ${exists_repo}"
  cat /tmp/gh_repo_check.json
  exit 1
else
  echo "Repo ${OWNER}/${REPO_NAME} already exists"
fi

cd "${PUBLIC_DIR}"
git config user.email >/dev/null 2>&1 || git config user.email "signalql-bot@users.noreply.github.com"
git config user.name >/dev/null 2>&1 || git config user.name "SignalQL Release"

git branch -M main 2>/dev/null || true

git add -A
if git diff --cached --quiet && git diff --quiet; then
  echo "No changes to commit"
else
  git commit -m "Public SignalQL mirror"
fi

origin_url="https://x-access-token:${TOKEN}@github.com/${OWNER}/${REPO_NAME}.git"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "${origin_url}"
else
  git remote add origin "${origin_url}"
fi

git push -u origin main

git remote set-url origin "https://github.com/${OWNER}/${REPO_NAME}.git"

echo "Pushed to https://github.com/${OWNER}/${REPO_NAME}"

echo ""
echo "Optional: enable branch protection after CI has run at least once:"
echo "  gh api repos/${OWNER}/${REPO_NAME}/branches/main/protection -X PUT -f required_status_checks[strict]=true \\"
echo "    -f required_pull_request_reviews=null -f enforce_admins=false \\"
echo "    -f restrictions=null \\"
echo "    -F required_status_checks[contexts][]='Public CI / verify' \\"
echo "    -F required_status_checks[contexts][]='Public CI / secret-scan'"
