import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
    // 10 Component Tests for Button
    it('renders correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading state', () => {
        render(<Button isLoading>Click me</Button>);
        expect(screen.queryByText('Click me')).not.toBeInTheDocument();
        expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    it('is disabled when requested', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByText('Disabled')).toBeDisabled();
    });

    it('applies variant classes', () => {
        const { container } = render(<Button variant="secondary">Secondary</Button>);
        expect(container.firstChild).toHaveClass('btn-secondary');
    });

    it('applies size classes', () => {
        const { container } = render(<Button size="lg">Large</Button>);
        expect(container.firstChild).toHaveClass('btn-lg');
    });

    it('renders left icon', () => {
        render(<Button leftIcon={<span data-testid="icon">icon</span>}>Icon</Button>);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
        render(<Button rightIcon={<span data-testid="icon">icon</span>}>Icon</Button>);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders full width', () => {
        const { container } = render(<Button fullWidth>Full</Button>);
        expect(container.firstChild).toHaveClass('w-full');
    });
});
