import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useBookings,
  useCreateBooking,
  useCancelBooking,
  useAvailableSlots,
} from "./useBookings";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { bookingService } from "../services/bookingService";
import type { Booking, Service } from "../types";

// Mock dependencies
vi.mock("../services/bookingService", () => ({
  bookingService: {
    getAvailableSlots: vi.fn(() => Promise.resolve([])),
    createBooking: vi.fn(),
  },
}));

vi.mock("./useToast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

// Test helper for QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useBookings Hooks (Local First)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("useBookings should fetch bookings from localStorage", async () => {
    const mockBooking = {
      id: "1",
      customerId: "u1",
      customerName: "John",
      customerEmail: "john@example.com",
      customerPhone: "123",
      employeeId: "e1",
      serviceId: "s1",
      date: new Date("2025-01-01"),
      startTime: "10:00",
      endTime: "11:00",
      duration: 60,
      price: 50,
      status: "confirmed",
      createdAt: new Date(),
      updatedAt: new Date(),
      locationId: "l1",
      serviceName: "Service 1",
      employeeName: "Employee 1",
    };

    localStorage.setItem("bf_bookings", JSON.stringify([mockBooking]));

    const { result } = renderHook(() => useBookings("u1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(1);
    expect(result.current.data?.[0].customerName).toBe("John");
  });

  it("useCreateBooking should call bookingService", async () => {
    const { result } = renderHook(() => useCreateBooking(), {
      wrapper: createWrapper(),
    });

    const formData = {
      serviceId: "s1",
      employeeId: "e1",
      date: new Date("2025-01-01"),
      timeSlot: "10:00",
      customerName: "Test",
      customerEmail: "test@test.com",
      customerPhone: "",
      notes: "",
      locationId: "l1",
    };

    const service = {
      id: "s1",
      name: "Service",
      duration: 30,
      price: 10,
    } as unknown as Service;

    vi.mocked(bookingService.createBooking).mockResolvedValue({
      id: "new-id",
    } as unknown as Booking);

    await result.current.mutateAsync({ formData, service, userId: "u1" });

    expect(bookingService.createBooking).toHaveBeenCalled();
  });

  it("useCancelBooking should update localStorage", async () => {
    const mockBooking = {
      id: "b1",
      status: "confirmed",
      date: new Date(),
    };
    localStorage.setItem("bf_bookings", JSON.stringify([mockBooking]));

    const { result } = renderHook(() => useCancelBooking(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("b1");

    const updated = JSON.parse(localStorage.getItem("bf_bookings") || "[]");
    expect(updated[0].status).toBe("cancelled");
  });

  it("useAvailableSlots should call bookingService", async () => {
    const testDate = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = { id: "s1", duration: 30 } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employees = [{ id: "e1", name: "Emp", services: ["s1"] }] as any;

    vi.mocked(bookingService.getAvailableSlots).mockResolvedValue([]);

    const { result } = renderHook(
      () => useAvailableSlots(testDate, service, employees),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(bookingService.getAvailableSlots).toHaveBeenCalled();
  });
});
