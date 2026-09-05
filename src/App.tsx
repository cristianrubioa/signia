import { useMemo, useState } from "react";
import SignatureForm from "./components/SignatureForm";
import SignaturePreview from "./components/SignaturePreview";
import {
  buildSignatureHtml,
  DEFAULT_ACCENT_COLOR,
  EMPTY_SIGNATURE_FIELDS,
  type SignatureFields,
  type SignatureTemplate,
} from "./lib/signature";

export default function App() {
  const [fields, setFields] = useState<SignatureFields>(EMPTY_SIGNATURE_FIELDS);
  const [template, setTemplate] = useState<SignatureTemplate>("horizontal");
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_COLOR);

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
            <SignatureForm
              fields={fields}
              onFieldsChange={setFields}
              template={template}
              onTemplateChange={setTemplate}
              accentColor={accentColor}
              onAccentColorChange={setAccentColor}
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

        <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto p-6">
          <SignaturePreview html={html} onReset={() => setFields(EMPTY_SIGNATURE_FIELDS)} />
        </main>
      </div>
    </div>
  );
}
