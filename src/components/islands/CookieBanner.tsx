import { useStore } from '@nanostores/react';
import { useEffect, useRef, useState } from 'react';
import { consent, accepterTout, refuserTout, enregistrer, rouvrirChoix } from '@/stores/consent';

/**
 * Le bandeau de cookies. Trois règles tenues :
 *
 * 1. Rien n'est déposé avant le choix, hors cookies nécessaires.
 * 2. « Tout refuser » est au même niveau que « Tout accepter ».
 * 3. Le choix se change à tout moment par le lien du pied de page.
 *
 * Le bandeau ne bloque pas la page : on peut lire et naviguer sans répondre,
 * mais aucun traceur n'est posé tant que la réponse n'est pas donnée.
 */
export default function CookieBanner({ base }: { base: string }) {
  const choix = useStore(consent);
  const [detail, setDetail] = useState(false);
  const [mesure, setMesure] = useState(false);
  const [reseaux, setReseaux] = useState(false);
  const [monte, setMonte] = useState(false);
  const boite = useRef<HTMLDivElement>(null);
  const b = base.replace(/\/$/, '');

  // Le bandeau n'apparaît qu'une fois la page rendue : il ne doit pas
  // sauter aux yeux avant même que le contenu soit lisible.
  useEffect(() => {
    const id = setTimeout(() => setMonte(true), 600);
    return () => clearTimeout(id);
  }, []);

  // Le lien « Gestion des cookies » du pied de page rouvre le choix.
  useEffect(() => {
    const ouvrir = (e: Event) => {
      e.preventDefault();
      rouvrirChoix();
      setDetail(true);
      setMonte(true);
      setTimeout(() => boite.current?.focus(), 60);
    };
    const liens = Array.from(document.querySelectorAll('[data-cookies-open]'));
    liens.forEach((l) => l.addEventListener('click', ouvrir));
    return () => liens.forEach((l) => l.removeEventListener('click', ouvrir));
  }, []);

  if (choix !== null || !monte) return null;

  const Bascule = ({ on, set, titre, texte }: { on: boolean; set: (v: boolean) => void; titre: string; texte: string }) => (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-cream p-3">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-wine)]" />
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink">{titre}</span>
        <span className="block text-xs leading-snug text-ink-2">{texte}</span>
      </span>
    </label>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-[85] px-3 pb-3 safe-bottom sm:px-4 sm:pb-4"
      role="dialog" aria-modal="false" aria-labelledby="ck-titre">
      <div ref={boite} tabIndex={-1}
        className="mx-auto w-full max-w-3xl rounded-xl border border-line bg-paper p-5 shadow-float sm:p-6"
        style={{ animation: 'ck-monte .35s cubic-bezier(0.16,1,0.3,1)' }}>

        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-wine-soft text-wine" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><circle cx="9.5" cy="10" r="1" fill="currentColor" />
              <circle cx="14" cy="13.5" r="1" fill="currentColor" /><circle cx="10" cy="15" r="1" fill="currentColor" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 id="ck-titre" className="font-display text-lg font-semibold">Les cookies</h2>
            <p className="mt-1 text-sm leading-snug text-ink-2">
              Le strict nécessaire est toujours actif&nbsp;: votre panier et votre session.
              Pour le reste, mesurer les visites et savoir d'où viennent nos clientes,
              nous vous demandons votre accord.{' '}
              <a href={`${b}/cookies`} className="font-semibold text-wine underline underline-offset-2">
                Notre politique de cookies
              </a>
            </p>
          </div>
        </div>

        {detail && (
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg bg-cream-2 p-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12.5 10 17.5 19 7" />
              </svg>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink">Nécessaires</span>
                <span className="block text-xs leading-snug text-ink-2">Panier, session, votre choix ici. Toujours actifs.</span>
              </span>
            </div>
            <Bascule on={mesure} set={setMesure} titre="Mesure d'audience"
              texte="Compter les visites, voir quelles pages fonctionnent." />
            <Bascule on={reseaux} set={setReseaux} titre="Réseaux sociaux"
              texte="Savoir quelles publications amènent des visites." />
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button type="button" onClick={accepterTout} className="btn btn-primary flex-1">
            Tout accepter
          </button>
          <button type="button" onClick={refuserTout} className="btn btn-ghost flex-1">
            Tout refuser
          </button>
          {detail ? (
            <button type="button" onClick={() => enregistrer(mesure, reseaux)} className="btn btn-soft flex-1">
              Enregistrer mon choix
            </button>
          ) : (
            <button type="button" onClick={() => setDetail(true)} className="btn btn-soft flex-1">
              Personnaliser
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ck-monte { from { transform: translateY(14px); opacity: 0 } to { transform: none; opacity: 1 } }
        @media (prefers-reduced-motion: reduce) {
          div[style*="ck-monte"] { animation: none !important }
        }
      `}</style>
    </div>
  );
}
