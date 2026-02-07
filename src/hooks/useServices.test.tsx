import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "./useServices";
import { supabase } from "../lib/supabase";

// Mock Supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    data: [],
                    error: null
                })),
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

describe("useServices hooks (Supabase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch services from Supabase", async () => {
    const mockServices = [
      {
        id: "s1",
        name: "Test Service",
        description: "Desc",
        duration: 30,
        price: 20,
        category: "barber",
        color: "#000",
        icon: "sc",
        locationId: "l1",
      },
    ];

    const mockSelect = vi.fn().mockResolvedValue({ data: mockServices, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any).mockReturnValue({
        select: mockSelect
    });

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(1);
    expect(result.current.data?.[0].name).toBe("Test Service");
    expect(supabase.from).toHaveBeenCalledWith('services');
  });

  it("should handle create service (placeholder)", async () => {
    const { result } = renderHook(() => useCreateService(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        name: "New Service",
        duration: 30,
        price: 15,
        category: "general",
        description: "Description",
        color: "#000000"
      })
    ).resolves.not.toThrow();
  });

  it("should handle update service (placeholder)", async () => {
    const { result } = renderHook(() => useUpdateService(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: "s1",
        name: "Updated Name",
      })
    ).resolves.not.toThrow();
  });

  it("should handle delete service (placeholder)", async () => {
    const { result } = renderHook(() => useDeleteService(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync("s1")).resolves.not.toThrow();
  });
});
