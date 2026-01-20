import { create } from 'zustand';
import type { ChatMessage, ChatState } from '../types';

interface ChatStore extends ChatState {
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    setTyping: (isTyping: boolean) => void;
    toggleOpen: () => void;
    setOpen: (isOpen: boolean) => void;
    clearMessages: () => void;
}

// Start with empty messages - welcome message is now handled by ChatWidget
export const useChatStore = create<ChatStore>((set) => ({
    messages: [],
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
    clearMessages: () => set({ messages: [] }),
}));
