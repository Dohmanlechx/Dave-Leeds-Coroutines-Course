#!/usr/bin/env node
// Serves the docs site the way it's actually published, so the offline search
// index exists (Docusaurus only generates it during a real build - the dev
// server has none). Builds once, serves the output, then rebuilds a couple of
// seconds after the CMS writes a note so saved lessons still show up.

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'docs-site');
const BUILD = path.join(SITE, 'build');
const STAGING = path.join(SITE, 'build-staging');
const WATCH_DIR = path.join(SITE, 'docs');

// Matches the CMS's DOCS_PORT default so its Preview links land here.
const PORT = process.env.DOCS_PORT || '3000';
const DEBOUNCE_MS = 2000;

function log(msg) {
  console.log(`[docs] ${msg}`);
}

function npmRun(script, extraArgs = []) {
  const args = ['--workspace', 'docs-site', 'run', script];
  if (extraArgs.length) args.push('--', ...extraArgs);
  // shell: true so this works with npm.cmd on Windows.
  return spawn('npm', args, { cwd: ROOT, stdio: 'inherit', shell: true });
}

function build() {
  return new Promise((resolve) => {
    // Build into a staging dir and swap it in, so the site being served is only
    // missing for the milliseconds of a rename instead of the whole rebuild.
    npmRun('build:staging').on('exit', (code) => {
      if (code !== 0) {
        log('build failed - the previously built site is still being served.');
        fs.rmSync(STAGING, { recursive: true, force: true });
        return resolve(false);
      }
      fs.rmSync(BUILD, { recursive: true, force: true });
      fs.renameSync(STAGING, BUILD);
      resolve(true);
    });
  });
}

let server = null;
let building = false;
let rebuildQueued = false;
let timer = null;

function scheduleRebuild() {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    if (building) {
      // A save landed mid-build; fold it into one more pass afterwards.
      rebuildQueued = true;
      return;
    }
    building = true;
    log('notes changed - rebuilding so search stays up to date...');
    await build();
    building = false;
    log(`ready on http://localhost:${PORT} - refresh the page.`);
    if (rebuildQueued) {
      rebuildQueued = false;
      scheduleRebuild();
    }
  }, DEBOUNCE_MS);
}

function shutdown() {
  clearTimeout(timer);
  if (server && server.pid && !server.killed) {
    if (process.platform === 'win32') {
      // The shell wrapper isn't the docusaurus process, so kill the whole tree.
      spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      server.kill('SIGTERM');
    }
  }
  process.exit(0);
}

async function main() {
  fs.rmSync(STAGING, { recursive: true, force: true });

  log('building the docs site (needed for search) - this takes a few seconds...');
  const ok = await build();
  if (!ok && !fs.existsSync(BUILD)) {
    log('nothing to serve. Fix the build error above and start again.');
    process.exit(1);
  }

  server = npmRun('serve:built', ['--port', PORT]);
  server.on('exit', (code) => {
    if (code !== 0) log(`the docs server exited with code ${code}.`);
    process.exit(code ?? 0);
  });

  fs.watch(WATCH_DIR, { recursive: true }, () => scheduleRebuild());
  log(`watching ${path.relative(ROOT, WATCH_DIR)} - saved notes rebuild automatically.`);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main();
