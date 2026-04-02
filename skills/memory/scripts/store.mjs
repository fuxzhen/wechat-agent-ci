#!/usr/bin/env node

/**
 * Store a memory in today's daily memory file
 * Usage: node store.mjs "memory text"
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

function getTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function ensureMemoryDir() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
}

function storeMemory(text) {
  if (!text || text.trim() === '') {
    console.error('Error: Please provide memory text');
    process.exit(1);
  }

  const date = getTodayDate();
  const timestamp = getTimestamp();
  const filePath = path.join(MEMORY_DIR, `${date}.md`);
  
  ensureMemoryDir();

  // Check if file exists, if not create with header
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf-8');
  } else {
    content = `# Memory - ${date}\n\n`;
  }

  // Append new memory
  const newEntry = `- [${timestamp}] ${text.trim()}\n`;
  content += newEntry;

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Memory saved to ${date}.md at ${timestamp}`);
  console.log(`  "${text}"`);
}

// Get text from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node store.mjs "memory text"');
  process.exit(1);
}

storeMemory(args.join(' '));
