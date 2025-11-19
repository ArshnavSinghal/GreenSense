/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      // Custom colors if you need them, but the emerald shades are standard
      colors: {
        'emerald': {
          '50': '#f0fdf4',
          '100': '#dcfae5',
          '200': '#bcf3d0',
          '300': '#94ecb9',
          '400': '#69e19d',
          '500': '#41d181', // Used for main theme color
          '600': '#29bb6d',
          '700': '#219757',
          '800': '#1f7b49',
          '900': '#1b633e',
          '950': '#0c381f',
        },
      }
    },
  },
}