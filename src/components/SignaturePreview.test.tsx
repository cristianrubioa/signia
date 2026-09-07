import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SignaturePreview from "./SignaturePreview";

describe("SignaturePreview", () => {
  const onReset = vi.fn();
  const onResetToDefault = vi.fn();

  afterEach(() => vi.restoreAllMocks());

  it("shows the empty-state placeholder when html is blank", () => {
    render(<SignaturePreview html="" onReset={onReset} onResetToDefault={onResetToDefault} />);
    expect(screen.getByText("Enter your name to see a preview")).toBeInTheDocument();
    expect(screen.queryByTitle("Signature preview")).not.toBeInTheDocument();
  });

  it("renders the iframe when html is set", () => {
    render(<SignaturePreview html="<p>Ada</p>" onReset={onReset} onResetToDefault={onResetToDefault} />);
    expect(screen.getByTitle("Signature preview")).toBeInTheDocument();
  });

  describe("with a stubbed clipboard", () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: { write: vi.fn().mockResolvedValue(undefined), writeText: vi.fn().mockResolvedValue(undefined) },
      });
      // @ts-expect-error jsdom has no ClipboardItem implementation
      global.ClipboardItem = class {};
    });

    it("copies the signature and shows 'Copied!'", async () => {
      render(<SignaturePreview html="<p>Ada</p>" onReset={onReset} onResetToDefault={onResetToDefault} />);
      await userEvent.click(screen.getByRole("button", { name: /Copy signature/ }));
      expect(navigator.clipboard.write).toHaveBeenCalled();
      expect(await screen.findByText("Copied!")).toBeInTheDocument();
    });

    it("copies the raw HTML and shows 'Copied!'", async () => {
      render(<SignaturePreview html="<p>Ada</p>" onReset={onReset} onResetToDefault={onResetToDefault} />);
      await userEvent.click(screen.getByRole("button", { name: /Copy HTML/ }));
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("<p>Ada</p>");
      expect(await screen.findByText("Copied!")).toBeInTheDocument();
    });

    it("shows an error message when the clipboard write rejects", async () => {
      (navigator.clipboard.write as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("denied"));
      render(<SignaturePreview html="<p>Ada</p>" onReset={onReset} onResetToDefault={onResetToDefault} />);
      await userEvent.click(screen.getByRole("button", { name: /Copy signature/ }));
      expect(await screen.findByText(/Couldn't access the clipboard/)).toBeInTheDocument();
    });
  });

  it("calls onReset when Clear is clicked", async () => {
    const reset = vi.fn();
    render(<SignaturePreview html="<p>Ada</p>" onReset={reset} onResetToDefault={onResetToDefault} />);
    await userEvent.click(screen.getByRole("button", { name: /Clear/ }));
    expect(reset).toHaveBeenCalled();
  });

  it("calls onResetToDefault when Reset is clicked", async () => {
    const resetToDefault = vi.fn();
    render(<SignaturePreview html="<p>Ada</p>" onReset={onReset} onResetToDefault={resetToDefault} />);
    await userEvent.click(screen.getByRole("button", { name: /Reset/ }));
    expect(resetToDefault).toHaveBeenCalled();
  });
});
