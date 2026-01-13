import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChatWidget } from './ChatWidget';
import { useChatStore } from '../../stores/chatStore';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const renderChat = () => {
    render(
        <BrowserRouter>
            <ChatWidget />
        </BrowserRouter>
    );
};

describe('ChatWidget Integration', () => {
    beforeEach(() => {
        useChatStore.getState().setOpen(false);
        useChatStore.getState().clearMessages();
    });

    it('is closed by default', () => {
        renderChat();
        expect(screen.queryByText('AI Asistent')).not.toBeInTheDocument();
    });

    it('opens on click', () => {
        renderChat();
        const button = document.querySelector('button');
        if (button) fireEvent.click(button);
        expect(screen.getByText('AI Asistent')).toBeInTheDocument();
    });

    it('sends message', async () => {
        useChatStore.getState().setOpen(true);
        renderChat();

        const input = screen.getByPlaceholderText('Napíšte správu...');
        fireEvent.change(input, { target: { value: 'Ahoj' } });

        const form = document.querySelector('form');
        if (form) fireEvent.submit(form);

        expect(screen.getByText('Ahoj')).toBeInTheDocument();
    });

    it('displays typing indicator', () => {
        useChatStore.getState().setOpen(true);
        useChatStore.getState().setTyping(true);
        renderChat();

        const indicator = document.querySelector('.animate-bounce');
        expect(indicator).toBeInTheDocument();
    });

    it('closes on toggle', () => {
        useChatStore.getState().setOpen(true);
        renderChat();

        const closeButton = document.querySelectorAll('button')[0]; // First button is toggle
        fireEvent.click(closeButton);

        // Should animate out (wait or check store)
        expect(useChatStore.getState().isOpen).toBe(false);
    });
});
