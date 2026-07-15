import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createElement } from 'react';

const renderMock = vi.hoisted(() => vi.fn());
const createRootMock = vi.hoisted(() => vi.fn(() => ({ render: renderMock })));

vi.mock('react-dom/client', () => ({
    createRoot: createRootMock
}));

vi.mock('./App.jsx', () => ({
    default: () => createElement('div', { 'data-testid': 'app-mock' }, 'App')
}));

vi.mock('./index.css', () => ({}));

describe('main', () => {
    beforeEach(() => {
        renderMock.mockClear();
        createRootMock.mockClear();
        document.body.innerHTML = '<div id="root"></div>';
    });

    it('deve montar a aplicação no elemento root', async () => {
        await import('./main.jsx');

        expect(createRootMock).toHaveBeenCalledWith(document.getElementById('root'));
        expect(renderMock).toHaveBeenCalledTimes(1);
    });
});
