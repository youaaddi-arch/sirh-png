import { redirect } from 'next/navigation';

// Racine = v1 SPA (page de connexion historique).
// Pour voir la v2 Next.js : /login (avec mock API en localStorage).
export default function Home() {
  redirect('/v1.html');
}
