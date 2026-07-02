import '../styles/global.css'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Inter } from 'next/font/google';import { Analytics } from '@vercel/analytics/next';
import { installTmdbRateLimiter } from '../lib/tmdbRateLimiter';
import TvRemoteNavigation from '../components/TvRemoteNavigation';
import AppLayout from '../components/AppLayout';
import { AuthProvider } from '../context/AuthContext';
import { WatchlistProvider } from '../context/WatchlistContext';
import { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, DEFAULT_TITLE, getSiteUrl } from '../lib/seo';
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const ROUTES_WITHOUT_LAYOUT = ['/'];

installTmdbRateLimiter();

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const showLayout = !ROUTES_WITHOUT_LAYOUT.includes(router.pathname);
  const page = <Component {...pageProps} />;

  if (!showLayout) return page;
  return <AppLayout>{page}</AppLayout>;
}

export default function App({ Component, pageProps }) {
  return (
    <div className={inter.className}>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#141414" />
        <meta name="application-name" content="Bombe" />

        <title>{DEFAULT_TITLE}</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <meta name="keywords" content={DEFAULT_KEYWORDS} />
        <meta name="robots" content="index, follow, max-image-preview:large" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Bombe" />
        <meta property="og:title" content={DEFAULT_TITLE} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:url" content={getSiteUrl()} />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_TITLE} />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />      </Head>
      <AuthProvider>
        <WatchlistProvider>
          <TvRemoteNavigation />
          <AppContent Component={Component} pageProps={pageProps} />
        </WatchlistProvider>
      </AuthProvider>
      <Analytics />
    </div>
  );
}
