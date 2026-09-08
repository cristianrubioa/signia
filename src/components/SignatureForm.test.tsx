import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_SIGNATURE_FIELDS } from "../lib/signature";
import SignatureForm from "./SignatureForm";

describe("SignatureForm", () => {
  it("renders every field with its given value", () => {
    render(<SignatureForm fields={{ ...EMPTY_SIGNATURE_FIELDS, name: "Ada Lovelace" }} onFieldsChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("Ada Lovelace")).toHaveValue("Ada Lovelace");
  });

  it("calls onFieldsChange with the updated field when a field is edited", async () => {
    const onFieldsChange = vi.fn();
    render(<SignatureForm fields={EMPTY_SIGNATURE_FIELDS} onFieldsChange={onFieldsChange} />);

    await userEvent.type(screen.getByPlaceholderText("Software Engineer"), "X");

    expect(onFieldsChange).toHaveBeenCalledWith({ ...EMPTY_SIGNATURE_FIELDS, title: "X" });
  });
});
