import { useState } from 'react';

/** Inscription à la lettre des lives. Sans base branchée, on confirme
 *  localement : le geste est réel, l'envoi viendra avec Supabase. */
export default function NewsletterForm() {
  const [envoye, setEnvoye] = useState(false);

  if (envoye) {
    return (
      <p className="rounded-lg bg-sage-soft px-4 py-3 text-sm font-semibold text-sage">
        C'est noté. On vous prévient avant le prochain live.
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); setEnvoye(true); }}>
      <label className="sr-only" htmlFor="nl-mail">Votre e-mail</label>
      <input id="nl-mail" type="email" required autoComplete="email" placeholder="votre@email.fr"
        className="field min-w-0 flex-1" />
      <button type="submit" className="btn btn-primary shrink-0">S'inscrire</button>
    </form>
  );
}
