import { useEffect, useRef, useState } from "react";
import { type SignatureFields } from "../lib/signature";

interface Props {
  fields: SignatureFields;
  onFieldsChange: (fields: SignatureFields) => void;
}

type SocialNetworkOption = { kind: "network"; key: keyof SignatureFields; label: string; placeholder: string };
type CustomLinkOption = { kind: "custom"; key: "custom"; label: string };
type SocialOption = SocialNetworkOption | CustomLinkOption;

const SOCIAL_OPTIONS: SocialOption[] = [
  { kind: "network", key: "facebookUrl", label: "Facebook", placeholder: "facebook.com/tuperfil" },
  { kind: "network", key: "instagramUrl", label: "Instagram", placeholder: "instagram.com/tuperfil" },
  { kind: "network", key: "xUrl", label: "X", placeholder: "x.com/tuperfil" },
  { kind: "network", key: "youtubeUrl", label: "YouTube", placeholder: "youtube.com/@tucanal" },
  { kind: "custom", key: "custom", label: "Custom link" },
];

const INPUT_CLASS =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white";
const LABEL_CLASS = "text-sm font-medium text-gray-700";

function Field({
  label,
  value,
  onChange,
  placeholder,
  onRemove,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onRemove?: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className={LABEL_CLASS}>{label}</label>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="text-gray-400 transition-colors hover:text-red-500"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        )}
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT_CLASS} />
    </div>
  );
}

export default function SocialNetworksSection({ fields, onFieldsChange }: Props) {
  const [addedKeys, setAddedKeys] = useState<SocialOption["key"][]>(() => {
    const keys = SOCIAL_OPTIONS.filter(
      (option) => option.kind === "network" && fields[option.key].trim()
    ).map((option) => option.key);
    if (fields.additionalLinkLabel.trim() || fields.additionalLinkUrl.trim()) keys.push("custom");
    return keys;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function update<K extends keyof SignatureFields>(key: K, value: SignatureFields[K]) {
    onFieldsChange({ ...fields, [key]: value });
  }

  function removeKey(key: SocialOption["key"]) {
    setAddedKeys((prev) => prev.filter((k) => k !== key));
    if (key === "custom") {
      onFieldsChange({ ...fields, additionalLinkLabel: "", additionalLinkUrl: "" });
    } else {
      update(key, "");
    }
  }

  const addedOptions = SOCIAL_OPTIONS.filter((option) => addedKeys.includes(option.key));
  const remainingOptions = SOCIAL_OPTIONS.filter((option) => !addedKeys.includes(option.key));

  return (
    <div className="-mx-6 border-t border-gray-200 px-6" style={{ paddingTop: "var(--footer-padding-y, 0.75rem)" }}>
      <p className="crubio-section-label text-gray-500 mb-2">Social networks</p>
      <div className="flex flex-col gap-3">
        <Field label="Website" value={fields.website} onChange={(v) => update("website", v)} placeholder="acme.com" />
        <Field label="LinkedIn" value={fields.linkedinUrl} onChange={(v) => update("linkedinUrl", v)} placeholder="linkedin.com/in/ada" />

        {addedOptions.map((option) =>
          option.kind === "custom" ? (
            <div key="custom" className="flex flex-col gap-3">
              <Field
                label="Custom link label"
                value={fields.additionalLinkLabel}
                onChange={(v) => update("additionalLinkLabel", v)}
                placeholder="Portfolio"
                onRemove={() => removeKey("custom")}
              />
              <Field
                label="Custom link URL"
                value={fields.additionalLinkUrl}
                onChange={(v) => update("additionalLinkUrl", v)}
                placeholder="ada.dev"
              />
            </div>
          ) : (
            <Field
              key={option.key}
              label={option.label}
              value={fields[option.key]}
              onChange={(v) => update(option.key, v)}
              placeholder={option.placeholder}
              onRemove={() => removeKey(option.key)}
            />
          )
        )}

        {remainingOptions.length > 0 && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`${INPUT_CLASS} flex items-center justify-between font-medium text-teal-600`}
            >
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-plus text-xs" />
                Add social network
              </span>
              <i className={`fa-solid fa-chevron-down text-xs transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>
            {menuOpen && (
              <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                {remainingOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setAddedKeys((prev) => [...prev, option.key]);
                      setMenuOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
