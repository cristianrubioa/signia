import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SignatureStylePanel from "./SignatureStylePanel";
import { DEFAULT_ACCENT_COLOR, EMPTY_SIGNATURE_FIELDS } from "../lib/signature";

function renderPanel(overrides: Partial<React.ComponentProps<typeof SignatureStylePanel>> = {}) {
  const props = {
    fields: EMPTY_SIGNATURE_FIELDS,
    onFieldsChange: vi.fn(),
    template: "horizontal" as const,
    onTemplateChange: vi.fn(),
    accentColor: DEFAULT_ACCENT_COLOR,
    onAccentColorChange: vi.fn(),
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
});
