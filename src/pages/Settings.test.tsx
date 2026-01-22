import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Settings } from './Settings';

describe('Settings Page', () => {
    it('renders settings sections', () => {
        render(<Settings />);
        expect(screen.getByText(/Nastavenia systému/i)).toBeInTheDocument();
        expect(screen.getByText(/Informácie o prevádzke/i)).toBeInTheDocument();
        expect(screen.getByText(/Otváracie hodiny/i)).toBeInTheDocument();
    });

    it('updates business name input', () => {
        render(<Settings />);
        const nameInput = screen.getByLabelText(/Názov biznisu/i) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'New Studio Name' } });
        expect(nameInput.value).toBe('New Studio Name');
    });

    it('toggles working hours closed state', () => {
        render(<Settings />);
        // Find Monday and its toggle button
        const mondayRow = screen.getByText('Pondelok').closest('div');
        const toggleButton = mondayRow?.querySelector('button');
        
        if (toggleButton) {
            // Monday is open by default
            expect(mondayRow?.textContent).not.toContain('Zatvorené');
            
            fireEvent.click(toggleButton);
            
            // After click it should show "Zatvorené" in its row content
            expect(mondayRow?.textContent).toContain('Zatvorené');
            // There are multiple "Otvoriť" buttons (Sat/Sun), so we check that at least one exists
            // and specifically that the Monday button now says "Otvoriť"
            expect(toggleButton.textContent).toBe('Otvoriť');
        } else {
            throw new Error('Toggle button not found');
        }
    });
});
