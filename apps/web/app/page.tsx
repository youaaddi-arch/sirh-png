import { redirect } from 'next/navigation';

export default function Home() {
  // Démo offline : on sert la v1 SPA depuis public/v1.html
  redirect('/v1.html');
}
