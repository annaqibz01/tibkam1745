import fs from 'fs';
import path from 'path';

const IGNORE_LIST = [
  'node_modules',
  '.git',
  '.vscode',
  'dist',
  'build',
  '.env',
  'package-lock.json',
  'directory-tree.txt',
  'generate-tree.js'
];

function generateTree(dir, prefix = '') {
  let tree = '';
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    if (IGNORE_LIST.includes(file)) return;

    const isLast = index === files.length - 1;
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    tree += `${prefix}${isLast ? '└── ' : '├── '}${file}\n`;

    if (stats.isDirectory()) {
      tree += generateTree(fullPath, prefix + (isLast ? '    ' : '│   '));
    }
  });

  return tree;
}

const rootDir = process.cwd();
const output = `Proyek: tibkam1745\nRoot: ${rootDir}\n\n${generateTree(rootDir)}`;

fs.writeFileSync('directory-tree.txt', output);
console.log('✅ Berhasil membuat directory-tree.txt');