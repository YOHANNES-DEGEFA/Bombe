import React from "react";
import { FiArrowUpRight } from "react-icons/fi";

const PORTFOLIO_URL = "https://yohannes-degefa.vercel.app/";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
      <footer className="bg-primary text-textsecondary border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-secondary/30 via-transparent to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-10 md:gap-8">

          <div className="text-center md:text-left max-w-sm">
            <p className="text-textprimary font-semibold text-lg mb-2 tracking-tight">
              Bom<span className="text-accent">be</span>
            </p>
            <p className="text-sm">
              Powered by{" "}
              <a
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-hover transition-colors font-medium"
              >
                TMDB
              </a>{" "}
              (The Movie Database).
            </p>
            <p className="text-xs mt-1 text-textsecondary/60">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>

          <div className="text-center max-w-xs">
            <p className="section-label mb-3">Developer</p>
            <p className="text-sm text-textprimary font-medium mb-2">
              Built by Yohannes Degefa
            </p>
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="developer-cta-attention group inline-flex h-10 items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-4 text-sm font-medium text-accent transition-all duration-200 hover:border-accent hover:bg-accent hover:text-on-accent"
            >
              <span className="relative z-10">Explore my portfolio</span>
              <FiArrowUpRight
                className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </a>
          </div>

          <div className="text-center md:text-right text-sm">
            <p className="text-textprimary font-medium mb-1">
              &copy; {currentYear} Bombe
            </p>
            <p className="text-textsecondary/60">All rights reserved.</p>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/[0.06] px-6 py-4 text-center text-xs text-textsecondary/60">
          Built and maintained with{" "}
          <span className="text-accent" aria-label="love">
            ♥
          </span>{" "}
          by{" "}
          <span className="text-textprimary font-medium">Yohannes D.</span>
        </div>
      </footer>
  );
};

export default Footer;
