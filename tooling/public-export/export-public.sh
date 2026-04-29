#!/usr/bin/env bash
set -euo pipefail

SRC="${1:-$(pwd)}"
DST="${2:-}"

if [[ -z "${DST}" ]]; then
  echo "Usage: $0 <source_repo_path> <destination_repo_path>"
  exit 1
fi

ALLOWLIST="${SRC}/tooling/public-export/allowlist.txt"
DENYLIST="${SRC}/tooling/public-export/denylist.txt"

if [[ ! -f "${ALLOWLIST}" ]]; then
  echo "Missing allowlist: ${ALLOWLIST}"
  exit 1
fi

if [[ ! -f "${DENYLIST}" ]]; then
  echo "Missing denylist: ${DENYLIST}"
  exit 1
fi

mkdir -p "${DST}"
rsync -a --delete "${SRC}/" "${DST}/" --exclude='*'

while IFS= read -r entry || [[ -n "${entry}" ]]; do
  [[ -z "${entry}" ]] && continue
  mkdir -p "${DST}/$(dirname "${entry}")"
  rsync -a "${SRC}/${entry}" "${DST}/${entry}"
done < "${ALLOWLIST}"

while IFS= read -r entry || [[ -n "${entry}" ]]; do
  [[ -z "${entry}" ]] && continue
  rm -rf "${DST}/${entry}"
done < "${DENYLIST}"

if [[ -d "${SRC}/tooling/public-export/overrides" ]]; then
  rsync -a "${SRC}/tooling/public-export/overrides/" "${DST}/"
fi

echo "Public export synced to: ${DST}"
