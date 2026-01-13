import React from "react";
import { motion } from "framer-motion";
import { type LucideIcon, Search } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Search,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center glass-card ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-secondary max-w-sm mb-8">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </motion.div>
  );
};
