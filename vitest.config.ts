import { defineConfig, mergeConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            setupFiles: './tests/setup.ts',
            exclude: [ ...configDefaults.exclude ],
            coverage: {
                exclude: [ 'dev-dist/', 'tailwind.config.js', 'eslint.config.mjs', 'vite.config.ts', 'dist/' ]
            },
        },
    }),
);