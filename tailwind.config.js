/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#141414",
        secondary: "#181818",
        'secondary-light': '#333333',
        surface: "#1F1F1F",
        elevated: "#232323",
        'hover-surface': "#2A2A2A",
        accent: "#E50914",
        'accent-hover': "#F40612",
        'accent-secondary': "#B20710",
        textprimary: "#FFFFFF",
        textsecondary: "#B3B3B3",
        muted: "#808080",
        disabled: "#5A5A5A",
        'border-strong': "#4D4D4D",
        'on-accent': "#FFFFFF",
        success: "#46D369",
        warning: "#FFA00A",
        info: "#0071EB",
        error: "#E50914",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Inter', 'sans-serif'],
        'dm-display': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'skeleton-shimmer': 'skeleton-shimmer 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'skeleton-shimmer': {
          '0%': { transform: 'translate3d(-100%, 0, 0)' },
          '100%': { transform: 'translate3d(100%, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
};
