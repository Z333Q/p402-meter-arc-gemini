import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-ui)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'neutral-900': 'var(--neutral-900)',
        'neutral-800': 'var(--neutral-800)',
        'neutral-700': 'var(--neutral-700)',
        'neutral-400': 'var(--neutral-400)',
        'neutral-300': 'var(--neutral-300)',
        'neutral-50': 'var(--neutral-50)',
        success: 'var(--success)',
        error: 'var(--error)',
        warn: 'var(--warning)',
        info: 'var(--info)',
      },
    },
  },
  plugins: [],
};
export default config;
