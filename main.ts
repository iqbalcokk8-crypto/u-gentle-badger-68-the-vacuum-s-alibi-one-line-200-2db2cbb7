// The Vacuum's Alibi entry (Node 22, standard library only, no network).
//
// The finished line is entry.txt beside this file. It was written in this
// session as the entry itself: one line of at most 200 characters, the
// excuse a robot vacuum gives for missing a spot. This program copies it
// to the output directory and verifies the copy, so two runs write
// byte-identical output.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const source = join(root, 'entry.txt');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outDir, 'entry.txt');

if (!existsSync(source)) {
  throw new Error(`missing entry text: ${source}`);
}
const text = readFileSync(source, 'utf8');

// The gate: UTF-8 text of 1 to 200 characters, counted as Unicode code
// points, and not only white space.
const length = [...text].length;
if (length < 1 || length > 200) {
  throw new Error(`entry.txt is ${length} characters, outside the 1-200 limit`);
}
if (text.trim().length === 0) {
  throw new Error('entry.txt is only white space');
}

// The brief asks for a single line: no line break may hide inside the text.
if (/[\r\n]/.test(text)) {
  throw new Error('entry.txt must be a single line (no line breaks)');
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);

// Verify the copy is byte-identical to the source text.
const digest = (path: string): string =>
  createHash('sha256').update(readFileSync(path)).digest('hex');
if (digest(source) !== digest(target)) {
  throw new Error('output differs from entry.txt');
}
console.log(
  `wrote ${target} (${length} characters, ${Buffer.byteLength(text, 'utf8')} bytes, ` +
    `sha256 ${digest(target).slice(0, 16)}...)`,
);
