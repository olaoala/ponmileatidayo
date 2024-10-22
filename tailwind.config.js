/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'rose-gold': '#b76e79',
        'chocolate': '#7b3f00',
        'chocolate-light': '#7b3f00',
        'rose-dark-tint':'#4e272d',
        'rose-light-tint':'#ebd7da',
        'green':"#2B252C"
      },
      fontFamily:{
        'dance': ['Dance', 'sans-serif'],
        'pinyon':['pinyon', 'sans-serif'],
        'cardo':['cardo', 'sans-serif'],
        'nunito':['nunito', 'sans-serif']



      },
      backgroundSize: {
        'auto': 'auto',
        'cover': 'cover',
        'contain': 'contain',
        '50': '90%',
        '16': '4rem',
        'size': '100vw 250vh'
      },
      backgroundPosition: {
        'center-4': 'center',
        'top-5':'top '
        
      },
      boxShadow:{
        "main":'  inset 0px -44px 141px 41px rgba(0,0,0,0.75)',
        'sub':'-8px 12px 81px -14px rgba(0,0,0,0.75)',
        'sub-2': '0px 25px 63px -16px rgba(0,0,0,0.75)',
        'sub-3':'0px 2px 19px 0px rgba(0,0,0,0.75);',
      },
      height:{
        
      }
      
    },
    
  },
  plugins: [],
}


