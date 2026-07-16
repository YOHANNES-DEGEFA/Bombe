<div align="center">

# Bombe

**Discover movies & TV. Watch together. Share what you love.**

[Live Demo](https://bombe-omega.vercel.app) · Powered by [TMDB](https://www.themoviedb.org/)

</div>

---

## What is Bombe?

**Bombe** is a social streaming discovery app — browse trending movies and TV shows, track what you watch, and hang out with friends in real-time **Watch Parties**.

It is not just another catalog. The focus is on watching *with people*: rooms with live chat, buddy connections, and recommendations that travel between friends.

---

## What makes it unique?

| Feature | Why it matters |
|---|---|
| **Watch Parties** | Create or join rooms, pick a title together, and chat while you watch |
| **Buddies** | Find friends, send/accept requests, and stay connected around what you watch |
| **Social recommendations** | Share picks with friends — discovery stays personal, not algorithmic-only |
| **Your library** | Watchlist, favorites, and history in one place |
| **Polished discovery** | Trending and top-rated movies/shows powered by TMDB, with fast search |

---

## Features

- **Browse & discover** — trending and highest-rated movies & TV shows
- **Search** — find titles quickly across movies and series
- **Watch** — stream movie and episode pages with a TV-friendly flow
- **Watchlist / Favorites / History** — keep track of what you plan to watch, love, and already saw
- **Buddies** — friend requests, accept/reject, manage your circle
- **Recommended** — see what friends are sharing with you
- **Watch Parties (Rooms)** — create rooms, invite others, select media, chat in real time
- **Auth** — sign up / sign in with Firebase Authentication
- **SEO-ready** — meta tags, sitemap, robots, and structured data for better discoverability

---

## Tech stack

| Layer | Tools |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (Pages Router) |
| UI | React 18, Tailwind CSS, Framer Motion |
| Auth & data | Firebase Auth, Firestore, Realtime Database |
| Media metadata | [TMDB API](https://www.themoviedb.org/documentation/api) |
| Analytics | Vercel Analytics |

---

## Quick start

### Prerequisites

- Node.js **18+** (see `.nvmrc`)
- A [TMDB API key](https://www.themoviedb.org/settings/api)
- A [Firebase](https://firebase.google.com/) project (Auth, Firestore, Realtime Database)

### Install & run

```bash
git clone https://github.com/<your-username>/Bombe.git
cd Bombe
npm install
```

Create a `.env.local` file in the project root:

```env
# TMDB
NEXT_PUBLIC_API_KEY=your_tmdb_api_key
TMDB_API_KEY=your_tmdb_api_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SOCIAL_PROFILES=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |

---

## Project layout

```
Bombe/
├── components/     # UI (nav, cards, chat, rooms, skeletons, …)
├── context/        # Auth & watchlist providers
├── hooks/          # Auth, home data, recommendations, …
├── lib/            # TMDB helpers, caching, SEO, Firestore utils
├── pages/          # Routes (home, rooms, buddies, watch, …)
│   └── api/        # TMDB proxy API
├── public/         # Static assets
└── styles/         # Global CSS
```

---

## Attribution

This product uses the [TMDB API](https://www.themoviedb.org/) but is **not endorsed or certified by TMDB**.

Movie and TV metadata and artwork come from The Movie Database.

---

## License

Private project — all rights reserved unless otherwise noted.
