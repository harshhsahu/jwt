const daisyui = require("daisyui");

/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  experimental: {
    useJIT: true,
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["business", "emerald"],
    darkTheme: "business",
  },
};
