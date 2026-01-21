import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Statistics from './Statistics';

// Mock Recharts to avoid layout issues in tests if it were used, 
// though Statistics.tsx currently uses custom CSS bars.
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    BarChart: () => <div data-testid="bar-chart" />,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    AreaChart: () => <div data-testid="area-chart" />,
    Area: () => null,
    PieChart: () => <div data-testid="pie-chart" />,
    Pie: () => null,
    Cell: () => null,
}));

describe('Statistics Page', () => {
    it('renders statistics cards', () => {
        render(<Statistics />);
        expect(screen.getByText(/Štatistiky a Reporty/i)).toBeInTheDocument();
        expect(screen.getByText(/Celkové tržby/i)).toBeInTheDocument();
        expect(screen.getByText(/Noví zákazníci/i)).toBeInTheDocument();
    });

    it('renders revenue development chart section', () => {
        render(<Statistics />);
        expect(screen.getByText(/Vývoj tržieb/i)).toBeInTheDocument();
        // Check for month labels rendered in the custom chart
        expect(screen.getByText('Jan')).toBeInTheDocument();
    });

    it('renders service popularity section', () => {
        render(<Statistics />);
        expect(screen.getByText(/Popularita služieb/i)).toBeInTheDocument();
        expect(screen.getByText('Strih vlasov')).toBeInTheDocument();
    });
});
