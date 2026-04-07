#!/usr/bin/env python3
"""Compose the modular ACU specification into a single acu.json.

Walks ``src/acu.json`` as the skeleton, resolves every ``$ref`` pointer
and known file-path values (strata entries, registry, *_ref), then writes
the fully inlined result to the project root as ``acu.json``.

Usage:
    python utils/compose-acu.py          # dry-run preview (stdout)
    python utils/compose-acu.py --write  # write acu.json to project root
"""

import argparse
import json
import sys
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parents[1]
SKELETON     = PROJECT_ROOT / "src" / "acu.json"
OUTPUT       = PROJECT_ROOT / "acu.json"

# ── Cache ────────────────────────────────────────────────────────────
# Loaded file contents keyed by relative path.  A value of ``None`` means
# "already attempted but missing" so we don't retry or re-warn.
_cache: dict[str, dict | list | None] = {}


def _load(ref_path: str) -> dict | list | None:
    """Load a JSON file (cached).  Returns ``None`` if missing."""
    if ref_path in _cache:
        return _cache[ref_path]

    target = PROJECT_ROOT / ref_path
    if not target.is_file():
        print(f"  ⚠  missing reference: {ref_path}", file=sys.stderr)
        _cache[ref_path] = None
        return None

    with open(target, encoding="utf-8") as fh:
        data = json.load(fh)
    _cache[ref_path] = data
    return data


def _looks_like_local_path(value) -> bool:
    """Return True if *value* looks like a relative path to a local .json file."""
    return (
        isinstance(value, str)
        and value.endswith(".json")
        and "/" in value
        and not value.startswith(("http://", "https://", "/"))
    )


def _inline(root_obj, depth: int = 0, stack: tuple[str, ...] = ()):
    """Recursively resolve every ``$ref`` and local JSON-path string value.

    *stack* tracks the current resolution chain so we can detect genuine
    circular references (A → B → A) while still allowing the same file to
    be referenced from multiple independent branches.
    """
    indent = "  " * depth

    # -- dict ----------------------------------------------------------
    if isinstance(root_obj, dict):
        # Sentinel dicts — don't recurse into their values
        if "$missing" in root_obj or "$circular_ref" in root_obj:
            return root_obj

        # Direct $ref — replace inline
        if "$ref" in root_obj and len(root_obj) == 1:
            ref_path = root_obj["$ref"]
            if not _looks_like_local_path(ref_path):
                return root_obj  # URL or absolute — keep as-is

            if ref_path in stack:
                return {"$circular_ref": ref_path}

            print(f"{indent}→ {ref_path}")
            loaded = _load(ref_path)
            if loaded is None:
                return {"$missing": ref_path}
            return _inline(loaded, depth, stack + (ref_path,))

        return {k: _inline(v, depth + 1, stack) for k, v in root_obj.items()}

    # -- list ----------------------------------------------------------
    if isinstance(root_obj, list):
        return [_inline(item, depth + 1, stack) for item in root_obj]

    # -- string that looks like a local .json path ---------------------
    if _looks_like_local_path(root_obj):
        if root_obj in stack:
            return {"$circular_ref": root_obj}
        loaded = _load(root_obj)
        if loaded is None:
            return {"$missing": root_obj}
        return _inline(loaded, depth, stack + (root_obj,))

    # -- primitive -----------------------------------------------------
    return root_obj


def _discover(src_dir: Path, base_ref: str) -> dict:
    """Auto-discover all ``.json`` files under *src_dir* and return a dict of
    ``$ref`` entries keyed by filename stem.

    Example: ``src/acu/paradigms/topology.json`` →
    ``{"topology": {"$ref": "src/acu/paradigms/topology.json"}}``
    """
    if not src_dir.is_dir():
        return {}

    entries = {}
    for f in sorted(src_dir.glob("*.json")):
        key = f.stem
        ref = f"{base_ref}/{f.name}"
        entries[key] = {"$ref": ref}
    return entries


def _inject_data(skeleton: dict) -> dict:
    """Auto-discover paradigms and satellite data, then place both under
    ``acu.data`` as sibling collections.

    Resulting structure::

        acu.data.paradigms.<stem>   ← from src/acu/paradigms/*.json
        acu.data.satellites.<stem>  ← from src/acu/data/satellites/*.json

    Merges into any pre-existing ``acu.data`` dict so manual entries are
    preserved alongside auto-discovered ones.
    """
    discoveries = {
        "paradigms": _discover(
            PROJECT_ROOT / "src" / "acu" / "data" / "paradigms",
            "src/acu/data/paradigms",
        ),
        "satellites": _discover(
            PROJECT_ROOT / "src" / "acu" / "data" / "satellites",
            "src/acu/data/satellites",
        ),
    }

    acu = skeleton.setdefault("acu", {})
    data_section = acu.setdefault("data", {})

    for collection_name, entries in discoveries.items():
        if entries:
            existing = data_section.get(collection_name, {})
            existing.update(entries)  # auto-discovered entries merge in
            data_section[collection_name] = existing

    return skeleton


def compose() -> dict:
    """Load the skeleton, auto-discover data collections, and return the
    fully inlined dict."""
    if not SKELETON.exists():
        print(f"Error: skeleton not found: {SKELETON}", file=sys.stderr)
        sys.exit(1)

    print(f"Loading skeleton: {SKELETON.relative_to(PROJECT_ROOT)}")
    with open(SKELETON, encoding="utf-8") as f:
        skeleton = json.load(f)

    skeleton = _inject_data(skeleton)
    return _inline(skeleton)


# ── CLI ──────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Compose modular ACU JSON into a single file."
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Write the composed output to acu.json in the project root.",
    )
    args = parser.parse_args()

    composed = compose()

    if args.write:
        with open(OUTPUT, "w", encoding="utf-8") as f:
            json.dump(composed, f, indent=2, ensure_ascii=False)
            f.write("\n")
        size = OUTPUT.stat().st_size
        print(f"\n✓  Wrote {OUTPUT.relative_to(PROJECT_ROOT)} ({size:,} bytes)")
    else:
        print(json.dumps(composed, indent=2, ensure_ascii=False))
        print(f"\n(Dry run — use --write to save)", file=sys.stderr)


if __name__ == "__main__":
    main()
