#!/usr/bin/env node

/**
 * Search memories across all memory files
 * Usage: node search.mjs "query"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_DIR = path.join(process.env.HOME, '.openclaw', 'workspace', 'memory');

function getMemoryFiles() {
  if (!fs.existsSync(MEMORY_DIR)) {
    return [];
  }
  return fs.readdirSync(MEMORY_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse(); // Most recent first
}

function searchMemories(query) {
  if (!query || query.trim() === '') {
    console.error('Error: Please provide a search query');
    process.exit(1);
  }

  const files = getMemoryFiles();
  
  if (files.length === 0) {
    console.log('No memory files found.');
    return;
  }

  const queryLower = query.toLowerCase();
  let results = [];

  for (const file of files) {
    const filePath = path.join(MEMORY_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.toLowerCase().includes(queryLower)) {
        results.push({ file, line: line.trim() });
      }
    }
  }

  if (results.length === 0) {
    console.log(`No memories found matching: "${query}"`);
    return;
  }

  console.log(`Found ${results.length} result(s):\n`);
  for (const r of results) {
    console.log(`[${r.file}] ${r.line}`);
  }
}

// Get query from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node search.mjs "query"');
  process.exit(1);
}

searchMemories(args.join(' '));
