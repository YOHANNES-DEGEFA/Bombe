import '../styles/global.css'
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { installTmdbRateLimiter } from '../lib/tmdbRateLimiter';
import TvRemoteNavigation from '../components/TvRemoteNavigation';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

installTmdbRateLimiter();

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
        <meta name="theme-color" content="#141414" />

        <title>Bombe | Discover Movies & TV Shows</title>
        <meta name="description" content="Discover trending, popular, and top-rated movies and TV shows. Track your watch history, create a watchlist, and share recommendations with friends on Bombe." />
        <meta name="keywords" content="movies, tv shows, trending, popular, watchlist, recommendations, stream, watch party" />

        <meta property="og:type" content="website" />
      </Head>
      <TvRemoteNavigation />
      <Component {...pageProps} />
      <Analytics />
    </div>
  );
}
