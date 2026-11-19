// Entry point for the GTA VI trophy guide.
// Copies app/ and screenshots/ into the output directory and writes
// /output/dossier.json from them with buildDossier (vendor/makefun-frontend.ts).
// The output directory is MAKEFUN_OUTPUT_DIR when set, otherwise /output.
// Run with Node 22:  MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = resolve(import.meta.dirname);
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

// The output directory is rebuilt from scratch every run so the result is
// deterministic (a stale file from an earlier run must never survive).
// The directory itself is never removed: in the grader it is a Docker bind
// mount, and removing a mount point fails. So create it when it is missing
// and empty only what is inside it, leaving the directory in place.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

// Copy app/ and screenshots/ beside this file into the output directory.
// cpSync refuses symlinks by default when dereference is false, which is what
// we want: the bounty forbids symlinks in app/.
for (const [src, dest] of [
  [appDir, join(outDir, 'app')],
  [shotsDir, join(outDir, 'screenshots')],
] as const) {
  const st = statSync(src);
  if (!st.isDirectory()) throw new Error(`${src} is not a directory`);
  cpSync(src, dest, { recursive: true, dereference: false });
}

// The dossier is built from the copied files, so dossier.json describes
// exactly what is handed in. Caps match the bounty: text 160 KiB, at most
// 4 screenshots of at most 256 KiB each, app/ at most 993 entries / 48 MiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`Wrote ${join(outDir, 'dossier.json')} (${dossier.length} bytes)`);
