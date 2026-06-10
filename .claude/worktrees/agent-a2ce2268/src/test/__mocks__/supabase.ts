import { vi } from "vitest";

type Listener = (event: string, session: unknown) => void;

export function makeMockSupabase(opts: { user?: { id: string; email: string } | null } = {}) {
  const user = opts.user ?? null;
  const listeners: Listener[] = [];
  const session = user
    ? { access_token: "test-token", user, expires_at: Math.floor(Date.now() / 1000) + 3600 }
    : null;
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
      onAuthStateChange: vi.fn((cb: Listener) => {
        listeners.push(cb);
        return { data: { subscription: { unsubscribe: () => {} } } };
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session, user }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { session: null, user }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { role: "user" }, error: null }),
    })),
    // helpers exposed for tests
    __listeners: listeners,
    __emit(event: string, sess: unknown = session) {
      listeners.forEach((l) => l(event, sess));
    },
  };
}
