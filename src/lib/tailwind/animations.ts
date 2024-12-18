export const animations = {
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" },
  },
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" },
  },
  fadeIn: {
    "0%": { opacity: "0", transform: "translateY(10px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },
  blob: {
    "0%": {
      transform: "translate(0px, 0px) scale(1)",
    },
    "33%": {
      transform: "translate(30px, -50px) scale(1.1)",
    },
    "66%": {
      transform: "translate(-20px, 20px) scale(0.9)",
    },
    "100%": {
      transform: "translate(0px, 0px) scale(1)",
    },
  },
  ticker: {
    "0%": { transform: "translateX(0)" },
    "100%": { transform: "translateX(-50%)" },
  },
  "gradient-shift": {
    "0%, 100%": {
      "background-size": "200% 200%",
      "background-position": "left center",
    },
    "50%": {
      "background-size": "200% 200%",
      "background-position": "right center",
    },
  },
};

export const animationConfig = {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out",
  fadeIn: "fadeIn 0.5s ease-out forwards",
  blob: "blob 7s infinite",
  ticker: "ticker 30s linear infinite",
  "ticker-mobile": "ticker 20s linear infinite",
  "gradient-shift": "gradient-shift 15s ease infinite",
};