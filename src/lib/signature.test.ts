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

  it("omits the avatar image when its URL is blank", () => {
    const html = buildSignatureHtml({ ...EMPTY_SIGNATURE_FIELDS, name: "Ada" }, "horizontal", "#000000");
    expect(html).not.toContain("<img");
  });

  it("renders the avatar image when its URL is set", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", avatarUrl: "acme.com/ada.jpg" },
      "stacked",
      "#000000"
    );
    expect(html).toContain('src="https://acme.com/ada.jpg"');
  });

  it("applies the selected font family in place of the default stack", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", fontFamily: "Georgia, 'Times New Roman', serif" },
      "accent-bar",
      "#000000"
    );
    expect(html).toContain("font-family:Georgia, 'Times New Roman', serif;");
  });

  it("omits every social icon when no social URLs are set", () => {
    const html = buildSignatureHtml({ ...EMPTY_SIGNATURE_FIELDS, name: "Ada" }, "horizontal", "#000000");
    expect(html).not.toContain("bootstrap-icons");
    expect(html).not.toContain("data:image/svg+xml");
  });

  it("renders a brand icon only for social networks with a filled URL", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", linkedinUrl: "linkedin.com/in/ada", facebookUrl: "facebook.com/ada" },
      "horizontal",
      "#000000"
    );
    expect(html).toContain("bootstrap-icons@1.11.3/icons/linkedin.svg");
    expect(html).toContain("bootstrap-icons@1.11.3/icons/facebook.svg");
    expect(html).not.toContain("bootstrap-icons@1.11.3/icons/instagram.svg");
  });

  it("renders the address as plain text with no href", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", address: "1 Memorial Dr, Cambridge, MA" },
      "horizontal",
      "#000000"
    );
    expect(html).toContain("1 Memorial Dr, Cambridge, MA");
    expect(html).not.toContain("<a href");
  });

  it("renders a generic icon (not a brand icon) for the website field", () => {
    const html = buildSignatureHtml({ ...EMPTY_SIGNATURE_FIELDS, name: "Ada", website: "acme.com" }, "horizontal", "#000000");
    expect(html).toContain("data:image/svg+xml");
    expect(html).toContain("https://acme.com");
  });
});
