/**
 * Prépare les photos pour le site : JPEG 1600 de repli, plus AVIF et WebP en
 * 480/768/1080/1600, dans public/images/{products,marque}. Source : assets/photos.
 * Les originaux ne sont jamais servis. Usage : node scripts/images.mjs
 */
import sharp from 'sharp';
import { readdirSync, mkdirSync, rmSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const widths = [480, 768, 1080, 1600];

for (const folder of ['products', 'marque']) {
  const src = join(root, 'assets/photos', folder);
  const out = join(root, 'public/images', folder);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  let total = 0;
  for (const file of readdirSync(src).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
    const name = basename(file, extname(file));
    const img = sharp(join(src, file)).rotate();
    const meta = await img.metadata();
    // Un PNG avec transparence (logo, illustrations) garde son fond : WebP et AVIF le portent, le repli reste en PNG.
    const alpha = meta.hasAlpha && folder === 'marque';
    if (alpha) await img.clone().resize({ width: 1600, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(join(out, `${name}.png`));
    else await img.clone().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(join(out, `${name}.jpg`));
    for (const w of widths) {
      await img.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(join(out, `${name}-${w}.webp`));
      await img.clone().resize({ width: w, withoutEnlargement: true }).avif({ quality: 52, effort: 4 }).toFile(join(out, `${name}-${w}.avif`));
    }
    total++;
  }
  console.log(folder, ':', total, 'photos ->', widths.length * 2 + 1, 'fichiers chacune');
}
