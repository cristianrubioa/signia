import { useEffect, useMemo, useRef, useState } from "react";
import ImportExportSection from "./components/ImportExportSection";
import SignatureForm from "./components/SignatureForm";
import SignaturePreview from "./components/SignaturePreview";
import SignatureStylePanel from "./components/SignatureStylePanel";
import {
  buildSignatureHtml,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_SIGNATURE_STATE,
  EMPTY_SIGNATURE_FIELDS,
  type SignatureFields,
  type SignatureState,
  type SignatureTemplate,
} from "./lib/signature";

const STORAGE_KEY = "signia:state:v1";

function loadPersistedState(): SignatureState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || typeof parsed.fields !== "object") return null;
    return {
      fields: { ...EMPTY_SIGNATURE_FIELDS, ...parsed.fields },
      template: parsed.template ?? "horizontal",
      accentColor: parsed.accentColor ?? DEFAULT_ACCENT_COLOR,
    };
  } catch {
    return null;
  }
}

const initialState: SignatureState = loadPersistedState() ?? DEFAULT_SIGNATURE_STATE;

export default function App() {
  const [fields, setFields] = useState<SignatureFields>(initialState.fields);
  const [template, setTemplate] = useState<SignatureTemplate>(initialState.template);
  const [accentColor, setAccentColor] = useState(initialState.accentColor);

  // Tracks whether the user (or Clear) has actually changed state, so the demo
  // content shown on first visit is never itself written to localStorage —
  // only real edits are. A ref-based "skip the first effect run" guard doesn't
  // work here because React StrictMode double-invokes effects in dev.
  const hasInteracted = useRef(false);

  function updateFields(next: SignatureFields) {
    hasInteracted.current = true;
    setFields(next);
  }
  function updateTemplate(next: SignatureTemplate) {
    hasInteracted.current = true;
    setTemplate(next);
  }
  function updateAccentColor(next: string) {
    hasInteracted.current = true;
    setAccentColor(next);
  }
  function applyState(next: SignatureState) {
    hasInteracted.current = true;
    setFields(next.fields);
    setTemplate(next.template);
    setAccentColor(next.accentColor);
  }

  useEffect(() => {
    if (!hasInteracted.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ fields, template, accentColor }));
  }, [fields, template, accentColor]);

  const html = useMemo(() => buildSignatureHtml(fields, template, accentColor), [fields, template, accentColor]);

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex h-[var(--header-h)] shrink-0 items-center gap-3 border-b border-gray-200 px-6">
        <i className="fa-solid fa-signature text-2xl text-teal-600" />
        <span className="font-semibold leading-none tracking-wide text-[length:var(--app-name-size)]">Signia</span>
        <span className="text-sm font-normal text-gray-500">Email Signature Generator</span>
        <a className="crubio-home-link" href="https://crubio.fyi">
          crubio.fyi
        </a>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[var(--panel-w)] shrink-0 flex-col border-r border-gray-200">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="pb-5">
              <SignatureForm fields={fields} onFieldsChange={updateFields} />
            </div>
            <ImportExportSection
              state={{ fields, template, accentColor }}
              onImport={applyState}
            />
          </div>
          <div
            className="mt-auto border-t border-gray-200 px-6 text-center text-sm text-gray-500"
            style={{ paddingTop: "var(--footer-padding-y, 0.75rem)", paddingBottom: "var(--footer-padding-y, 0.75rem)" }}
          >
            Made with <span className="text-base text-red-400">♥</span> by{" "}
            <a
              className="transition-colors hover:text-gray-900"
              href="https://github.com/cristianrubioa"
              target="_blank"
              rel="noopener noreferrer"
            >
              @cristianrubioa
            </a>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto bg-gray-50 p-6">
          <SignaturePreview
            html={html}
            onReset={() => updateFields(EMPTY_SIGNATURE_FIELDS)}
            onResetToDefault={() => applyState(DEFAULT_SIGNATURE_STATE)}
          />
        </main>

        <aside className="flex w-[var(--panel-w)] shrink-0 flex-col border-l border-gray-200">
          <div className="flex-1 overflow-y-auto p-6">
            <SignatureStylePanel
              fields={fields}
              onFieldsChange={updateFields}
              template={template}
              onTemplateChange={updateTemplate}
              accentColor={accentColor}
              onAccentColorChange={updateAccentColor}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
