import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ImportExportSection from "./ImportExportSection";
import { DEFAULT_SIGNATURE_STATE } from "../lib/signature";
import { toYamlDocument } from "../lib/signatureYaml";

describe("ImportExportSection", () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it("calls onImport with the parsed state for a valid YAML upload", async () => {
    const onImport = vi.fn();
    render(<ImportExportSection state={DEFAULT_SIGNATURE_STATE} onImport={onImport} />);

    const file = new File([toYamlDocument(DEFAULT_SIGNATURE_STATE)], "signature.yml", { type: "text/yaml" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);

    expect(onImport).toHaveBeenCalledWith(DEFAULT_SIGNATURE_STATE);
    expect(screen.queryByText(/Couldn't read/)).not.toBeInTheDocument();
  });

  it("shows an error and skips onImport for invalid YAML", async () => {
    const onImport = vi.fn();
    render(<ImportExportSection state={DEFAULT_SIGNATURE_STATE} onImport={onImport} />);

    const file = new File(["not: [valid"], "broken.yml", { type: "text/yaml" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);

    expect(onImport).not.toHaveBeenCalled();
    expect(await screen.findByText(/Could not parse YAML/)).toBeInTheDocument();
  });

  it("triggers a Blob download for the current configuration", async () => {
    render(<ImportExportSection state={DEFAULT_SIGNATURE_STATE} onImport={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /Download/ }));
    await userEvent.click(screen.getByRole("button", { name: "Current configuration" }));

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it("triggers a Blob download for the default template", async () => {
    render(<ImportExportSection state={DEFAULT_SIGNATURE_STATE} onImport={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /Download/ }));
    await userEvent.click(screen.getByRole("button", { name: "Default template" }));

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });
});
