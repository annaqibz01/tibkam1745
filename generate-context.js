import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = 'context.txt';
const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.vscode', 'build', 'dist', '.next', 'coverage'
]);
const IGNORED_FILES = new Set([
  OUTPUT_FILE, 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'generate-context.js', 'generate-context.cjs', '.DS_Store'
]);
const VALID_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json', '.html'
]);

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.has(file)) {
        walkDir(fullPath, callback);
      }
    } else {
      if (!IGNORED_FILES.has(file) && VALID_EXTENSIONS.has(path.extname(file).toLowerCase())) {
        callback(fullPath);
      }
    }
  });
}

function generateContext() {
  const rootDir = process.cwd();
  let outputContent = `# FRONTEND REACT CONTEXT\n\n`;

  walkDir(rootDir, (filePath) => {
    const relPath = path.relative(rootDir, filePath);
    outputContent += `========================================\n`;
    outputContent += `FILE: ${relPath}\n`;
    outputContent += `========================================\n\n`;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      outputContent += content + `\n\n`;
    } catch (err) {
      outputContent += `[Gagal membaca file: ${err.message}]\n\n`;
    }
  });

  fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');
  console.log(`✅ Context React berhasil dibuat di: ${OUTPUT_FILE}`);
}

generateContext();