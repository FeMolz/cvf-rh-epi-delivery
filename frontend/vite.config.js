import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const portaApi = Number(env.RH_API_PORT || 3000);

    return {
        plugins: [react()],
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: `http://localhost:${portaApi}`,
                    changeOrigin: true
                }
            }
        },
        test: {
            environment: 'jsdom',
            setupFiles: './src/test/setup.js',
            css: true,
            coverage: {
                provider: 'v8',
                reporter: ['text', 'lcov', 'json-summary'],
                include: ['src/**/*.{js,jsx}'],
                exclude: ['src/test/**', '**/*.test.{js,jsx}'],
                tempDirectory: './node_modules/.vitest-coverage',
                thresholds: {
                    lines: 100,
                    functions: 100,
                    branches: 100,
                    statements: 100
                }
            }
        }
    };
});
