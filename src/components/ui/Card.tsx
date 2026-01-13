import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    style?: React.CSSProperties;
}

const paddingStyles = {
    none: '',
    sm: 'p-sm',
    md: 'p-md',
    lg: 'p-lg',
};

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = true,
    onClick,
    padding = 'md',
    style,
}) => {
    const Component = onClick ? motion.button : motion.div;

    return (
        <Component
            className={`glass-card ${paddingStyles[padding]} ${className}`}
            onClick={onClick}
            whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
            whileTap={onClick ? { scale: 0.99 } : undefined}
            style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
        >
            {children}
        </Component>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
    <div className={`mb-md ${className}`}>{children}</div>
);

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
    <h3 className={`text-lg font-bold ${className}`}>{children}</h3>
);

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => (
    <p className={`text-sm text-secondary mt-xs ${className}`}>{children}</p>
);

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
    <div className={className}>{children}</div>
);

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
    <div className={`mt-md flex gap-sm ${className}`}>{children}</div>
);

export default Card;
