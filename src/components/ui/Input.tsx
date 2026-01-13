import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
        const generatedId = React.useId();
        const inputId = id || `input-${generatedId}`;

        return (
            <div className="form-group">
                {label && (
                    <label htmlFor={inputId} className="label">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`input ${error ? 'input-error' : ''} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                            {rightIcon}
                        </span>
                    )}
                </div>
                {error && <p className="text-sm text-error mt-xs">{error}</p>}
                {helperText && !error && <p className="text-sm text-muted mt-xs">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const generatedId = React.useId();
        const inputId = id || `textarea-${generatedId}`;

        return (
            <div className="form-group">
                {label && (
                    <label htmlFor={inputId} className="label">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={`input ${error ? 'input-error' : ''} ${className}`}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    {...props}
                />
                {error && <p className="text-sm text-error mt-xs">{error}</p>}
                {helperText && !error && <p className="text-sm text-muted mt-xs">{helperText}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Input;
