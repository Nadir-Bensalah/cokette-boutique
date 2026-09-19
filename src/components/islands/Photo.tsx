/**
 * L'équivalent de Picture.astro pour les îlots React : AVIF et WebP en
 * quatre largeurs, repli JPEG. `src` est le chemin public sans extension
 * (ex. `/images/products/robe-olive-1`). `base` est BASE_URL, que les îlots
 * reçoivent en prop faute d'accès à import.meta.env au rendu.
 */
const WIDTHS = [480, 768, 1080, 1600];

export default function Photo({ src, base, alt = '', sizes = '120px', className = '', width, height, loading = 'lazy' }: {
  src: string; base: string; alt?: string; sizes?: string; className?: string;
  width?: number; height?: number; loading?: 'lazy' | 'eager';
}) {
  const b = base.replace(/\/$/, '');
  const stem = `${b}${src.replace(/\.(jpe?g|png|webp)$/i, '')}`;
  const set = (ext: string) => WIDTHS.map((w) => `${stem}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img src={`${stem}.jpg`} alt={alt} sizes={sizes} className={className} width={width} height={height}
        loading={loading} decoding="async" draggable={false} />
    </picture>
  );
}
