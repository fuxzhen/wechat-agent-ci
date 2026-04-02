#!/usr/bin/env node

/**
 * List recent memories
 * Usage: node list.mjs [days]
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

function getDates(days) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

function listMemories(days = 1) {
  const files = getMemoryFiles();
  const targetDates = getDates(days);
  
  if (files.length === 0) {
    console.log('No memories found.');
    return;
  }

  let hasResults = false;
  
  for (const file of files) {
    const date = file.replace('.md', '');
    if (!targetDates.includes(date)) continue;
    
    const filePath = path.join(MEMORY_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim().startsWith('- ['));

    if (lines.length > 0) {
      hasResults = true;
      console.log(`\n=== ${date} (${lines.length} memories) ===`);
      for (const line of lines) {
        console.log(line);
      }
    }
  }

  if (!hasResults) {
    console.log(`No memories in the last ${days} day(s).`);
  }
}

// Get days from command line argument
const args = process.argv.slice(2);
const days = args.length > 0 ? parseInt(args[0], 10) : 1;

listMemories(days);
