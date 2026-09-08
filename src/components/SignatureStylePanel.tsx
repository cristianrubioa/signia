import { useEffect, useId, useRef, useState } from "react";
import {
  ACCENT_COLOR_SWATCHES,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  SIGNATURE_TEMPLATES,
  type SignatureFields,
  type SignatureTemplate,
} from "../lib/signature";
import SocialNetworksSection from "./SocialNetworksSection";

interface Props {
  fields: SignatureFields;
  onFieldsChange: (fields: SignatureFields) => void;
  template: SignatureTemplate;
  onTemplateChange: (template: SignatureTemplate) => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  onCommit: () => void;
}

const INPUT_CLASS =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white";
const LABEL_CLASS = "block text-sm font-medium text-gray-700 mb-1.5";
const SECTION_CLASS = "-mx-6 border-t border-gray-200 px-6";
const SECTION_STYLE = { paddingTop: "var(--footer-padding-y, 0.75rem)" };

function Dropdown({
  label,
  value,
  onChange,
  options,
  onCommit,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  onCommit: () => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = options.find((option) => option.value === value);

  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <div className="relative" ref={menuRef}>
        <button
          id={id}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`${label}: ${selected?.label ?? ""}`}
          className={`${INPUT_CLASS} flex items-center justify-between text-left transition-colors hover:bg-gray-50`}
        >
          <span>{selected?.label}</span>
          <i
            className={`fa-solid fa-chevron-down text-xs text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  onCommit();
                }}
                className="block w-full px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UrlField({
  label,
  value,
  onChange,
  placeholder,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
      {helper && <p className="mt-1 text-xs text-gray-400">{helper}</p>}
    </div>
  );
}

export default function SignatureStylePanel({
  fields,
  onFieldsChange,
  template,
  onTemplateChange,
  accentColor,
  onAccentColorChange,
  onCommit,
}: Props) {
  function update<K extends keyof SignatureFields>(key: K, value: SignatureFields[K]) {
    onFieldsChange({ ...fields, [key]: value });
  }

  const isCustomColorActive = !ACCENT_COLOR_SWATCHES.includes(accentColor);

  return (
    <div className="flex flex-col">
      <div className="pb-5">
        <p className="crubio-section-label text-teal-700 mb-2">Template</p>
        <div className="grid grid-cols-2 gap-[3px] bg-gray-100 rounded-lg p-[3px]">
          {SIGNATURE_TEMPLATES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                onTemplateChange(t.value);
                onCommit();
              }}
              className={`text-sm font-medium py-3 rounded-md transition-colors ${
                template === t.value ? "bg-white text-gray-800 shadow-sm" : "text-gray-600 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`${SECTION_CLASS} pb-5`} style={SECTION_STYLE}>
        <p className="crubio-section-label text-teal-700 mb-2">Accent color</p>
        <div className="flex flex-wrap items-center gap-0.5">
          {ACCENT_COLOR_SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Use accent color ${color}`}
              onClick={() => {
                onAccentColorChange(color);
                onCommit();
              }}
              style={{ backgroundColor: color }}
              className="relative h-[32px] w-[32px] rounded-full border-2 border-transparent transition-transform hover:scale-110"
            >
              {accentColor === color && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <i className="fa-solid fa-check text-xs text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />
                </span>
              )}
            </button>
          ))}
          <span
            className={`relative h-[32px] w-[32px] overflow-hidden rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${
              isCustomColorActive ? "border-solid border-gray-800" : "border-dashed border-gray-300"
            }`}
          >
            <i className="fa-solid fa-palette text-gray-400 text-sm pointer-events-none" />
            <input
              type="color"
              aria-label="Custom accent color"
              value={accentColor}
              onChange={(e) => onAccentColorChange(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </span>
        </div>
      </div>

      <div className={`${SECTION_CLASS} pb-5`} style={SECTION_STYLE}>
        <p className="crubio-section-label text-teal-700 mb-2">Font</p>
        <div className="flex flex-col gap-3">
          <Dropdown
            label="Family"
            value={fields.fontFamily}
            onChange={(v) => update("fontFamily", v)}
            options={FONT_FAMILY_OPTIONS}
            onCommit={onCommit}
          />
          <Dropdown
            label="Size"
            value={fields.fontSize}
            onChange={(v) => update("fontSize", v as SignatureFields["fontSize"])}
            options={FONT_SIZE_OPTIONS}
            onCommit={onCommit}
          />
        </div>
      </div>

      <div className={`${SECTION_CLASS} pb-5`} style={SECTION_STYLE}>
        <p className="crubio-section-label text-teal-700 mb-2">Branding</p>
        <div className="flex flex-col gap-3">
          <UrlField
            label="Profile picture"
            value={fields.avatarUrl}
            onChange={(v) => update("avatarUrl", v)}
            placeholder="https://example.com/images/myphoto.jpg"
            helper="Paste a URL to an image already hosted online."
          />
        </div>
      </div>

      <SocialNetworksSection fields={fields} onFieldsChange={onFieldsChange} />
    </div>
  );
}
