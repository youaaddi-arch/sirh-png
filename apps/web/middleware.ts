import { NextRequest, NextResponse } from 'next/server';

/**
 * Tout redirige vers la v1 SPA (l'app HTML+JS+localStorage 100% fonctionnelle)
 * sauf les ressources statiques et le fichier v1.html lui-même.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Laisse passer les ressources statiques, l'API Next, et la v1
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/assets/') ||
    pathname === '/v1.html' ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|css|js|woff|woff2|ttf)$/i)
  ) {
    return NextResponse.next();
  }

  // Tout le reste → v1 SPA
  return NextResponse.redirect(new URL('/v1.html' + (req.nextUrl.hash || ''), req.url));
}

export const config = {
  matcher: ['/((?!_next|api|assets|.*\\.).*)'],
};
