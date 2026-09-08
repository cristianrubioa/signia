export interface SignatureFields {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  linkedinUrl: string;
  additionalLinkLabel: string;
  additionalLinkUrl: string;
  avatarUrl: string;
  fontFamily: string;
  fontSize: SignatureFontSize;
  facebookUrl: string;
  instagramUrl: string;
  xUrl: string;
  youtubeUrl: string;
}

export const FONT_STACK = "Arial, Helvetica, sans-serif";

export type SignatureFontSize = "default" | "larger";

export const FONT_SIZE_OPTIONS: { value: SignatureFontSize; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "larger", label: "Larger" },
];

export const SIZE_SCALE: Record<SignatureFontSize, { name: number; sub: number }> = {
  default: { name: 16, sub: 13 },
  larger: { name: 18, sub: 15 },
};

export const EMPTY_SIGNATURE_FIELDS: SignatureFields = {
  name: "",
  title: "",
  company: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  linkedinUrl: "",
  additionalLinkLabel: "",
  additionalLinkUrl: "",
  avatarUrl: "",
  fontFamily: FONT_STACK,
  fontSize: "default",
  facebookUrl: "",
  instagramUrl: "",
  xUrl: "",
  youtubeUrl: "",
};

export const DEMO_SIGNATURE_FIELDS: SignatureFields = {
  ...EMPTY_SIGNATURE_FIELDS,
  name: "Ada Lovelace",
  title: "Software Engineer",
  company: "Acme Inc.",
  phone: "+1 555 123 4567",
  email: "ada@acme.com",
  address: "1 Memorial Dr, Cambridge, MA",
  website: "acme.com",
  linkedinUrl: "linkedin.com/in/ada",
  avatarUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Ada_Lovelace_daguerreotype_by_Antoine_Claudet_1843_-_cropped.png/250px-Ada_Lovelace_daguerreotype_by_Antoine_Claudet_1843_-_cropped.png",
};

export const FONT_FAMILY_OPTIONS: { value: string; label: string }[] = [
  { value: FONT_STACK, label: "Arial" },
  { value: "Georgia, 'Times New Roman', serif", label: "Georgia" },
  { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
  { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
  { value: "'Trebuchet MS', Helvetica, sans-serif", label: "Trebuchet MS" },
  { value: "'Courier New', Courier, monospace", label: "Courier" },
];

const SOCIAL_ICON_BASE = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons";

const SOCIAL_ICON_URLS: Record<string, string> = {
  website: `${SOCIAL_ICON_BASE}/globe.svg`,
  linkedin: `${SOCIAL_ICON_BASE}/linkedin.svg`,
  facebook: `${SOCIAL_ICON_BASE}/facebook.svg`,
  instagram: `${SOCIAL_ICON_BASE}/instagram.svg`,
  x: `${SOCIAL_ICON_BASE}/twitter-x.svg`,
  youtube: `${SOCIAL_ICON_BASE}/youtube.svg`,
};

export type SignatureTemplate = "horizontal" | "stacked" | "accent-bar" | "card" | "banner" | "centered";

export const SIGNATURE_TEMPLATES: { value: SignatureTemplate; label: string }[] = [
  { value: "horizontal", label: "Horizontal" },
  { value: "stacked", label: "Stacked" },
  { value: "accent-bar", label: "Accent bar" },
  { value: "card", label: "Card" },
  { value: "banner", label: "Banner" },
  { value: "centered", label: "Centered" },
];

export const ACCENT_COLOR_SWATCHES = ["#0d9488", "#2563eb", "#dc2626", "#6b7280", "#c026d3", "#d97706", "#000000"];
export const DEFAULT_ACCENT_COLOR = ACCENT_COLOR_SWATCHES[0];

export interface SignatureState {
  fields: SignatureFields;
  template: SignatureTemplate;
  accentColor: string;
}

export const DEFAULT_SIGNATURE_STATE: SignatureState = {
  fields: DEMO_SIGNATURE_FIELDS,
  template: "horizontal",
  accentColor: DEFAULT_ACCENT_COLOR,
};

const MUTED = "#555555";
const INK = "#111111";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

interface SignatureLink {
  text: string;
  href?: string;
}

interface SocialIconLink {
  href: string;
  iconUrl: string;
  label: string;
}

function buildContactLinks(fields: SignatureFields): SignatureLink[] {
  const links: SignatureLink[] = [];
  if (fields.phone.trim())
    links.push({ text: fields.phone.trim(), href: `tel:${fields.phone.trim().replace(/[^\d+]/g, "")}` });
  if (fields.email.trim()) links.push({ text: fields.email.trim(), href: `mailto:${fields.email.trim()}` });
  if (fields.address.trim()) links.push({ text: fields.address.trim() });
  if (fields.additionalLinkLabel.trim() && fields.additionalLinkUrl.trim()) {
    links.push({ text: fields.additionalLinkLabel.trim(), href: withProtocol(fields.additionalLinkUrl.trim()) });
  }
  return links;
}

function buildSocialIcons(fields: SignatureFields): SocialIconLink[] {
  const icons: SocialIconLink[] = [];
  const add = (url: string, iconUrl: string, label: string) => {
    if (url.trim()) icons.push({ href: withProtocol(url.trim()), iconUrl, label });
  };
  add(fields.website, SOCIAL_ICON_URLS.website, "Website");
  add(fields.linkedinUrl, SOCIAL_ICON_URLS.linkedin, "LinkedIn");
  add(fields.facebookUrl, SOCIAL_ICON_URLS.facebook, "Facebook");
  add(fields.instagramUrl, SOCIAL_ICON_URLS.instagram, "Instagram");
  add(fields.xUrl, SOCIAL_ICON_URLS.x, "X");
  add(fields.youtubeUrl, SOCIAL_ICON_URLS.youtube, "YouTube");
  return icons;
}

function linkHtml(link: SignatureLink, color: string): string {
  const text = escapeHtml(link.text);
  if (!link.href) return text;
  return `<a href="${escapeHtml(link.href)}" style="color:${color};text-decoration:none;">${text}</a>`;
}

function socialIconsHtml(icons: SocialIconLink[]): string {
  if (!icons.length) return "";
  const items = icons
    .map(
      (icon) =>
        `<a href="${escapeHtml(icon.href)}" style="text-decoration:none;margin-right:8px;"><img src="${icon.iconUrl}" width="16" height="16" alt="${escapeHtml(icon.label)}" style="border:0;vertical-align:middle;" /></a>`,
    )
    .join("");
  return `<div style="margin-top:6px;">${items}</div>`;
}

function titleLine(fields: SignatureFields): string {
  return [fields.title.trim(), fields.company.trim()].filter(Boolean).map(escapeHtml).join(" &middot; ");
}

function cell(content: string, style: string): string {
  return `<td style="${style}">${content}</td>`;
}

function table(rows: string, fontFamily: string, style = ""): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:${fontFamily};${style}"><tbody>${rows}</tbody></table>`;
}

function avatarCell(fields: SignatureFields, leftPadding = 0): string {
  if (!fields.avatarUrl.trim()) return "";
  const img = `<img src="${escapeHtml(withProtocol(fields.avatarUrl.trim()))}" width="64" height="64" alt="${escapeHtml(fields.name.trim())}" style="border-radius:50%;display:block;" />`;
  return cell(img, `padding:0 16px 0 ${leftPadding}px;vertical-align:top;`);
}

function horizontalTemplate(
  fields: SignatureFields,
  links: SignatureLink[],
  icons: SocialIconLink[],
  accentColor: string,
): string {
  const size = SIZE_SCALE[fields.fontSize];
  const nameBlock = [
    `<div style="font-size:${size.name}px;font-weight:bold;color:${INK};">${escapeHtml(fields.name.trim())}</div>`,
    titleLine(fields)
      ? `<div style="font-size:${size.sub}px;color:${MUTED};margin-top:2px;">${titleLine(fields)}</div>`
      : "",
  ].join("");

  const contactBlock =
    links
      .map(
        (link) =>
          `<div style="font-size:${size.sub}px;color:${MUTED};margin-top:2px;">${linkHtml(link, accentColor)}</div>`,
      )
      .join("") + socialIconsHtml(icons);

  const dividerCell =
    links.length || icons.length ? cell("", `border-left:1px solid #dddddd;padding:0;width:1px;`) : "";

  return table(
    `<tr>${avatarCell(fields)}${cell(nameBlock, "padding:0 16px 0 0;vertical-align:top;")}${dividerCell}${cell(contactBlock, "padding:0 0 0 16px;vertical-align:top;")}</tr>`,
    fields.fontFamily,
  );
}

function stackedTemplate(
  fields: SignatureFields,
  links: SignatureLink[],
  icons: SocialIconLink[],
  accentColor: string,
): string {
  const size = SIZE_SCALE[fields.fontSize];
  const rows = [
    fields.avatarUrl.trim()
      ? `<tr>${cell(`<img src="${escapeHtml(withProtocol(fields.avatarUrl.trim()))}" width="64" height="64" alt="${escapeHtml(fields.name.trim())}" style="border-radius:50%;display:block;" />`, "padding:0 0 8px 0;")}</tr>`
      : "",
    `<tr>${cell(`<div style="font-size:${size.name}px;font-weight:bold;color:${INK};">${escapeHtml(fields.name.trim())}</div>`, "padding:0;")}</tr>`,
    titleLine(fields)
      ? `<tr>${cell(`<div style="font-size:${size.sub}px;color:${MUTED};padding-top:2px;">${titleLine(fields)}</div>`, "padding:0;")}</tr>`
      : "",
    ...links.map(
      (link) =>
        `<tr>${cell(`<div style="font-size:${size.sub}px;color:${MUTED};padding-top:2px;">${linkHtml(link, accentColor)}</div>`, "padding:0;")}</tr>`,
    ),
    icons.length ? `<tr>${cell(socialIconsHtml(icons), "padding:0;")}</tr>` : "",
  ].join("");

  return table(rows, fields.fontFamily);
}

function accentBarTemplate(
  fields: SignatureFields,
  links: SignatureLink[],
  icons: SocialIconLink[],
  accentColor: string,
): string {
  const size = SIZE_SCALE[fields.fontSize];
  const nameBlock = [
    `<div style="font-size:${size.name}px;font-weight:bold;color:${INK};">${escapeHtml(fields.name.trim())}</div>`,
    titleLine(fields)
      ? `<div style="font-size:${size.sub}px;color:${MUTED};margin-top:2px;">${titleLine(fields)}</div>`
      : "",
  ].join("");

  const contactBlock =
    links
      .map(
        (link) =>
          `<div style="font-size:${size.sub}px;color:${MUTED};margin-top:2px;">${linkHtml(link, accentColor)}</div>`,
      )
      .join("") + socialIconsHtml(icons);

  const barCell = cell("", `background-color:${accentColor};padding:0;width:4px;`);

  return table(
    `<tr>${barCell}${avatarCell(fields, 16)}${cell(nameBlock, "padding:0 16px 0 0;vertical-align:top;")}${cell(contactBlock, "padding:0;vertical-align:top;")}</tr>`,
    fields.fontFamily,
  );
}

function cardTemplate(
  fields: SignatureFields,
  links: SignatureLink[],
  icons: SocialIconLink[],
  accentColor: string,
): string {
  const size = SIZE_SCALE[fields.fontSize];
  const nameBlock = [
    `<div style="font-size:${size.name}px;font-weight:bold;color:${INK};">${escapeHtml(fields.name.trim())}</div>`,
    titleLine(fields)
      ? `<div style="font-size:${size.sub}px;color:${MUTED};margin-top:2px;">${titleLine(fields)}</div>`
      : "",
  ].join("");

  const contactBlock =
    links
      .map(
        (link) =>
          `<div style="font-size:${size.sub}px;color:${MUTED};margin-top:2px;">${linkHtml(link, accentColor)}</div>`,
      )
      .join("") + socialIconsHtml(icons);

  const dividerCell =
    links.length || icons.length ? cell("", `border-left:1px solid #dddddd;padding:0;width:1px;`) : "";

  const innerTable = table(
    `<tr>${avatarCell(fields)}${cell(nameBlock, "padding:0 16px 0 0;vertical-align:top;")}${dividerCell}${cell(contactBlock, "padding:0 0 0 16px;vertical-align:top;")}</tr>`,
    fields.fontFamily,
  );

  return table(
    `<tr>${cell(innerTable, `border:2px solid ${accentColor};border-radius:8px;padding:16px;`)}</tr>`,
    fields.fontFamily,
  );
}

function centeredTemplate(
  fields: SignatureFields,
  links: SignatureLink[],
  icons: SocialIconLink[],
  accentColor: string,
): string {
  const size = SIZE_SCALE[fields.fontSize];
  const hasContact = links.length > 0 || icons.length > 0;

  const rows = [
    fields.avatarUrl.trim()
      ? `<tr>${cell(
          `<img src="${escapeHtml(withProtocol(fields.avatarUrl.trim()))}" width="64" height="64" alt="${escapeHtml(fields.name.trim())}" style="border-radius:50%;display:block;margin:0 auto;" />`,
          "padding:0 0 10px 0;text-align:center;",
        )}</tr>`
      : "",
    `<tr>${cell(`<div style="font-size:${size.name}px;font-weight:bold;color:${INK};">${escapeHtml(fields.name.trim())}</div>`, "padding:0;text-align:center;")}</tr>`,
    titleLine(fields)
      ? `<tr>${cell(`<div style="font-size:${size.sub}px;color:${MUTED};padding-top:2px;">${titleLine(fields)}</div>`, "padding:0;text-align:center;")}</tr>`
      : "",
    hasContact
      ? `<tr>${cell(`<div style="width:32px;height:2px;background-color:${accentColor};margin:10px auto;"></div>`, "padding:0;text-align:center;")}</tr>`
      : "",
    ...links.map(
      (link) =>
        `<tr>${cell(`<div style="font-size:${size.sub}px;color:${MUTED};padding-top:2px;">${linkHtml(link, accentColor)}</div>`, "padding:0;text-align:center;")}</tr>`,
    ),
    icons.length ? `<tr>${cell(socialIconsHtml(icons), "padding:6px 0 0 0;text-align:center;")}</tr>` : "",
  ].join("");

  return table(rows, fields.fontFamily);
}

function bannerTemplate(
  fields: SignatureFields,
  links: SignatureLink[],
  icons: SocialIconLink[],
  accentColor: string,
): string {
  const size = SIZE_SCALE[fields.fontSize];
  const nameBlock = [
    `<div style="font-size:${size.name}px;font-weight:bold;color:#ffffff;">${escapeHtml(fields.name.trim())}</div>`,
    titleLine(fields)
      ? `<div style="font-size:${size.sub}px;color:#ffffff;opacity:0.9;margin-top:2px;">${titleLine(fields)}</div>`
      : "",
  ].join("");

  const contactBlock =
    links
      .map(
        (link) =>
          `<div style="font-size:${size.sub}px;color:${MUTED};margin-top:2px;">${linkHtml(link, accentColor)}</div>`,
      )
      .join("") + socialIconsHtml(icons);

  const avatarImg = fields.avatarUrl.trim()
    ? `<img src="${escapeHtml(withProtocol(fields.avatarUrl.trim()))}" width="48" height="48" alt="${escapeHtml(fields.name.trim())}" style="border-radius:50%;display:block;border:2px solid #ffffff;" />`
    : "";

  const bannerCells = avatarImg
    ? `${cell(avatarImg, `background-color:${accentColor};padding:14px 8px 14px 16px;vertical-align:middle;`)}${cell(
        nameBlock,
        `background-color:${accentColor};padding:14px 16px 14px 8px;vertical-align:middle;`,
      )}`
    : cell(nameBlock, `background-color:${accentColor};padding:14px 16px;vertical-align:middle;`);

  const bannerRow = `<tr>${bannerCells}</tr>`;
  const contentRow = `<tr><td colspan="2" style="padding:16px;">${contactBlock}</td></tr>`;

  return table(`${bannerRow}${contentRow}`, fields.fontFamily);
}

export function buildSignatureHtml(fields: SignatureFields, template: SignatureTemplate, accentColor: string): string {
  if (!fields.name.trim()) return "";

  const links = buildContactLinks(fields);
  const icons = buildSocialIcons(fields);

  switch (template) {
    case "stacked":
      return stackedTemplate(fields, links, icons, accentColor);
    case "accent-bar":
      return accentBarTemplate(fields, links, icons, accentColor);
    case "card":
      return cardTemplate(fields, links, icons, accentColor);
    case "banner":
      return bannerTemplate(fields, links, icons, accentColor);
    case "centered":
      return centeredTemplate(fields, links, icons, accentColor);
    default:
      return horizontalTemplate(fields, links, icons, accentColor);
  }
}
