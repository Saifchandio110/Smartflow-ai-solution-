export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#0B1020', coal: '#12151C', bone: '#EDE8DD', volt: '#3D6BFF' },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        body: ['"Hanken Grotesk"', 'system-ui', 'sans-serif']
      }
    }
  }
}
