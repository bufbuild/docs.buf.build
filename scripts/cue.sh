#!/usr/bin/env bash
set -euo pipefail

# cue.sh
#
# SUMMARY
#
#   CUE utilities.

ROOT=$(git rev-parse --show-toplevel)
CUE_SOURCES="${ROOT}/data"
JSON_OUT="${ROOT}/src/data/docs.json"

list-docs-files() {
  find "${CUE_SOURCES}" -name '*.cue'
}

cmd_fmt() {
  list-docs-files | xargs cue fmt "$@"
}

cmd_list() {
  list-docs-files
}

cmd_fmt() {
  list-docs-files | xargs cue fmt "$@"
}

cmd_vet() {
  list-docs-files | xargs cue vet --concrete --all-errors "$@"
}

cmd_eval() {
  list-docs-files | xargs cue eval --concrete --all-errors "$@"
}

cmd_build() {
  # Display the CUE version for CI debugging purposes
  cue version

  # The docs JSON file needs to be removed or else CUE errors
  rm -f "${JSON_OUT}"

  # Build the docs JSON object out of the CUE sources
  list-docs-files | xargs cue export --all-errors "$@" --outfile "${JSON_OUT}"
}

cmd_help() {
  cat >&2 <<-EOF
Usage: make cue-COMMAND
Commands:
  build   - build all of the CUE sources and export them into a single JSON object 
  fmt     - format all CUE files using the built-in formatter
  list    - list all the documentation files
  vet     - check the documentation files and print errors
Examples:
  Write all CUE data as JSON to ${JSON_OUT}:
    make cue-build
  Reformat the CUE sources:
    make cue-fmt
EOF
}

usage() {
  cmd_help
  exit 1
}

MODE="${1:-}"
case "$MODE" in
  build|check|fmt|help|list|vet)
    shift
    "cmd_$MODE" "$@"
    ;;
  *)
    usage
    ;;
esac
