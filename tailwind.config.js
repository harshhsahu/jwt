/** @type {import('tailwindcss').Config} */
module.exports = {
    // ... existing config ...
    future: {
      hoverOnlyWhenSupported: true,
    },
    experimental: {
      useJIT: true,
    }
  }