import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The 'define' block is required to make environment variables available
  // in the client-side code under `process.env`. Vite performs a direct
  // replacement during the build process.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  // The 'base' property is REQUIRED for GitHub Pages deployments.
  // It should be set to the name of your repository.
  base: '/ai-candy-generator/',
})