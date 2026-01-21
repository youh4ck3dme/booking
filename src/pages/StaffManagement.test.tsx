import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StaffManagement } from "./StaffManagement";
import { useAuthStore } from "../stores/authStore";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "../hooks/useEmployees";

vi.mock("../stores/authStore");
vi.mock("../hooks/useEmployees");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("StaffManagement page", () => {
  const mockEmployees = [
    {
      id: "e1",
      name: "Employee 1",
      email: "emp1@test.com",
      phone: "111",
      color: "#6366f1",
      services: ["s1"],
      working_hours: {},
      is_active: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "1", role: "admin" },
    } as unknown as ReturnType<typeof useAuthStore>);

    vi.mocked(useEmployees).mockReturnValue({
      data: mockEmployees,
      isLoading: false,
    } as unknown as ReturnType<typeof useEmployees>);

    vi.mocked(useCreateEmployee).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof useCreateEmployee>);

    vi.mocked(useUpdateEmployee).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof useUpdateEmployee>);

    vi.mocked(useDeleteEmployee).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof useDeleteEmployee>);
  });

  it("should render employee list", () => {
    render(<StaffManagement />, { wrapper: createWrapper() });

    expect(screen.getByText("Employee 1")).toBeInTheDocument();
    expect(screen.getByText("emp1@test.com")).toBeInTheDocument();
  });

  it("should show add employee button", () => {
    render(<StaffManagement />, { wrapper: createWrapper() });

    expect(screen.getByText(/Pridať zamestnanca/i)).toBeInTheDocument();
  });

  it("should open form when add button clicked", async () => {
    render(<StaffManagement />, { wrapper: createWrapper() });

    const addButton = screen.getByText(/Pridať zamestnanca/i);
    fireEvent.click(addButton);

    expect(await screen.findByLabelText(/Meno a priezvisko/i)).toBeInTheDocument();
  });

  it("should show loading state", () => {
    vi.mocked(useEmployees).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useEmployees>);

    render(<StaffManagement />, { wrapper: createWrapper() });
    expect(screen.getByText(/Načítavam/i)).toBeInTheDocument();
  });
});
