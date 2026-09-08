import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_SIGNATURE_FIELDS } from "../lib/signature";
import SocialNetworksSection from "./SocialNetworksSection";

describe("SocialNetworksSection", () => {
  it("adds a network's field via the picker", async () => {
    const onFieldsChange = vi.fn();
    render(<SocialNetworksSection fields={EMPTY_SIGNATURE_FIELDS} onFieldsChange={onFieldsChange} />);

    await userEvent.click(screen.getByRole("button", { name: /Add social network/ }));
    await userEvent.click(screen.getByRole("button", { name: "Facebook" }));

    expect(screen.getByPlaceholderText("facebook.com/yourprofile")).toBeInTheDocument();
  });

  it("clears and hides a field when its remove control is clicked", async () => {
    const onFieldsChange = vi.fn();
    render(
      <SocialNetworksSection
        fields={{ ...EMPTY_SIGNATURE_FIELDS, facebookUrl: "facebook.com/ada" }}
        onFieldsChange={onFieldsChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Remove Facebook" }));

    expect(onFieldsChange).toHaveBeenCalledWith({ ...EMPTY_SIGNATURE_FIELDS, facebookUrl: "" });
    expect(screen.queryByPlaceholderText("facebook.com/yourprofile")).not.toBeInTheDocument();
  });

  it("updates the custom link label and URL fields", async () => {
    const onFieldsChange = vi.fn();
    render(
      <SocialNetworksSection
        fields={{ ...EMPTY_SIGNATURE_FIELDS, additionalLinkLabel: "Portfolio" }}
        onFieldsChange={onFieldsChange}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("ada.dev"), "x");

    expect(onFieldsChange).toHaveBeenCalledWith({
      ...EMPTY_SIGNATURE_FIELDS,
      additionalLinkLabel: "Portfolio",
      additionalLinkUrl: "x",
    });
  });
});
