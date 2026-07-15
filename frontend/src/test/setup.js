import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useRealTimers();
});

if (typeof globalThis.IS_REACT_ACT_ENVIRONMENT === 'undefined') {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}