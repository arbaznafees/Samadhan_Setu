/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Design System Neutrals
        "surface-base": "#FFFFFF",
        "surface-subtle": "#F8FAFC",
        "surface-sunken": "#F1F5F9",
        "border-subtle": "#E2E8F0",
        "border-strong": "#CBD5E1",
        "text-primary": "#0F172A",
        "text-secondary": "#475569",
        "text-muted": "#94A3B8",

        // Design System Primary Navy
        navy: {
          950: "#001733", // Sidebar dark navy
          900: "#002147", // Institutional primary
          800: "#0A3161", // Interactive hover / active
          700: "#1E3A8A",
          100: "#E6EDF5", // Navy tint badge
          50: "#F0F4F9",
        },

        // Design System Secondary Gold / Sunburst
        gold: {
          500: "#FED65B", // Primary gold accent
          600: "#E8BE40", // Hover gold
          700: "#D97706", // Amber dark
          800: "#854D0E", // High-contrast accessible text
          100: "#FEF9E7", // Subtle tint
          200: "#FDE68A", // Border gold
        },

        // Semantic Status Colors
        status: {
          submitted: "#0284C7",
          "submitted-bg": "#E0F2FE",
          "submitted-border": "#BAE6FD",
          "submitted-text": "#0369A1",

          assigned: "#4F46E5",
          "assigned-bg": "#EEF2FF",
          "assigned-border": "#C7D2FE",
          "assigned-text": "#3730A3",

          progress: "#D97706",
          "progress-bg": "#FEF3C7",
          "progress-border": "#FDE68A",
          "progress-text": "#92400E",

          resolved: "#059669",
          "resolved-bg": "#D1FAE5",
          "resolved-border": "#A7F3D0",
          "resolved-text": "#065F46",

          duplicate: "#E11D48",
          "duplicate-bg": "#FFE4E6",
          "duplicate-border": "#FECDD3",
          "duplicate-text": "#9F1239",

          funded: "#0D9488",
          "funded-bg": "#CCFBF1",
          "funded-border": "#99F6E4",
          "funded-text": "#115E59",

          closed: "#64748B",
          "closed-bg": "#F1F5F9",
          "closed-border": "#E2E8F0",
          "closed-text": "#334155",
        },

        // Backward compatibility mapping
        "primary-container": "#002147",
        "secondary-container": "#FED65B",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Noto Sans Devanagari", "sans-serif"],
        heading: ["var(--font-poppins)", "Poppins", "Noto Sans Devanagari", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "Noto Sans Devanagari", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "Noto Sans Devanagari", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      maxWidth: {
        sidebar: "260px",
      },
      width: {
        sidebar: "260px",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        card: "0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)",
        elevated: "0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)",
        modal: "0 20px 35px -5px rgba(0, 33, 71, 0.15), 0 10px 10px -5px rgba(0, 33, 71, 0.04)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
