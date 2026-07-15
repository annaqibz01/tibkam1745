import { execSync } from 'child_process';

const { PB_URL, PB_EMAIL, PB_PASSWORD } = process.env;

if (!PB_URL || !PB_EMAIL || !PB_PASSWORD) {
  console.error("❌ Pastikan PB_URL, PB_EMAIL, dan PB_PASSWORD sudah diisi di file .env");
  process.exit(1);
}

const cmd = `npx pocketbase-typegen --url ${PB_URL} --email ${PB_EMAIL} --password ${PB_PASSWORD} --out src/types/pocketbase-types.ts`;

execSync(cmd, { stdio: 'inherit' });