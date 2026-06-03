/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        serif: ['Newsreader', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Dossier palette — exposed as Tailwind tokens for ergonomic class usage.
        // The canonical source is the CSS variables in src/index.css.
        paper: '#f3ece1',
        'paper-deep': '#ebe2d2',
        ink: '#14110d',
        'ink-soft': '#3d362c',
        'ink-mute': '#6e6557',
        rule: '#d6cdb8',
        vermillion: '#a3122b',
        'vermillion-soft': '#c4324a',
        oxblood: '#5c0a16',
        olive: '#5e6b2a',
      },
      letterSpacing: {
        masthead: '-0.04em',
        deck: '0.32em',
      },
    },
  },
  plugins: [],
};

