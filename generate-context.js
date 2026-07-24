import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = 'contexts';
const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.vscode', 'build', 'dist', '.next', 'coverage', 'target', 'src-tauri', OUTPUT_DIR
]);
const IGNORED_FILES = new Set([
  'package-lock.json', 'cargo.lock', 'yarn.lock', 'pnpm-lock.yaml', 
  'generate-context.js', 'generate-context.cjs', '.DS_Store', 'context.txt'
]);
const VALID_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json', '.html', '.rs', '.toml'
]);

// Mapping ekstensi ke bahasa Markdown
const LANG_MAP = {
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.css': 'css',
  '.scss': 'scss',
  '.json': 'json',
  '.html': 'html',
  '.rs': 'rust',
  '.toml': 'toml'
};

// 1. Inisialisasi & pembersihan folder output
if (fs.existsSync(OUTPUT_DIR)) {
  fs.readdirSync(OUTPUT_DIR).forEach(file => {
    fs.unlinkSync(path.join(OUTPUT_DIR, file));
  });
} else {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Penyimpanan sementara data per grup
const contextMap = new Map();

function getGroupStore(groupKey) {
  if (!contextMap.has(groupKey)) {
    contextMap.set(groupKey, { files: [], manifest: [] });
  }
  return contextMap.get(groupKey);
}

// 2. Fungsi pembersihan kode (Menghemat baris tanpa merusak logika)
function compressCode(content) {
  return content
    .replace(/\r\n/g, '\n')                             // Normalisasi line ending
    .replace(/\/\/\s*[-=*#]{3,}\s*$/gm, '')              // Hapus komentar pembatas dekoratif (misal: // ------ )
    .replace(/\/\*\s*[-=*#]{3,}\s*\*\/$/gm, '')          // Hapus komentar blok pembatas
    .split('\n')
    .map(line => line.trimEnd())                        // Hapus trailing whitespace
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')                         // Maksimal 1 baris kosong berurutan
    .trim();
}

function determineGroup(relPath) {
  const normalizedPath = relPath.replace(/\\/g, '/');

  if (normalizedPath.startsWith('src/features/')) {
    const parts = normalizedPath.split('/');
    if (parts.length > 2) {
      return `feature-${parts[2]}`;
    }
  }

  return 'core';
}

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

function generateContexts() {
  const rootDir = process.cwd();

  walkDir(rootDir, (filePath) => {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const groupKey = determineGroup(relPath);
    const ext = path.extname(filePath).toLowerCase();
    const lang = LANG_MAP[ext] || '';

    try {
      const rawContent = fs.readFileSync(filePath, 'utf8');
      const cleanContent = compressCode(rawContent);

      const store = getGroupStore(groupKey);
      store.manifest.push(`- \`${relPath}\``);
      store.files.push(`### \`${relPath}\`
\`\`\`${lang}
${cleanContent}
\`\`\``);
    } catch (err) {
      const store = getGroupStore(groupKey);
      store.manifest.push(`- \`${relPath}\` (Error)`);
      store.files.push(`### \`${relPath}\`\n> [Gagal membaca file: ${err.message}]`);
    }
  });

  // 3. Tulis output dengan struktur Markdown yang ringkas & padat
  let count = 0;
  contextMap.forEach((data, groupKey) => {
    const fileName = `${groupKey}.txt`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    const header = `# CONTEXT: ${groupKey.toUpperCase()}\n\n## Included Files:\n${data.manifest.join('\n')}\n\n---\n\n`;
    const body = data.files.join('\n\n');

    fs.writeFileSync(filePath, header + body, 'utf8');
    console.log(` Output: ${OUTPUT_DIR}/${fileName}`);
    count++;
  });

  console.log(`\n Selesai! Berhasil membuat ${count} file context ringkas di folder '${OUTPUT_DIR}/'.`);
}

generateContexts();