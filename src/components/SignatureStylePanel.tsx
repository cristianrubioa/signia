import {
  ACCENT_COLOR_SWATCHES,
  FONT_FAMILY_OPTIONS,
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
}

const INPUT_CLASS =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white";
const LABEL_CLASS = "block text-sm font-medium text-gray-700 mb-1.5";

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
  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT_CLASS} />
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
}: Props) {
  function update<K extends keyof SignatureFields>(key: K, value: SignatureFields[K]) {
    onFieldsChange({ ...fields, [key]: value });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="crubio-section-label text-gray-500 mb-2">Template</p>
        <div className="grid grid-cols-3 gap-[3px] bg-gray-100 rounded-lg p-[3px]">
          {SIGNATURE_TEMPLATES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onTemplateChange(t.value)}
              className={`text-sm font-medium py-1.5 rounded-md transition-colors ${
                template === t.value ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="crubio-section-label text-gray-500 mb-2">Accent color</p>
        <div className="flex items-center gap-2">
          {ACCENT_COLOR_SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Use accent color ${color}`}
              onClick={() => onAccentColorChange(color)}
              style={{ backgroundColor: color }}
              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                accentColor === color ? "border-gray-800" : "border-transparent"
              }`}
            />
          ))}
          <span className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
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

      <div>
        <p className="crubio-section-label text-gray-500 mb-2">Font</p>
        <select
          value={fields.fontFamily}
          onChange={(e) => update("fontFamily", e.target.value)}
          className={INPUT_CLASS}
        >
          {FONT_FAMILY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="crubio-section-label text-gray-500 mb-2">Branding</p>
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
