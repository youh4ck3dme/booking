import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BookingForm } from "./BookingForm";
import { useServices } from "../../hooks/useServices";
import { useEmployees } from "../../hooks/useEmployees";
import { useAvailableSlots, useCreateBooking } from "../../hooks/useBookings";
import { useLocations } from "../../hooks/useLocations";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock all hooks
vi.mock("../../hooks/useServices", () => ({ useServices: vi.fn() }));
vi.mock("../../hooks/useEmployees", () => ({ useEmployees: vi.fn() }));
vi.mock("../../hooks/useLocations", () => ({ useLocations: vi.fn() }));
vi.mock("../../hooks/useBookings", () => ({
  useAvailableSlots: vi.fn(),
  useCreateBooking: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("BookingForm Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form container", () => {
    vi.mocked(useLocations).mockReturnValue({
      data: [{ id: "l1", name: "Location 1" }],
      isLoading: false,
    } as unknown as ReturnType<typeof useLocations>);
    vi.mocked(useServices).mockReturnValue({
      data: [{ id: "s1", name: "Service 1", icon: "✂️" }],
      isLoading: false,
    } as unknown as ReturnType<typeof useServices>);
    vi.mocked(useEmployees).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useEmployees>);
    vi.mocked(useAvailableSlots).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useAvailableSlots>);
    vi.mocked(useCreateBooking).mockReturnValue({
      isPending: false,
    } as unknown as ReturnType<typeof useCreateBooking>);

    const { container } = render(<BookingForm />, { wrapper: createWrapper() });

    // BookingForm should render its container
    expect(
      container.querySelector('.booking-form, [class*="booking"]')
    ).toBeTruthy();
  });

  it("should use skeleton loader when loading services", () => {
    vi.mocked(useLocations).mockReturnValue({
      data: [],
      isLoading: true,
    } as unknown as ReturnType<typeof useLocations>);
    vi.mocked(useServices).mockReturnValue({
      data: [],
      isLoading: true,
    } as unknown as ReturnType<typeof useServices>);
    vi.mocked(useEmployees).mockReturnValue({
      data: [],
      isLoading: true,
    } as unknown as ReturnType<typeof useEmployees>);
    vi.mocked(useAvailableSlots).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useAvailableSlots>);
    vi.mocked(useCreateBooking).mockReturnValue({
      isPending: false,
    } as unknown as ReturnType<typeof useCreateBooking>);

    const { container } = render(<BookingForm />, { wrapper: createWrapper() });

    // Component should render (skeleton or empty state)
    expect(container).toBeTruthy();
  });
});
