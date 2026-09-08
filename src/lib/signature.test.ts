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
      "#000000",
    );
    const urlOnly = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", additionalLinkUrl: "ada.dev" },
      "horizontal",
      "#000000",
    );
    expect(labelOnly).not.toContain("Blog");
    expect(urlOnly).not.toContain("ada.dev");
  });

  it("escapes HTML in user-provided fields", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "<script>alert(1)</script>" },
      "stacked",
      "#000000",
    );
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
      "#4f46e5",
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
      "#000000",
    );
    expect(html).toContain('src="https://acme.com/ada.jpg"');
  });

  it("applies the selected font family in place of the default stack", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", fontFamily: "Georgia, 'Times New Roman', serif" },
      "accent-bar",
      "#000000",
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
      "#000000",
    );
    expect(html).toContain("bootstrap-icons@1.11.3/icons/linkedin.svg");
    expect(html).toContain("bootstrap-icons@1.11.3/icons/facebook.svg");
    expect(html).not.toContain("bootstrap-icons@1.11.3/icons/instagram.svg");
  });

  it("renders the address as plain text with no href", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", address: "1 Memorial Dr, Cambridge, MA" },
      "horizontal",
      "#000000",
    );
    expect(html).toContain("1 Memorial Dr, Cambridge, MA");
    expect(html).not.toContain("<a href");
  });

  it("renders a generic icon (not a brand icon) for the website field", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", website: "acme.com" },
      "horizontal",
      "#000000",
    );
    expect(html).toContain("bootstrap-icons@1.11.3/icons/globe.svg");
    expect(html).toContain("https://acme.com");
  });

  it("defaults to the default font size when unset", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", title: "Engineer" },
      "horizontal",
      "#000000",
    );
    expect(html).toContain("font-size:16px");
    expect(html).toContain("font-size:13px");
  });

  it("scales name and sub text together when the larger font size is selected", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", title: "Engineer", fontSize: "larger" },
      "horizontal",
      "#000000",
    );
    expect(html).toContain("font-size:18px");
    expect(html).toContain("font-size:15px");
    expect(html).not.toContain("font-size:16px");
    expect(html).not.toContain("font-size:13px");
  });

  it("keeps the accent-bar avatar-to-name gap consistent with the horizontal template", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", avatarUrl: "acme.com/ada.jpg" },
      "accent-bar",
      "#000000",
    );
    expect(html).toContain("padding:0 16px 0 0;vertical-align:top;");
    expect(html).not.toContain("padding:0 16px;vertical-align:top;");
  });

  it("boxes the card template in a border using the accent color", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", title: "Engineer", avatarUrl: "acme.com/ada.jpg" },
      "card",
      "#4f46e5",
    );
    expect(html).toContain("border:2px solid #4f46e5;border-radius:8px;padding:16px;");
    expect(html).toContain("Ada");
    expect(html).toContain("Engineer");
    expect(html).toContain('src="https://acme.com/ada.jpg"');
  });

  it("card template only draws the inner divider when there's contact info", () => {
    const withContact = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", email: "ada@acme.com" },
      "card",
      "#000000",
    );
    const withoutContact = buildSignatureHtml({ ...EMPTY_SIGNATURE_FIELDS, name: "Ada" }, "card", "#000000");
    expect(withContact).toContain("border-left:1px solid #dddddd;padding:0;width:1px;");
    expect(withoutContact).not.toContain("border-left:1px solid #dddddd;padding:0;width:1px;");
  });

  it("banner template fills the header band with the accent color and renders name/title in white", () => {
    const html = buildSignatureHtml({ ...EMPTY_SIGNATURE_FIELDS, name: "Ada", title: "Engineer" }, "banner", "#4f46e5");
    expect(html).toContain("background-color:#4f46e5;padding:14px 16px;vertical-align:middle;");
    expect(html).toContain('color:#ffffff;">Ada</div>');
    expect(html).toContain("color:#ffffff;opacity:0.9;");
  });

  it("banner template gives the avatar a white border and its own accent-colored cell", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", avatarUrl: "acme.com/ada.jpg" },
      "banner",
      "#4f46e5",
    );
    expect(html).toContain("border:2px solid #ffffff;");
    expect(html).toContain("background-color:#4f46e5;padding:14px 8px 14px 16px;vertical-align:middle;");
  });

  it("centered template center-aligns every block", () => {
    const html = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", title: "Engineer", email: "ada@acme.com" },
      "centered",
      "#000000",
    );
    expect(html).toContain('<td style="padding:0;text-align:center;">');
    expect(html).not.toContain("vertical-align:top;");
  });

  it("centered template only renders the accent divider when there's contact info to divide from the name block", () => {
    const withContact = buildSignatureHtml(
      { ...EMPTY_SIGNATURE_FIELDS, name: "Ada", email: "ada@acme.com" },
      "centered",
      "#4f46e5",
    );
    const withoutContact = buildSignatureHtml({ ...EMPTY_SIGNATURE_FIELDS, name: "Ada" }, "centered", "#4f46e5");
    expect(withContact).toContain("width:32px;height:2px;background-color:#4f46e5;margin:10px auto;");
    expect(withoutContact).not.toContain("width:32px;height:2px;background-color:#4f46e5;margin:10px auto;");
  });
});
