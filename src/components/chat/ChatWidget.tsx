import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, User, Bot, CalendarCheck, Clock, DollarSign } from "lucide-react";
import { useChatStore } from "../../stores/chatStore";
import { processAIResponse, getWelcomeMessage, isUsingRealAI } from "../../services/aiService";
import { useNavigate } from "react-router-dom";

export const ChatWidget: React.FC = () => {
  const { messages, isTyping, isOpen, toggleOpen, addMessage, setTyping } =
    useChatStore();
  const [inputValue, setInputValue] = React.useState("");
  const hasShownWelcome = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Show welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && !hasShownWelcome.current && messages.length === 0) {
      hasShownWelcome.current = true;
      const welcome = getWelcomeMessage();
      addMessage({
        role: "assistant",
        content: welcome.content,
        actions: welcome.actions,
      });
    }
  }, [isOpen, messages.length, addMessage]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");

    // Add user message
    addMessage({ role: "user", content: userText });
    setTyping(true);

    try {
      // Get AI response with conversation history
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await processAIResponse(userText, history);
      setTyping(false);

      addMessage({
        role: "assistant",
        content: response.content,
        actions: response.actions,
      });
    } catch {
      setTyping(false);
      addMessage({
        role: "assistant",
        content: "Prepáčte, nastala chyba. Skúste to neskôr.",
      });
    }
  };

  const handleAction = (action: { type: string; label: string }) => {
    switch (action.type) {
      case "book":
        navigate("/book");
        if (window.innerWidth < 768) toggleOpen();
        break;
      case "reschedule":
      case "info":
        navigate("/my-bookings");
        if (window.innerWidth < 768) toggleOpen();
        break;
    }
  };

  const handleQuickAction = async (actionType: string) => {
    let message = "";
    switch (actionType) {
      case "book":
        message = "Chcem si rezervovať termín";
        break;
      case "pricing":
        message = "Aký je cenník služieb?";
        break;
      case "bookings":
        message = "Kedy mám najbližšiu rezerváciu?";
        break;
    }
    
    if (message) {
      setInputValue(message);
      // Auto-send
      addMessage({ role: "user", content: message });
      setTyping(true);
      
      try {
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        const response = await processAIResponse(message, history);
        setTyping(false);
        addMessage({
          role: "assistant",
          content: response.content,
          actions: response.actions,
        });
      } catch {
        setTyping(false);
      }
      setInputValue("");
    }
  };

  return (
    <>
      {/* Toggle Button - CalendarCheck icon for booking theme */}
      <motion.button
        className={`
          fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50
          w-16 h-16 rounded-full shadow-glow flex items-center justify-center
          bg-gradient-to-br from-secondary to-secondary-dark text-primary-dark border-2 border-white/20
        `}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9, rotate: -5 }}
        onClick={toggleOpen}
        aria-label={isOpen ? "Zavrieť chat" : "Otvoriť chat asistenta"}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <div className="relative">
            <CalendarCheck size={28} strokeWidth={2.5} />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}
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
              md:w-[400px] h-[550px] bg-bg-secondary border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden
            `}
          >
            {/* Header */}
            <div className="p-md border-b border-border bg-gradient-to-r from-secondary/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center shadow-lg">
                  <Sparkles size={20} className="text-primary-dark" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">BookFlow Asistent</h3>
                  <p className="text-xs text-muted flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {isUsingRealAI() ? "AI Powered" : "Online"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleOpen}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Zavrieť chat"
              >
                <X size={20} className="text-muted" />
              </button>
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="p-sm border-b border-border bg-white/5 flex gap-2 overflow-x-auto">
                <button
                  onClick={() => handleQuickAction("book")}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-secondary/20 hover:bg-secondary/30 rounded-full text-xs font-medium transition-colors border border-secondary/20"
                >
                  <CalendarCheck size={14} />
                  Nová rezervácia
                </button>
                <button
                  onClick={() => handleQuickAction("pricing")}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium transition-colors border border-white/10"
                >
                  <DollarSign size={14} />
                  Cenník
                </button>
                <button
                  onClick={() => handleQuickAction("bookings")}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium transition-colors border border-white/10"
                >
                  <Clock size={14} />
                  Moje termíny
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-md space-y-md bg-bg-primary/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-sm ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      ${
                        msg.role === "user"
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary/20 text-secondary"
                      }
                    `}
                  >
                    {msg.role === "user" ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>
                  <div className={`max-w-[80%] space-y-xs`}>
                    <div
                      className={`
                        p-sm rounded-xl text-sm whitespace-pre-wrap
                        ${
                          msg.role === "user"
                            ? "bg-primary text-white rounded-tr-sm"
                            : "bg-white/10 rounded-tl-sm"
                        }
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
                            className="bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 px-sm py-1.5 rounded-lg text-xs font-medium transition-colors text-secondary"
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
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white/10 p-sm rounded-xl rounded-tl-sm flex gap-1 items-center h-9">
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="p-sm border-t border-border bg-bg-secondary"
            >
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Napíšte správu..."
                  className="w-full bg-bg-primary border border-border rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 top-1.5 w-9 h-9 bg-secondary rounded-lg flex items-center justify-center text-primary-dark hover:bg-secondary-light disabled:opacity-50 disabled:hover:bg-secondary transition-colors"
                  aria-label="Odoslať správu"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
