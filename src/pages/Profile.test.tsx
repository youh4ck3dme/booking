import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Profile } from "./Profile";
import { useAuthStore } from "../stores/authStore";

// Mock auth store
vi.mock("../stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

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

describe("Profile page", () => {
  const mockUpdateUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        phone: "123456789",
        role: "customer",
        createdAt: new Date(),
      },
      updateUser: mockUpdateUser,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it("should render profile form with user data", () => {
    render(<Profile />, { wrapper: createWrapper() });

    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@test.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123456789")).toBeInTheDocument();
  });

  it("should show email as disabled", () => {
    render(<Profile />, { wrapper: createWrapper() });

    const emailInput = screen.getByDisplayValue(
      "test@test.com"
    ) as HTMLInputElement;
    expect(emailInput.disabled).toBe(true);
  });

  it("should update user info on submit", async () => {
    mockUpdateUser.mockResolvedValue(undefined);
    render(<Profile />, { wrapper: createWrapper() });

    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    const saveButton = screen.getByText(/Uložiť zmeny/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Updated Name" })
      );
    });
  });

  it("should show success message after update", async () => {
    mockUpdateUser.mockResolvedValue(undefined);
    render(<Profile />, { wrapper: createWrapper() });

    const saveButton = screen.getByText(/Uložiť zmeny/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/úspešne aktualizovaný/i)).toBeInTheDocument();
    });
  });
});
