import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLocations } from "./useLocations";
import { supabase } from "../lib/supabase";

// Mock Supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                data: [],
                error: null
            }))
        }))
    }
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

describe("useLocations hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch locations", async () => {
    const mockLocations = [
      {
        id: "l1",
        name: "Test Location",
        address: "Address",
        phone: "123",
        email: "test@test.com",
        coordinates: { lat: 0, lng: 0 },
        businessHours: {},
      },
    ];

    // Override mock
    const mockSelect = vi.fn().mockResolvedValue({ data: mockLocations, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any).mockReturnValue({
        select: mockSelect
    });

    const { result } = renderHook(() => useLocations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(1);
    expect(result.current.data?.[0].name).toBe("Test Location");
    expect(supabase.from).toHaveBeenCalledWith('locations');
  });
});
