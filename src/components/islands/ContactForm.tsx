import { useState } from 'react';

export default function ContactForm() {
  const [envoye, setEnvoye] = useState(false);
  if (envoye) {
    return (
      <div className="rounded-lg bg-sage-soft p-6 text-center">
        <p className="font-semibold text-sage">Message bien reçu.</p>
        <p className="mt-1 text-sm text-ink-2">Nous vous répondons sous 24 h ouvrées.</p>
      </div>
    );
  }
  return (
    <form className="grid gap-4 not-prose" onSubmit={(e) => { e.preventDefault(); setEnvoye(true); }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="c-nom">Votre nom</label>
          <input id="c-nom" className="field" autoComplete="name" required /></div>
        <div><label className="label" htmlFor="c-mail">Votre e-mail</label>
          <input id="c-mail" type="email" className="field" autoComplete="email" required /></div>
      </div>
      <div><label className="label" htmlFor="c-msg">Votre message</label>
        <textarea id="c-msg" className="field" rows={5} required /></div>
      <button type="submit" className="btn btn-primary justify-self-start">Envoyer</button>
    </form>
  );
}
