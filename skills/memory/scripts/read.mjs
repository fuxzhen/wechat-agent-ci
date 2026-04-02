#!/usr/bin/env node

/**
 * Read memory file for a specific date
 * Usage: node read.mjs [YYYY-MM-DD]
 * Default: today
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_DIR = path.join(process.env.HOME, '.openclaw', 'workspace', 'memory');

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readMemory(date) {
  const filePath = path.join(MEMORY_DIR, `${date}.md`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`No memory file found for ${date}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(content);
}

// Get date from command line argument or use today
const args = process.argv.slice(2);
const date = args.length > 0 ? args[0] : getTodayDate();

// Validate date format
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('Error: Please provide date in YYYY-MM-DD format');
  process.exit(1);
}

readMemory(date);
