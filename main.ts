// The Vacuum's Alibi — entry program.
//
// A robot vacuum's excuse lives in entry.txt next to this file. This
// program is the only thing the grader runs: it reads that line, checks
// it against the bounty gate, copies it to the output folder, and then
// proves the copy matches the original byte for byte.
//
// Run it outside the grader like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// It needs nothing but the Node standard library and no network at all.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function fail(message) {
  throw new Error(message);
}

function readEntryText() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, 'entry.txt');
  if (!existsSync(source)) {
    fail(`cannot find the entry text at ${source}`);
  }
  return { here, source, text: readFileSync(source, 'utf8') };
}

function checkGate(text) {
  // Count code points, not UTF-16 units, so an emoji would count once.
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    fail(`entry is ${chars} characters, but the gate wants 1 to 200`);
  }
  if (text.trim() === '') {
    fail('entry is blank');
  }
  // The bounty wants one line: a hidden line break would smuggle in a
  // second line, so reject any carriage return or newline outright.
  if (/[\r\n]/.test(text)) {
    fail('entry must be a single line with no line breaks');
  }
  return chars;
}

function main() {
  const { source, text } = readEntryText();
  const chars = checkGate(text);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const target = join(outDir, 'entry.txt');

  mkdirSync(outDir, { recursive: true });
  copyFileSync(source, target);

  const sha = (path) =>
    createHash('sha256').update(readFileSync(path)).digest('hex');
  if (sha(source) !== sha(target)) {
    fail('the copied entry does not match entry.txt');
  }
  console.log(
    `wrote ${target}: ${chars} characters, ` +
      `${Buffer.byteLength(text, 'utf8')} bytes, sha256 ${sha(target).slice(0, 16)}...`,
  );
}

main();
