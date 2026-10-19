module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e5',
        accent: '#22c55e',
        'surface-1': '#0f172a',
        'surface-2': '#1e293b',
        'surface-3': '#334155',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
      },
      fontFamily: { sans: ['"Inter var", system-ui'] },
    }
  },
  plugins: [],
}
