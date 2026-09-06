import { useEffect, useRef, useState } from "react";
import { DEFAULT_SIGNATURE_STATE, type SignatureState } from "../lib/signature";
import { fromYamlDocument, toYamlDocument, YamlValidationError } from "../lib/signatureYaml";

interface Props {
  state: SignatureState;
  onImport: (state: SignatureState) => void;
}

const BUTTON_CLASS =
  "flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50";

function downloadYaml(state: SignatureState, filename: string) {
  const blob = new Blob([toYamlDocument(state)], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ImportExportSection({ state, onImport }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const parsed = fromYamlDocument(await file.text());
      onImport(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof YamlValidationError ? err.message : "Couldn't read that file.");
    }
  }

  return (
    <div className="-mx-6 border-t border-gray-200 px-6" style={{ paddingTop: "var(--footer-padding-y, 0.75rem)" }}>
      <p className="crubio-section-label text-teal-600 mb-2">Import/Export</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} className={BUTTON_CLASS}>
          <i className="fa-solid fa-upload" />
          Upload
        </button>
        <input ref={fileInputRef} type="file" accept=".yml,.yaml" onChange={handleUpload} className="hidden" />
        <div className="relative flex-1" ref={menuRef}>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className={BUTTON_CLASS}>
            <i className="fa-solid fa-download" />
            Download
            <i className={`fa-solid fa-chevron-down text-xs transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>
          {menuOpen && (
            <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={() => {
                  downloadYaml(state, "signature.yml");
                  setMenuOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                Current configuration
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadYaml(DEFAULT_SIGNATURE_STATE, "signature-template.yml");
                  setMenuOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                Default template
              </button>
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
