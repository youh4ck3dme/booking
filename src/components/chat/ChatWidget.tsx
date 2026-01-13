import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { processAIResponse } from '../../services/aiService';
import { useNavigate } from 'react-router-dom';

export const ChatWidget: React.FC = () => {
    const { messages, isTyping, isOpen, toggleOpen, addMessage, setTyping } = useChatStore();
    const [inputValue, setInputValue] = React.useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue;
        setInputValue('');

        // Add user message
        addMessage({ role: 'user', content: userText });
        setTyping(true);

        try {
            // Get AI response
            const response = await processAIResponse(userText);
            setTyping(false);

            addMessage({
                role: 'assistant',
                content: response.content,
                actions: response.actions
            });
        } catch {
            setTyping(false);
            addMessage({ role: 'assistant', content: 'Prepáčte, nastala chyba. Skúste to neskôr.' });
        }
    };

    const handleAction = (action: { type: string; label: string }) => {
        if (action.type === 'book') {
            navigate('/book');
            if (window.innerWidth < 768) toggleOpen();
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                className={`
          fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50
          w-14 h-14 rounded-full shadow-glow flex items-center justify-center
          bg-gradient-primary text-white
        `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleOpen}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`
              fixed bottom-36 right-4 left-4 md:left-auto md:bottom-24 md:right-8 z-50
              md:w-[400px] h-[500px] bg-bg-secondary border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden
            `}
                    >
                        {/* Header */}
                        <div className="p-md border-b border-border bg-white/5 flex items-center gap-sm">
                            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AI Asistent</h3>
                                <p className="text-xs text-muted flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    Online
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-md space-y-md bg-bg-primary/50">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-sm ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}
                    `}
                                    >
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`max-w-[75%] space-y-xs`}>
                                        <div
                                            className={`
                        p-sm rounded-lg text-sm
                        ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white/10 rounded-tl-none'}
                      `}
                                        >
                                            {msg.content}
                                        </div>

                                        {/* Actions */}
                                        {msg.actions && msg.actions.length > 0 && (
                                            <div className="flex flex-wrap gap-xs mt-xs">
                                                {msg.actions.map((action, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleAction(action)}
                                                        className="bg-white/5 hover:bg-white/10 border border-white/10 px-sm py-1 rounded-full text-xs transition-colors"
                                                    >
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <div className="flex gap-sm">
                                    <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-white/10 p-sm rounded-lg rounded-tl-none flex gap-1 items-center h-9">
                                        <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-sm border-t border-border bg-bg-secondary">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Napíšte správu..."
                                    className="w-full bg-bg-primary border border-border rounded-full py-2 pl-4 pr-12 focus:outline-none focus:border-primary transition-colors text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="absolute right-1 top-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-colors"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
