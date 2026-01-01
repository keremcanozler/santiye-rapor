import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
    plugins: [
        react(),
        legacy({
            targets: ['defaults', 'android >= 5'],
            additionalLegacyPolyfills: ['regenerator-runtime/runtime']
        })
    ],
    base: './', // CRITICAL: Required for Capacitor/WebView to match file:// protocol
    build: {
        outDir: 'www',
        emptyOutDir: false, // Don't delete capacitor files
        minify: 'esbuild',
        target: 'es2015',
        rollupOptions: {
            output: {
                manualChunks: undefined, // Single bundle for simplicity
            }
        }
    },
    server: {
        port: 3000
    }
});
