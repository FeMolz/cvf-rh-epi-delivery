import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from '@playwright/test';

const diretorioE2e = path.dirname(fileURLToPath(import.meta.url));
const diretorioAuth = path.join(diretorioE2e, '.auth');

export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: process.env.CI ? 'github' : 'list',
    timeout: 60_000,
    use: {
        baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure'
    },
    globalSetup: './e2e/global-setup.mjs',
    webServer: {
        command: 'node scripts/servidor-e2e.mjs',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: process.env.CI ? 300_000 : 180_000,
        cwd: '.'
    },
    projects: [
        {
            name: 'setup',
            testMatch: /auth\.setup\.js/
        },
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome']
            },
            dependencies: ['setup'],
            testIgnore: /auth\.setup\.js/
        }
    ]
});

export { diretorioAuth };
