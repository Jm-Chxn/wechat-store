import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./msw/server";
import { makeMockSupabase } from "./__mocks__/supabase";

// Singleton mock so tests can grab it via createClient() and tweak return values.
const mockSupabase = makeMockSupabase();
vi.mock("@/utils/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

// Re-exported for convenience in tests that want to flip auth state.
export { mockSupabase };

// MSW lifecycle.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  if (typeof window !== "undefined") window.localStorage.clear();
});
afterAll(() => server.close());

if (typeof window !== "undefined") {
  if (!("matchMedia" in window)) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
  if (!window.ResizeObserver) {
    class RO { observe() {} unobserve() {} disconnect() {} }
    Object.defineProperty(window, "ResizeObserver", { writable: true, value: RO });
  }
}
