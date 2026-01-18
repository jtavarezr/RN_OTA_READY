module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary": "#0a808f",
        "background-light": "#f9fafb",
        "background-dark": "#121416",
        "surface-dark": "#1c2126",
        "border-dark": "#2d343a",
      },
      fontFamily: {
        sans: ['System'],
        serif: ['System'],
        mono: ['System'],
      },
    },
  },
  plugins: [],
  corePlugins: require('tailwind-rn/unsupported-core-plugins'),
}
