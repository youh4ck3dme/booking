import { create } from 'zustand';
import type { ChatMessage, ChatState } from '../types';

interface ChatStore extends ChatState {
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    setTyping: (isTyping: boolean) => void;
    toggleOpen: () => void;
    setOpen: (isOpen: boolean) => void;
    clearMessages: () => void;
}

const initialMessages: ChatMessage[] = [
    {
        id: 'welcome',
        role: 'assistant',
        content: 'Dobrý deň! 👋 Som váš AI asistent. Ako vám môžem pomôcť s rezerváciou?',
        timestamp: new Date(),
        actions: [
            { type: 'info', label: 'Cenník služieb', data: { action: 'pricelist' } },
            { type: 'book', label: 'Nová rezervácia', data: { action: 'book' } },
        ]
    }
];

export const useChatStore = create<ChatStore>((set) => ({
    messages: initialMessages,
    isTyping: false,
    isOpen: false,

    addMessage: (message) => set((state) => ({
        messages: [
            ...state.messages,
            {
                ...message,
                id: `msg-${Date.now()}`,
                timestamp: new Date(),
            }
        ]
    })),

    setTyping: (isTyping) => set({ isTyping }),
    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    setOpen: (isOpen) => set({ isOpen }),
    clearMessages: () => set({ messages: initialMessages }),
}));
