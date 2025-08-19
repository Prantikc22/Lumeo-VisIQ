import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['iife'],
  globalName: 'visitoriq',
  minify: true,
  sourcemap: true,
  dts: false,
  clean: true,
  outExtension: () => ({
    js: '.min.js'
  })
})
