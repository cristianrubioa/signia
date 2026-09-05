export interface SignatureFields {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  linkedinUrl: string;
  additionalLinkLabel: string;
  additionalLinkUrl: string;
}

export const EMPTY_SIGNATURE_FIELDS: SignatureFields = {
  name: "",
  title: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  linkedinUrl: "",
  additionalLinkLabel: "",
  additionalLinkUrl: "",
};

export type SignatureTemplate = "horizontal" | "stacked" | "accent-bar";

export const SIGNATURE_TEMPLATES: { value: SignatureTemplate; label: string }[] = [
  { value: "horizontal", label: "Horizontal" },
  { value: "stacked", label: "Stacked" },
  { value: "accent-bar", label: "Accent bar" },
];

export const ACCENT_COLOR_SWATCHES = ["#0d9488", "#dc2626", "#4f46e5", "#d97706"];
export const DEFAULT_ACCENT_COLOR = ACCENT_COLOR_SWATCHES[0];

const FONT_STACK = "Arial, Helvetica, sans-serif";
const MUTED = "#555555";
const INK = "#111111";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

interface SignatureLink {
  text: string;
  href?: string;
}

function buildLinks(fields: SignatureFields): SignatureLink[] {
  const links: SignatureLink[] = [];
  if (fields.phone.trim())
    links.push({ text: fields.phone.trim(), href: `tel:${fields.phone.trim().replace(/[^\d+]/g, "")}` });
  if (fields.email.trim()) links.push({ text: fields.email.trim(), href: `mailto:${fields.email.trim()}` });
  if (fields.website.trim()) links.push({ text: fields.website.trim(), href: withProtocol(fields.website.trim()) });
  if (fields.linkedinUrl.trim()) links.push({ text: "LinkedIn", href: withProtocol(fields.linkedinUrl.trim()) });
  if (fields.additionalLinkLabel.trim() && fields.additionalLinkUrl.trim()) {
    links.push({ text: fields.additionalLinkLabel.trim(), href: withProtocol(fields.additionalLinkUrl.trim()) });
  }
  return links;
}

function linkHtml(link: SignatureLink, color: string): string {
  const text = escapeHtml(link.text);
  if (!link.href) return text;
  return `<a href="${escapeHtml(link.href)}" style="color:${color};text-decoration:none;">${text}</a>`;
}

function titleLine(fields: SignatureFields): string {
  return [fields.title.trim(), fields.company.trim()].filter(Boolean).map(escapeHtml).join(" &middot; ");
}

function cell(content: string, style: string): string {
  return `<td style="${style}">${content}</td>`;
}

function table(rows: string, style = ""): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:${FONT_STACK};${style}"><tbody>${rows}</tbody></table>`;
}

function horizontalTemplate(fields: SignatureFields, links: SignatureLink[], accentColor: string): string {
  const nameBlock = [
    `<div style="font-size:16px;font-weight:bold;color:${INK};">${escapeHtml(fields.name.trim())}</div>`,
    titleLine(fields) ? `<div style="font-size:13px;color:${MUTED};margin-top:2px;">${titleLine(fields)}</div>` : "",
  ].join("");

  const contactBlock = links.map((link) => `<div style="font-size:13px;color:${MUTED};margin-top:2px;">${linkHtml(link, accentColor)}</div>`).join("");

  const dividerCell = links.length
    ? cell("", `border-left:1px solid #dddddd;padding:0;width:1px;`)
    : "";

  return table(
    `<tr>${cell(nameBlock, "padding:0 16px 0 0;vertical-align:top;")}${dividerCell}${cell(contactBlock, "padding:0 0 0 16px;vertical-align:top;")}</tr>`
  );
}

function stackedTemplate(fields: SignatureFields, links: SignatureLink[], accentColor: string): string {
  const rows = [
    `<tr>${cell(`<div style="font-size:16px;font-weight:bold;color:${INK};">${escapeHtml(fields.name.trim())}</div>`, "padding:0;")}</tr>`,
    titleLine(fields)
      ? `<tr>${cell(`<div style="font-size:13px;color:${MUTED};padding-top:2px;">${titleLine(fields)}</div>`, "padding:0;")}</tr>`
      : "",
    ...links.map(
      (link) => `<tr>${cell(`<div style="font-size:13px;color:${MUTED};padding-top:2px;">${linkHtml(link, accentColor)}</div>`, "padding:0;")}</tr>`
    ),
  ].join("");

  return table(rows);
}

function accentBarTemplate(fields: SignatureFields, links: SignatureLink[], accentColor: string): string {
  const nameBlock = [
    `<div style="font-size:16px;font-weight:bold;color:${INK};">${escapeHtml(fields.name.trim())}</div>`,
    titleLine(fields) ? `<div style="font-size:13px;color:${MUTED};margin-top:2px;">${titleLine(fields)}</div>` : "",
  ].join("");

  const contactBlock = links.map((link) => `<div style="font-size:13px;color:${MUTED};margin-top:2px;">${linkHtml(link, accentColor)}</div>`).join("");

  const barCell = cell("", `background-color:${accentColor};padding:0;width:4px;`);

  return table(
    `<tr>${barCell}${cell(nameBlock, "padding:0 16px;vertical-align:top;")}${cell(contactBlock, "padding:0;vertical-align:top;")}</tr>`
  );
}

export function buildSignatureHtml(fields: SignatureFields, template: SignatureTemplate, accentColor: string): string {
  if (!fields.name.trim()) return "";

  const links = buildLinks(fields);

  switch (template) {
    case "stacked":
      return stackedTemplate(fields, links, accentColor);
    case "accent-bar":
      return accentBarTemplate(fields, links, accentColor);
    case "horizontal":
    default:
      return horizontalTemplate(fields, links, accentColor);
  }
}
