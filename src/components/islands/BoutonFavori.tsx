import { useStore } from '@nanostores/react';
import { compte, basculerFavori } from '@/stores/compte';

/** Le cœur qui met une pièce de côté. Sans compte, il invite à se connecter
 *  plutôt que de disparaître : la cliente comprend ce qu'elle rate. */
export default function BoutonFavori({ id, nom, base }: { id: string; nom: string; base: string }) {
  const c = useStore(compte);
  const b = base.replace(/\/$/, '');
  const aime = c?.favoris.includes(id) ?? false;

  if (!c) {
    return (
      <a href={`${b}/compte`}
        className="inline-flex items-center gap-2 rounded-full border border-line-2 px-4 py-2.5 text-sm font-semibold text-ink-2 transition-colors hover:border-wine hover:text-wine">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20s-7-4.5-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7-2.5c0 5-7 9.5-7 9.5z" />
        </svg>
        Mettre de côté
      </a>
    );
  }

  return (
    <button type="button" onClick={() => basculerFavori(id)} aria-pressed={aime}
      aria-label={aime ? `Retirer ${nom} des favoris` : `Mettre ${nom} de côté`}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
        aime ? 'border-wine bg-wine-soft text-wine' : 'border-line-2 text-ink-2 hover:border-wine hover:text-wine'}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill={aime ? 'currentColor' : 'none'} stroke="currentColor"
        strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20s-7-4.5-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7-2.5c0 5-7 9.5-7 9.5z" />
      </svg>
      {aime ? 'Mise de côté' : 'Mettre de côté'}
    </button>
  );
}
