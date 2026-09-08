import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_ACCENT_COLOR, EMPTY_SIGNATURE_FIELDS } from "../lib/signature";
import SignatureStylePanel from "./SignatureStylePanel";

function renderPanel(overrides: Partial<React.ComponentProps<typeof SignatureStylePanel>> = {}) {
  const props = {
    fields: EMPTY_SIGNATURE_FIELDS,
    onFieldsChange: vi.fn(),
    template: "horizontal" as const,
    onTemplateChange: vi.fn(),
    accentColor: DEFAULT_ACCENT_COLOR,
    onAccentColorChange: vi.fn(),
    onCommit: vi.fn(),
    ...overrides,
  };
  render(<SignatureStylePanel {...props} />);
  return props;
}

describe("SignatureStylePanel", () => {
  it("calls onTemplateChange when a template button is clicked", async () => {
    const props = renderPanel();
    await userEvent.click(screen.getByRole("button", { name: "Stacked" }));
    expect(props.onTemplateChange).toHaveBeenCalledWith("stacked");
  });

  it("calls onAccentColorChange when a preset swatch is clicked", async () => {
    const props = renderPanel();
    await userEvent.click(screen.getByRole("button", { name: "Use accent color #000000" }));
    expect(props.onAccentColorChange).toHaveBeenCalledWith("#000000");
  });

  it("calls onFieldsChange when the profile picture URL is edited", async () => {
    const props = renderPanel();
    await userEvent.type(screen.getByPlaceholderText("https://example.com/images/myphoto.jpg"), "x");
    expect(props.onFieldsChange).toHaveBeenCalledWith({ ...EMPTY_SIGNATURE_FIELDS, avatarUrl: "x" });
  });

  it("calls onCommit when a template card is clicked", async () => {
    const props = renderPanel();
    await userEvent.click(screen.getByRole("button", { name: "Stacked" }));
    expect(props.onCommit).toHaveBeenCalledTimes(1);
  });

  it("calls onCommit when a preset accent color swatch is clicked", async () => {
    const props = renderPanel();
    await userEvent.click(screen.getByRole("button", { name: "Use accent color #000000" }));
    expect(props.onCommit).toHaveBeenCalledTimes(1);
  });

  it("calls onCommit when a font dropdown option is selected", async () => {
    const props = renderPanel();
    await userEvent.click(screen.getByRole("button", { name: /Arial/ }));
    await userEvent.click(await screen.findByRole("button", { name: "Georgia" }));
    expect(props.onCommit).toHaveBeenCalledTimes(1);
  });

  it("does not call onCommit when the profile picture URL is edited", async () => {
    const props = renderPanel();
    await userEvent.type(screen.getByPlaceholderText("https://example.com/images/myphoto.jpg"), "x");
    expect(props.onCommit).not.toHaveBeenCalled();
  });

  it("does not call onCommit when the custom color input changes", async () => {
    const props = renderPanel();
    const customColorInput = screen.getByLabelText("Custom accent color");
    fireEvent.change(customColorInput, { target: { value: "#123456" } });
    expect(props.onAccentColorChange).toHaveBeenCalledWith("#123456");
    expect(props.onCommit).not.toHaveBeenCalled();
  });
});
