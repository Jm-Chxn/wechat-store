import * as React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { CartProvider, useCart } from "@/providers/CartProvider";
import { ToastProvider } from "@/components/ui/toast";
import { StorageKeys } from "@/lib/storage";
import type { AuthContextValue } from "@/providers/AuthProvider";
import { server } from "@/test/msw/server";

/**
 * The cart must be scoped per user — when the auth provider goes from
 * `{user: someone}` to `{user: null}` (sign-out), CartProvider must drop the
 * in-memory items and clear `localStorage.tuangou.cart` so the next user
 * doesn't inherit them.
 */

// We need to control what useAuth returns from inside CartProvider. The
// simplest way is a mock module that exposes a setter we drive from the test.
let authState: Pick<AuthContextValue, "user" | "isReady"> = { user: null, isReady: true };
vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => authState,
}));

function Probe() {
  const { lines, count, add } = useCart();
  return (
    <>
      <div data-testid="count">{count}</div>
      <div data-testid="lines">{JSON.stringify(lines)}</div>
      <button onClick={() => add("p1", 2)}>add</button>
    </>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  authState = { user: null, isReady: true };
  // The default MSW handler returns a fixture cart with one item — for this
  // test we want a clean empty cart so we can assert exactly the additions
  // we make from the UI.
  const BASE = "/api/v1";
  const empty = { cartId: "c1", items: [], subtotalCents: 0 };
  server.use(
    http.get(`${BASE}/cart`, () => HttpResponse.json(empty)),
    http.post(`${BASE}/cart/merge`, () => HttpResponse.json(empty)),
    http.post(`${BASE}/cart/items`, () => HttpResponse.json(empty)),
  );
});

afterEach(() => {
  window.localStorage.clear();
});

describe("CartProvider — sign-out behavior", () => {
  it("drops cart state and clears localStorage when user becomes null", async () => {
    authState = {
      user: {
        id: "u1",
        email: "u1@x.com",
        name: "U1",
        avatarUrl: null,
        role: "user",
      },
      isReady: true,
    };

    const { rerender } = render(
      <LanguageProvider>
        <ToastProvider>
          <CartProvider>
            <Probe />
          </CartProvider>
        </ToastProvider>
      </LanguageProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("count").textContent).toBe("0"));

    act(() => {
      screen.getByText("add").click();
    });
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(window.localStorage.getItem(StorageKeys.cart)).toContain("p1");

    // simulate sign-out
    authState = { user: null, isReady: true };
    rerender(
      <LanguageProvider>
        <ToastProvider>
          <CartProvider>
            <Probe />
          </CartProvider>
        </ToastProvider>
      </LanguageProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("count").textContent).toBe("0"));
    expect(JSON.parse(window.localStorage.getItem(StorageKeys.cart) ?? "[]")).toEqual([]);
  });
});
