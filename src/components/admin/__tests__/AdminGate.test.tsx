import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminGate } from "@/components/admin/AdminGate";
import { LanguageProvider } from "@/i18n/LanguageProvider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

function makeAuthMock(state: { ready: boolean; user: unknown; isAdmin: boolean }) {
  vi.doMock("@/providers/AuthProvider", async () => {
    const actual = await vi.importActual<typeof import("@/providers/AuthProvider")>(
      "@/providers/AuthProvider",
    );
    return {
      ...actual,
      useAdminGuard: () => state,
    };
  });
}

describe("AdminGate", () => {
  it("shows loading state until ready and admin", async () => {
    makeAuthMock({ ready: false, user: null, isAdmin: false });
    const { AdminGate: Gated } = await import("@/components/admin/AdminGate");
    render(
      <LanguageProvider>
        <Gated>
          <div data-testid="content">secret</div>
        </Gated>
      </LanguageProvider>,
    );
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("renders children when admin", async () => {
    vi.resetModules();
    makeAuthMock({
      ready: true,
      user: { id: "u1", role: "admin", email: "a@b.c", name: "A", avatarUrl: null },
      isAdmin: true,
    });
    const { AdminGate: Gated } = await import("@/components/admin/AdminGate");
    render(
      <LanguageProvider>
        <Gated>
          <div data-testid="content">secret</div>
        </Gated>
      </LanguageProvider>,
    );
    expect(screen.getByTestId("content").textContent).toBe("secret");
  });
});
