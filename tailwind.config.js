/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {

      textShadow: {
        'blue': '5px 5px 10px blue',
      },

      keyframes: {
        'tilt-shaking': {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(5deg)' },
          '50%': { transform: 'rotate(0deg)' },
          '75%': { transform: 'rotate(-5deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      
        'colorAnimate': {
          '0%': { borderColor: 'salmon' },
          '25%': { borderColor: '#e18ce1' },
          '50%': { borderColor: 'paleturquoise' },
          '75%': { borderColor: 'green' },
          '100%': { borderColor: 'yellow' }
        },
      },


      animation: {
        'tilt-shaking': 'tilt-shaking 0.8s ease infinite',
        'color-animate': 'colorAnimate 5s ease-in 1s infinite',  
      }

    },
  },
  plugins: [],
}

