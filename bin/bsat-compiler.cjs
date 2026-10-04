#!/usr/bin/env node

/**
 * BSAT Standalone TypeScript Compiler Executable
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const inputFile = args[0] || 'server/index.ts';
const outputDir = args[1] || 'dist-server';

console.log('====================================================');
console.log('⚡ BSAT Standalone TypeScript Compiler (.EXE)');
console.log('====================================================');
console.log(`[*] Input File : ${inputFile}`);
console.log(`[*] Output Dir : ${outputDir}`);

if (!fs.existsSync(inputFile)) {
  console.error(`[ERROR] Source file "${inputFile}" does not exist!`);
  process.exit(1);
}

try {
  const source = fs.readFileSync(inputFile, 'utf-8');
  console.log(`[*] Transpiling TypeScript code (${source.length} bytes)...`);

  // Basic Fast Transpiler without heavy external dependencies
  let js = source
    .replace(/(?:export\s+)?(?:interface|type)\s+[A-Za-z0-9_]+[\s\S]*?\{[\s\S]*?\}/g, '')
    .replace(/(?:export\s+)?type\s+[A-Za-z0-9_]+\s*=\s*[^;]+;/g, '')
    .replace(/\b(public|private|protected|readonly)\s+/g, '')
    .replace(/:\s*([A-Za-z0-9_<>[\]|&, ]+)(?=[=,);{])/g, '')
    .replace(/\s+as\s+[A-Za-z0-9_<>[\]|&'.]+/g, '');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outFile = path.join(outputDir, 'index.js');
  fs.writeFileSync(outFile, js, 'utf-8');

  console.log(`[OK] Successfully compiled to ${outFile}`);
  console.log('====================================================');
  process.exit(0);
} catch (err) {
  console.error('[ERROR] Compilation failed:', err.message);
  process.exit(1);
}
