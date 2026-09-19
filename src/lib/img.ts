/**
 * Les variantes d'une photo, telles que scripts/images.mjs les produit :
 * AVIF et WebP en 480/768/1080/1600, plus le JPEG de repli à 1600.
 *
 *   photoSources('/images/products/robe-olive-1.jpg')
 *
 * `src` est le chemin public de l'original, extension comprise : elle est
 * retirée pour nommer les variantes. Le chemin passe par asset() ici même,
 * pour que les appelants n'aient pas à y penser.
 */
import { asset } from './paths';

export const WIDTHS = [480, 768, 1080, 1600] as const;

export function photoSources(src: string) {
  const base = src.replace(/\.(jpe?g|png|webp)$/i, '');
  const set = (ext: string) => WIDTHS.map((w) => `${asset(`${base}-${w}.${ext}`)} ${w}w`).join(', ');
  return {
    avif: set('avif'),
    webp: set('webp'),
    fallback: asset(`${base}.jpg`),
  };
}
