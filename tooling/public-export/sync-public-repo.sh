#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRIVATE_REPO="$(cd "${SCRIPT_DIR}/../.." && pwd)"

usage() {
  cat <<EOF
Sync the private SignalQL monorepo into a public checkout (allowlist, denylist,
overrides), then optionally create/update the GitHub repo and push main.

Usage:
  $(basename "$0") [--publish] <public_repo_path> [github_owner] [github_repo]

Arguments:
  public_repo_path   Directory for the public mirror (created if missing).
  github_owner       Default: signalql-org
  github_repo        Default: signalql-public

Options:
  --publish          After export, run publish-github.sh (needs GH_TOKEN or GITHUB_TOKEN).
  -h, --help         Show this help.

Environment (only for --publish):
  GH_TOKEN or GITHUB_TOKEN   GitHub PAT with repo (and read:org for org repos).

Examples:
  # Refresh files only (no GitHub)
  $(basename "$0") ~/Documents/DEV/signalql-public

  # Export + push to github.com/signalql-org/signalql-public
  GH_TOKEN=ghp_xxx $(basename "$0") --publish ~/Documents/DEV/signalql-public

  # Custom org/repo name on GitHub
  GH_TOKEN=ghp_xxx $(basename "$0") --publish ~/Dev/out my-org signalql

Private repo root (fixed from this script location):
  ${PRIVATE_REPO}
EOF
  exit "${1:-0}"
}

PUBLISH=false
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --publish)
      PUBLISH=true
      shift
      ;;
    -h | --help)
      usage 0
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage 1
      ;;
    *)
      POSITIONAL+=("$1")
      shift
      ;;
  esac
done

DST="${POSITIONAL[0]:-}"
OWNER="${POSITIONAL[1]:-signalql-org}"
REPO_NAME="${POSITIONAL[2]:-signalql-public}"

if [[ -z "${DST}" ]]; then
  usage 1
fi

mkdir -p "${DST}"
DST="$(cd "${DST}" && pwd)"

echo "==> Export: ${PRIVATE_REPO} -> ${DST}"
"${SCRIPT_DIR}/export-public.sh" "${PRIVATE_REPO}" "${DST}"

if [[ "${PUBLISH}" == true ]]; then
  echo "==> Publish: ${OWNER}/${REPO_NAME}"
  "${SCRIPT_DIR}/publish-github.sh" "${OWNER}" "${REPO_NAME}" "${DST}"
else
  echo "==> Skipped publish (pass --publish and GH_TOKEN to push to GitHub)."
fi

echo "Done."
