module.exports = {
  mode: "jit",
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      display: ["Computer Modern Serif", "serif"],
    },
    extend: {
      backgroundPosition: {
        "left-nudge": "center left 8px",
      },
    },
  },
  plugins: [],
}
