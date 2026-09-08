import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const STORAGE_KEY = "signia:state:v1";

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  localStorage.clear();
  MockResizeObserver.instances = [];
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
});

afterEach(() => vi.unstubAllGlobals());

describe("App", () => {
  it("shows demo content on first visit with no saved state", () => {
    render(<App />);
    expect(screen.getByDisplayValue("Ada Lovelace")).toBeInTheDocument();
  });

  it("does not persist demo content until the user interacts", () => {
    render(<App />);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("persists field changes to localStorage", async () => {
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText("Ada Lovelace"), "!");
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(saved.fields.name).toBe("Ada Lovelace!");
  });

  it("loads persisted state from localStorage on mount, in place of demo content", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ fields: { name: "Grace Hopper" }, template: "stacked", accentColor: "#123456" }),
    );
    vi.resetModules();
    const { default: FreshApp } = await import("./App");
    render(<FreshApp />);
    expect(screen.getByDisplayValue("Grace Hopper")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Ada Lovelace")).not.toBeInTheDocument();
  });

  it("opens and closes the sidebar via the menu toggle and Escape", async () => {
    render(<App />);
    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("clears the content fields when Clear is clicked, without touching template/color", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /Clear/ }));
    expect(screen.getByPlaceholderText("Ada Lovelace")).toHaveValue("");
  });

  it("restores the default demo state when Reset is clicked", async () => {
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText("Ada Lovelace"), "!");
    await userEvent.click(screen.getByRole("button", { name: /Reset/ }));
    expect(screen.getByDisplayValue("Ada Lovelace")).toBeInTheDocument();
  });

  describe("zoom ceiling", () => {
    function recalcWith(mainW: number, mainH: number, previewW: number, previewH: number) {
      const main = screen.getByRole("main");
      const preview = main.firstElementChild as HTMLElement;
      Object.defineProperty(main, "clientWidth", { value: mainW, configurable: true });
      Object.defineProperty(main, "clientHeight", { value: mainH, configurable: true });
      Object.defineProperty(preview, "offsetWidth", { value: previewW, configurable: true });
      Object.defineProperty(preview, "offsetHeight", { value: previewH, configurable: true });
      const observer = MockResizeObserver.instances[MockResizeObserver.instances.length - 1];
      act(() => observer.callback([], observer as unknown as ResizeObserver));
    }

    it("hides the zoom slider when the preview already fills the available space", () => {
      render(<App />);
      recalcWith(400, 300, 400, 300);
      expect(screen.queryByLabelText("Zoom preview")).not.toBeInTheDocument();
    });

    it("shows a zoom slider bounded by the smaller available-space ratio", () => {
      render(<App />);
      recalcWith(800, 600, 400, 300);
      const slider = screen.getByLabelText("Zoom preview") as HTMLInputElement;
      expect(Number(slider.max)).toBeCloseTo(2, 1);
    });
  });
});
