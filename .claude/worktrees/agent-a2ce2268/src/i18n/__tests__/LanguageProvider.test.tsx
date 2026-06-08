import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageProvider";

function Probe() {
  const { locale, toggle, t } = useLanguage();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="cart">{t("nav.cart")}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  );
}

describe("LanguageProvider", () => {
  it("defaults to English and toggles to Chinese", () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("locale").textContent).toBe("en");
    const en = screen.getByTestId("cart").textContent ?? "";
    expect(en.length).toBeGreaterThan(0);

    act(() => {
      screen.getByText("toggle").click();
    });
    expect(screen.getByTestId("locale").textContent).toBe("zh");
    const zh = screen.getByTestId("cart").textContent ?? "";
    expect(zh).not.toEqual(en);
  });
});
