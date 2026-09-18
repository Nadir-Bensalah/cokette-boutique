import { useStore } from '@nanostores/react';
import { compte } from '@/stores/compte';

/** L'icône de compte de l'en-tête : une initiale une fois connectée. */
export default function CompteLien({ base }: { base: string }) {
  const c = useStore(compte);
  const b = base.replace(/\/$/, '');

  return (
    <a href={`${b}/compte`}
      aria-label={c ? `Mon compte, ${c.prenom}` : 'Se connecter'}
      className="hidden h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-wine-soft sm:inline-flex">
      {c ? (
        <span className="grid h-8 w-8 place-items-center rounded-full bg-wine font-display text-sm font-semibold text-white">
          {c.prenom.charAt(0).toUpperCase()}
        </span>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
      )}
    </a>
  );
}
