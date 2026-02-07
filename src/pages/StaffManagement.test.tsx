import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StaffManagement from "./StaffManagement";
// Mock hooks
vi.mock("../hooks/useEmployees", () => ({
  useEmployees: () => ({
    data: [{ id: "e1", name: "Existing Employee", email: "test@test.com" }],
    isLoading: false,
  }),
  useCreateEmployee: () => ({ mutate: vi.fn() }),
  useUpdateEmployee: () => ({ mutate: vi.fn() }),
  useDeleteEmployee: () => ({ mutate: vi.fn() }),
}));
vi.mock("../hooks/useServices", () => ({
  useServices: () => ({ data: [], isLoading: false }),
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

describe("Staff Management Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render employee list", () => {
    render(<StaffManagement />, { wrapper: createWrapper() });
    expect(screen.getByText("Existing Employee")).toBeTruthy();
  });

  it("should show add employee button", () => {
    render(<StaffManagement />, { wrapper: createWrapper() });
    expect(screen.getByText("Pridať zamestnanca")).toBeTruthy();
  });

  it("should open form when add button clicked", () => {
    render(<StaffManagement />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText("Pridať zamestnanca"));
    // Expect form mode to change - looking for form header or similar
    // Since actual implementation details of form opening might vary,
    // we assume the button click works if no error and state changes.
    // Let's verify if a known form element appears.
    // Assuming "Meno a priezvisko" label appears in form
    expect(screen.getByLabelText(/Meno a priezvisko/i)).toBeTruthy();
  });
});
