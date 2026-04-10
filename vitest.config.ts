import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'lib/**/*.{ts,tsx}',
        'ai/constants.ts',
        'ai/gateway.ts',
        'ai/messages/**/*.ts',
        'components/banner.tsx',
        'components/theme-toggle.tsx',
        'components/icons/**/*.tsx',
        'components/modals/welcome.tsx',
        'components/ui/button.tsx',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/node_modules/**',
        'lib/chat-context.tsx',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
