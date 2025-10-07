/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tous tes fichiers (pages, composants…)
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Palette Santé Afrique
        "sa-red":   "#c01719",
        "sa-blue":  "#0069c3",
        "sa-green": "#55b553",
        "sa-black": "#000000",
        "sa-white": "#ffffff",
        "sa-gray": {
          DEFAULT: "#6e6e6e",
          light:   "#a2a2a2",
          dark:    "#4e4e4e",
          lite:    "#dfdfdf",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // pour .prose (Markdown joli)
  ],
};
