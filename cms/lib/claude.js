'use strict';

const { spawn } = require('child_process');

const BEGIN = '<<<REWRITE_BEGIN>>>';
const END = '<<<REWRITE_END>>>';

// Grammar/spelling fixing is a simple task — use the cheapest, fastest model.
// `haiku` is an alias the CLI resolves to the current Haiku, so it won't go stale.
// Override with CMS_REWRITE_MODEL (alias like `sonnet`, or a full model id) if needed.
const MODEL = process.env.CMS_REWRITE_MODEL || 'haiku';

const REWRITE_INSTRUCTION = [
  'You are a copy editor. Fix all grammar, spelling, and punctuation errors in the',
  'text between the markers below. Do NOT change the meaning, do NOT add or remove',
  'ideas, and do NOT rephrase beyond what is required for correctness. Preserve any',
  'Markdown formatting and fenced code blocks (including their contents) exactly as-is.',
  `Output ONLY the corrected text, wrapped exactly between a line containing ${BEGIN}`,
  `and a line containing ${END}. Do not include any explanation, notes, or diff before`,
  'or after the markers.',
].join(' ');

/**
 * Pull the corrected text out from between the sentinel markers. If the model
 * ignored the markers, fall back to the trimmed raw output.
 */
function extractCorrected(raw) {
  const start = raw.indexOf(BEGIN);
  const end = raw.lastIndexOf(END);
  if (start !== -1 && end !== -1 && end > start) {
    return raw.slice(start + BEGIN.length, end).replace(/^\n+/, '').replace(/\n+$/, '');
  }
  return raw.trim();
}

/**
 * Send text to the local `claude` CLI (`claude -p`) and return a grammar-corrected version.
 * The prompt is fed via stdin to avoid argument escaping/length issues.
 * Works on macOS and Windows (shell:true resolves `claude` vs `claude.cmd`).
 *
 * @param {string} text
 * @returns {Promise<string>}
 */
function rewrite(text) {
  return new Promise((resolve, reject) => {
    const prompt = `${REWRITE_INSTRUCTION}\n\n${BEGIN}\n${text}\n${END}`;

    let child;
    try {
      child = spawn('claude', ['-p', '--model', MODEL], { shell: true });
    } catch (err) {
      return reject(new Error(`Could not start the claude CLI: ${err.message}`));
    }

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('error', (err) => {
      reject(new Error(
        `Could not run the claude CLI. Make sure it is installed and on your PATH. (${err.message})`
      ));
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(extractCorrected(stdout));
      } else {
        reject(new Error(
          `claude CLI exited with code ${code}. ${stderr.trim() || 'No error output.'}`
        ));
      }
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

module.exports = { rewrite };
