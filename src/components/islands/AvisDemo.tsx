import { useEffect, useState } from 'react';

/**
 * L'avertissement affiché à l'arrivée sur la démonstration.
 *
 * Il dit d'où viennent les photos et le catalogue, et ce qu'il advient de
 * l'ensemble si le projet ne se fait pas. Il s'affiche une fois par
 * navigateur : le choix est gardé dans localStorage, jamais envoyé ailleurs.
 */
const CLE = 'cokette.avis-demo.v1';

export default function AvisDemo() {
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    let vu = false;
    try { vu = localStorage.getItem(CLE) === '1'; } catch { /* navigation privée */ }
    if (vu) return;
    // On laisse la page se peindre avant d'ouvrir : l'avertissement se pose
    // sur un site déjà visible, il ne le remplace pas.
    const id = setTimeout(() => setOuvert(true), 700);
    return () => clearTimeout(id);
  }, []);

  const fermer = () => {
    setOuvert(false);
    try { localStorage.setItem(CLE, '1'); } catch { /* navigation privée */ }
  };

  useEffect(() => {
    if (!ouvert) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') fermer(); };
    document.addEventListener('keydown', esc);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.documentElement.style.overflow = prev; };
  }, [ouvert]);

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="ad-titre">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-md" onClick={fermer} aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-2xl bg-paper p-6 shadow-float sm:p-8"
        style={{ animation: 'ad-monte .4s cubic-bezier(0.16,1,0.3,1)' }}>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-wine-soft text-wine" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
        </span>

        <h2 id="ad-titre" className="mt-4 font-display text-2xl font-semibold leading-tight">
          Une démonstration préparée pour vous
        </h2>

        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink-2">
          <p>
            Cette boutique a été construite à partir des informations publiques de
            votre site actuel&nbsp;: vos pièces, vos prix, vos photos. Rien n'a été
            obtenu par un accès privé.
          </p>
          <p>
            Elle sert uniquement à vous montrer concrètement ce que donnerait votre
            future boutique, plutôt que de vous le décrire.
          </p>
          <p className="rounded-lg bg-wine-soft px-4 py-3 text-wine">
            <strong>Si le projet ne se fait pas</strong>, cette démonstration et
            l'ensemble des éléments repris sont supprimés dès votre demande, ou au
            plus tard sous trente jours. Aucune information ne sera conservée ni
            transmise à qui que ce soit.
          </p>
        </div>

        <button type="button" onClick={fermer} className="btn btn-primary btn-lg mt-6 w-full">
          Découvrir la boutique
        </button>
      </div>

      <style>{`
        @keyframes ad-monte { from { transform: translateY(16px); opacity: 0 } to { transform: none; opacity: 1 } }
        @media (prefers-reduced-motion: reduce) { div[style*="ad-monte"] { animation: none !important } }
      `}</style>
    </div>
  );
}
