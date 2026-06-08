import * as React from "react";
import { describe, expect, it } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider, useCart } from "@/providers/CartProvider";
import { ToastProvider } from "@/components/ui/toast";

function Probe() {
  const { lines, count, add, remove, setQuantity, clear } = useCart();
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="lines">{JSON.stringify(lines)}</span>
      <button onClick={() => add("p1", 1)}>add</button>
      <button onClick={() => setQuantity("p1", 5)}>set5</button>
      <button onClick={() => remove("p1")}>remove</button>
      <button onClick={() => clear()}>clear</button>
    </div>
  );
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    <AuthProvider>
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
      </ToastProvider>
    </AuthProvider>
  </LanguageProvider>
);

describe("CartProvider", () => {
  it("adds, updates qty, removes, and clears items (guest mode)", async () => {
    render(
      <Wrapper>
        <Probe />
      </Wrapper>,
    );

    await waitFor(() => expect(screen.getByTestId("count").textContent).toBe("0"));

    act(() => {
      screen.getByText("add").click();
    });
    expect(screen.getByTestId("count").textContent).toBe("1");

    act(() => {
      screen.getByText("set5").click();
    });
    expect(screen.getByTestId("count").textContent).toBe("5");

    act(() => {
      screen.getByText("remove").click();
    });
    expect(screen.getByTestId("count").textContent).toBe("0");

    act(() => {
      screen.getByText("add").click();
      screen.getByText("clear").click();
    });
    expect(screen.getByTestId("count").textContent).toBe("0");
  });
});
