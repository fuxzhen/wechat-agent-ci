---
name: memory
description: Persistent memory management for AI agents. Store, search, and recall memories across sessions.
homepage: 
metadata: {"clawdbot":{"emoji":"🧠","requires":{},"primaryEnv":""}}
---

# Memory Skill

Persistent memory management for AI agents. Stores memories in daily files and supports semantic search.

## Store a memory

```bash
node {baseDir}/scripts/store.mjs "memory text here"
```

Stores the memory with timestamp in today's daily memory file.

## Search memories

```bash
node {baseDir}/scripts/search.mjs "query"
```

Searches all memory files for relevant content. Returns matching lines with file context.

## List recent memories

```bash
node {baseDir}/scripts/list.mjs
node {baseDir}/scripts/list.mjs 7
```

Lists memories from today (or last N days). Shows date and preview.

## Read specific day

```bash
node {baseDir}/scripts/read.mjs
node {baseDir}/scripts/read.mjs 2026-02-20
```

Reads memory file for today (or specified date).

## Notes

- Memories stored in `~/.openclaw/workspace/memory/YYYY-MM-DD.md`
- Use this for: decisions, preferences, important context, things to remember
- Format: automatically adds timestamp and bullet point
- Search uses simple text matching (not semantic/AI)
