// One-shot: encrypts the report HTML with AES-GCM using a key derived from
// `username:password` via PBKDF2-SHA256. Outputs a JSON blob (salt, iv,
// ciphertext as base64) that the login page inlines and decrypts client-side.
import { readFile, writeFile } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';

const SRC = process.argv[2];
const OUT = process.argv[3] ?? 'encrypted.json';
const CREDENTIAL = process.argv[4] ?? 'harmoniq:matalanOut';
const ITERATIONS = 250_000;

if (!SRC) {
  console.error('usage: node build-encrypt.mjs <input.html> [out.json] [credential]');
  process.exit(1);
}

const plaintext = await readFile(SRC, 'utf8');
const enc = new TextEncoder();

const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));

const keyMaterial = await crypto.subtle.importKey(
  'raw', enc.encode(CREDENTIAL), { name: 'PBKDF2' }, false, ['deriveKey']
);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
  keyMaterial,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt']
);

const ciphertext = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv }, key, enc.encode(plaintext)
);

const toB64 = (buf) => Buffer.from(buf).toString('base64');
const payload = {
  v: 1,
  kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS },
  cipher: { name: 'AES-GCM', length: 256 },
  salt: toB64(salt),
  iv: toB64(iv),
  ct: toB64(new Uint8Array(ciphertext)),
};

await writeFile(OUT, JSON.stringify(payload));
console.log(`encrypted ${plaintext.length} chars -> ${OUT} (${payload.ct.length} b64 chars)`);
