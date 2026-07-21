import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        // SpareSpark Sunset Amber design system (context/design-doc.txt)
        amber: {
          primary: "#FF5E3A",
          hover: "#E04D2B",
          glow: "#FF8A50",
          subtle: "rgba(255, 94, 58, 0.12)",
        },
        obsidian: {
          bg: "#0B0F17",
          surface: "#161E2E",
        },
        slate: {
          surface: "#161E2E",
          border: "#2A3548",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
      },
      backgroundImage: {
        "amber-burst": "linear-gradient(135deg, #FF5E3A 0%, #FF8A50 100%)",
        "radar-glow":
          "radial-gradient(circle at 50% 30%, rgba(255, 94, 58, 0.18) 0%, rgba(11, 15, 23, 0) 70%)",
        "surface-glass":
          "linear-gradient(180deg, rgba(22, 30, 46, 0.8) 0%, rgba(22, 30, 46, 0.5) 100%)",
      },
      boxShadow: {
        "amber-glow": "0px 4px 20px rgba(255, 94, 58, 0.35)",
        "radar-pulse": "0px 0px 30px rgba(255, 138, 80, 0.25)",
        "card-elev": "0px 10px 30px rgba(0, 0, 0, 0.4)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "gradient-shift": "gradientShift 15s ease infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s infinite",
      },
      keyframes: {
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%": { boxShadow: "0 0 0 0 rgba(249, 115, 22, 0.4)" },
          "70%": { boxShadow: "0 0 0 10px rgba(249, 115, 22, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(249, 115, 22, 0)" },
        },
      },
    },
  },
  plugins: [],
}

export default config