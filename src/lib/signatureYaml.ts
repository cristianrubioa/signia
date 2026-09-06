import { dump, load } from "js-yaml";
import {
  SIGNATURE_TEMPLATES,
  FONT_SIZE_OPTIONS,
  type SignatureFontSize,
  type SignatureState,
  type SignatureTemplate,
} from "./signature";

export class YamlValidationError extends Error {}

const TEMPLATE_VALUES = SIGNATURE_TEMPLATES.map((t) => t.value);
const FONT_SIZE_VALUES = FONT_SIZE_OPTIONS.map((o) => o.value);

interface YamlDocument {
  details: {
    name: string;
    title: string;
    company: string;
    phone: string;
    email: string;
    address: string;
  };
  template: SignatureTemplate;
  accentColor: string;
  font: {
    family: string;
    size: SignatureFontSize;
  };
  branding: {
    avatarUrl: string;
  };
  socialNetworks: {
    website: string;
    linkedinUrl: string;
    facebookUrl: string;
    instagramUrl: string;
    xUrl: string;
    youtubeUrl: string;
    customLink: {
      label: string;
      url: string;
    };
  };
}

export function toYamlDocument(state: SignatureState): string {
  const { fields } = state;
  const doc: YamlDocument = {
    details: {
      name: fields.name,
      title: fields.title,
      company: fields.company,
      phone: fields.phone,
      email: fields.email,
      address: fields.address,
    },
    template: state.template,
    accentColor: state.accentColor,
    font: {
      family: fields.fontFamily,
      size: fields.fontSize,
    },
    branding: {
      avatarUrl: fields.avatarUrl,
    },
    socialNetworks: {
      website: fields.website,
      linkedinUrl: fields.linkedinUrl,
      facebookUrl: fields.facebookUrl,
      instagramUrl: fields.instagramUrl,
      xUrl: fields.xUrl,
      youtubeUrl: fields.youtubeUrl,
      customLink: {
        label: fields.additionalLinkLabel,
        url: fields.additionalLinkUrl,
      },
    },
  };
  return dump(doc);
}

function expectObject(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new YamlValidationError(`Expected "${path}" to be a section, got ${JSON.stringify(value)}`);
  }
  return value as Record<string, unknown>;
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new YamlValidationError(`Expected "${path}" to be text, got ${JSON.stringify(value)}`);
  }
  return value;
}

function expectEnum<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  const str = expectString(value, path);
  if (!allowed.includes(str as T)) {
    throw new YamlValidationError(`Expected "${path}" to be one of ${allowed.join(", ")}, got "${str}"`);
  }
  return str as T;
}

export function fromYamlDocument(raw: string): SignatureState {
  let parsed: unknown;
  try {
    parsed = load(raw);
  } catch (error) {
    throw new YamlValidationError(`Could not parse YAML: ${(error as Error).message}`);
  }

  const root = expectObject(parsed, "root");
  const details = expectObject(root.details, "details");
  const font = expectObject(root.font, "font");
  const branding = expectObject(root.branding, "branding");
  const socialNetworks = expectObject(root.socialNetworks, "socialNetworks");
  const customLink = expectObject(socialNetworks.customLink, "socialNetworks.customLink");

  return {
    fields: {
      name: expectString(details.name, "details.name"),
      title: expectString(details.title, "details.title"),
      company: expectString(details.company, "details.company"),
      phone: expectString(details.phone, "details.phone"),
      email: expectString(details.email, "details.email"),
      address: expectString(details.address, "details.address"),
      website: expectString(socialNetworks.website, "socialNetworks.website"),
      linkedinUrl: expectString(socialNetworks.linkedinUrl, "socialNetworks.linkedinUrl"),
      additionalLinkLabel: expectString(customLink.label, "socialNetworks.customLink.label"),
      additionalLinkUrl: expectString(customLink.url, "socialNetworks.customLink.url"),
      avatarUrl: expectString(branding.avatarUrl, "branding.avatarUrl"),
      fontFamily: expectString(font.family, "font.family"),
      fontSize: expectEnum(font.size, FONT_SIZE_VALUES, "font.size"),
      facebookUrl: expectString(socialNetworks.facebookUrl, "socialNetworks.facebookUrl"),
      instagramUrl: expectString(socialNetworks.instagramUrl, "socialNetworks.instagramUrl"),
      xUrl: expectString(socialNetworks.xUrl, "socialNetworks.xUrl"),
      youtubeUrl: expectString(socialNetworks.youtubeUrl, "socialNetworks.youtubeUrl"),
    },
    template: expectEnum(root.template, TEMPLATE_VALUES, "template"),
    accentColor: expectString(root.accentColor, "accentColor"),
  };
}
