import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
    // 10 Component Tests for Input
    it('renders label', () => {
        render(<Input label="Username" />);
        expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('handles user input', () => {
        render(<Input placeholder="Enter text" />);
        const input = screen.getByPlaceholderText('Enter text');
        fireEvent.change(input, { target: { value: 'Hello' } });
        expect(input).toHaveValue('Hello');
    });

    it('shows error message', () => {
        render(<Input error="Invalid input" />);
        expect(screen.getByText('Invalid input')).toBeInTheDocument();
        expect(screen.getByText('Invalid input')).toHaveClass('text-error');
    });

    it('shows helper text', () => {
        render(<Input helperText="Help me" />);
        expect(screen.getByText('Help me')).toBeInTheDocument();
    });

    it('renders icons', () => {
        render(<Input leftIcon={<span data-testid="left">L</span>} rightIcon={<span data-testid="right">R</span>} />);
        expect(screen.getByTestId('left')).toBeInTheDocument();
        expect(screen.getByTestId('right')).toBeInTheDocument();
    });

    it('forwards refs', () => {
        const ref = React.createRef<HTMLInputElement>();
        render(<Input ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('applies custom classes', () => {
        render(<Input className="custom-class" />);
        expect(document.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('handles disabled state', () => {
        render(<Input disabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });
});
