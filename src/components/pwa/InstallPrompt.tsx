import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            const promptEvent = e as BeforeInstallPromptEvent;
            promptEvent.preventDefault();
            setDeferredPrompt(promptEvent);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-24 z-50 max-w-sm"
            >
                <div className="glass-card p-md shadow-xl border border-primary/20 bg-bg-secondary/90 backdrop-blur-xl relative">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 p-1 text-secondary hover:text-primary transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex items-start gap-md pr-8">
                        <div className="bg-primary/20 p-sm rounded-xl">
                            <Download size={24} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base mb-xs">Inštalovať aplikáciu</h3>
                            <p className="text-sm text-secondary mb-md">
                                Nainštalujte si BookFlow Pro pre rýchlejší prístup a notifikácie.
                            </p>
                            <Button size="sm" onClick={handleInstall} fullWidth>
                                Inštalovať
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
