#!/usr/bin/env bash

set -euo pipefail

target_path="${1:-$PWD}"
overwrite="${2:-}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$target_path"
target_path="$(cd "$target_path" && pwd)"

for directory_name in SLIDE-md SLIDE-PATTERN; do
    source_path="$script_dir/$directory_name"
    destination_path="$target_path/$directory_name"

    if [ ! -d "$source_path" ]; then
        echo "Template source not found: $source_path" >&2
        exit 1
    fi

    if [ -e "$destination_path" ] && [ "$overwrite" != "--overwrite" ]; then
        echo "$destination_path already exists. Re-run with --overwrite to update existing files." >&2
        exit 1
    fi

    mkdir -p "$destination_path"
    cp -a "$source_path/." "$destination_path/"
    echo "[ok] $destination_path"
done

echo "SLIDE.md templates initialized."
