/**
 * Script para gerar icones PWA a partir do SVG base.
 *
 * Uso: node scripts/generate-icons.mjs
 *
 * Alternativa manual:
 * 1. Abra public/icons/icon.svg no navegador
 * 2. Use https://realfavicongenerator.net/ ou https://maskable.app/editor
 * 3. Exporte nos tamanhos: 192x192, 512x512
 * 4. Salve em public/icons/
 *
 * Este script requer sharp: npm install -D sharp
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');
const svgPath = join(iconsDir, 'icon.svg');

async function generateIcons() {
  try {
    const sharp = (await import('sharp')).default;
    const svgBuffer = readFileSync(svgPath);

    const sizes = [192, 512];

    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(join(iconsDir, `icon-${size}.png`));
      console.log(`Generated icon-${size}.png`);
    }

    console.log('All icons generated successfully!');
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      console.log('sharp not found. Installing...');
      const { execSync } = await import('child_process');
      execSync('npm install -D sharp', { stdio: 'inherit' });
      console.log('sharp installed. Run this script again.');
    } else {
      throw err;
    }
  }
}

generateIcons();
