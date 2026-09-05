import { describe, expect, it } from "vitest";
import { buildSignatureHtml, EMPTY_SIGNATURE_FIELDS } from "./signature";

describe("buildSignatureHtml", () => {
  it("returns empty string when name is blank", () => {
    expect(buildSignatureHtml(EMPTY_SIGNATURE_FIELDS, "horizontal", "#000000")).toBe("");
  });

  it("renders only the name when every other field is blank", () => {
    const html = buildSignatureHtml({ ...EMPTY_SIGNATURE_FIELDS, name: "Ada Lovelace" }, "stacked", "#000000");
    expect(html).toContain("Ada Lovelace");
    expect(html).not.toContain("mailto:");
    expect(html).not.toContain("tel:");
  });

  it("omits the additional link when only the label or only the url is set", () => {
    const labelOnly = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", additionalLinkLabel: "Blog" },
      "horizontal",
      "#000000"
    );
    const urlOnly = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", additionalLinkUrl: "ada.dev" },
      "horizontal",
      "#000000"
    );
    expect(labelOnly).not.toContain("Blog");
    expect(urlOnly).not.toContain("ada.dev");
  });

  it("escapes HTML in user-provided fields", () => {
    const html = buildSignatureHtml({ ...EMPTY_SIGNATURE_FIELDS, name: "<script>alert(1)</script>" }, "stacked", "#000000");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("produces markup with no external stylesheets, style blocks, or classes", () => {
    const html = buildSignatureHtml(
      {
        ...EMPTY_SIGNATURE_FIELDS,
        name: "Ada Lovelace",
        title: "Engineer",
        company: "Acme",
        phone: "555-1234",
        email: "ada@acme.com",
        website: "acme.com",
        linkedinUrl: "linkedin.com/in/ada",
        additionalLinkLabel: "Blog",
        additionalLinkUrl: "ada.dev",
      },
      "accent-bar",
      "#4f46e5"
    );
    expect(html).not.toMatch(/<link/i);
    expect(html).not.toMatch(/<style/i);
    expect(html).not.toMatch(/class=/i);
    expect(html).toContain("mailto:ada@acme.com");
    expect(html).toContain("tel:5551234");
    expect(html).toContain(">555-1234<");
    expect(html).toContain("https://acme.com");
  });
});
