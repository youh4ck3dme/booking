import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "./useEmployees";
import { supabase } from "../lib/supabase";

// Mock Supabase
vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
  isDemoMode: false,
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

describe("useEmployees hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch employees", async () => {
    const mockEmployees = [
      {
        id: "e1",
        name: "Test Employee",
        email: "test@test.com",
        phone: "123",
        color: "#6366f1",
        services: ["s1"],
        working_hours: {},
        is_active: true,
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockQuery: any = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockEmployees, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValue(mockQuery);

    const { result } = renderHook(() => useEmployees(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(1);
    expect(result.current.data?.[0].name).toBe("Test Employee");
  });

  it("should create employee", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockQuery: any = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: "new-id" }, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValue(mockQuery);

    const { result } = renderHook(() => useCreateEmployee(), {
      wrapper: createWrapper(),
    });

    const newEmployee = {
      name: "New Employee",
      email: "new@test.com",
      phone: "456",
      color: "#8b5cf6",
      services: ["s1"],
      workingHours: {},
    };

    await result.current.mutateAsync(newEmployee);
    expect(supabase.from).toHaveBeenCalledWith("employees");
  });

  it("should update employee", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockQuery: any = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(supabase.from).mockReturnValue(mockQuery);

    const { result } = renderHook(() => useUpdateEmployee(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: "e1",
      name: "Updated Name",
      email: "test@test.com",
      phone: "123",
      color: "#6366f1",
      services: ["s1"],
      workingHours: {},
    });
    expect(supabase.from).toHaveBeenCalledWith("employees");
  });

  it("should delete (soft) employee", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockQuery: any = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(supabase.from).mockReturnValue(mockQuery);

    const { result } = renderHook(() => useDeleteEmployee(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("e1");
    expect(supabase.from).toHaveBeenCalledWith("employees");
    expect(mockQuery.update).toHaveBeenCalledWith({ is_active: false });
  });
});
