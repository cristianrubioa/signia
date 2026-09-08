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

  // Guards demo content from being written to localStorage as if it were a real edit.
  // Not a "skip first effect" ref: StrictMode double-invokes effects in dev.
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

  const mainRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [styleDrawerOpen, setStyleDrawerOpen] = useState(false);
  const [previewOverflows, setPreviewOverflows] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);

  useEffect(() => {
    if (!sidebarOpen && !styleDrawerOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setStyleDrawerOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen, styleDrawerOpen]);

  useEffect(() => {
    const mainEl = mainRef.current;
    const previewEl = previewRef.current;
    if (!mainEl || !previewEl) return;

    function recalc() {
      const mainStyle = getComputedStyle(mainEl!);
      const paddingTop = parseFloat(mainStyle.paddingTop);
      const availableWidth = mainEl!.clientWidth - parseFloat(mainStyle.paddingLeft) - parseFloat(mainStyle.paddingRight);
      const availableHeight = mainEl!.clientHeight - paddingTop - parseFloat(mainStyle.paddingBottom);
      const naturalWidth = previewEl!.offsetWidth;
      const naturalHeight = previewEl!.offsetHeight;
      if (naturalWidth === 0 || naturalHeight === 0) return;
      const next = Math.max(1, Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight));
      setMaxZoom(next);
      setZoom((z) => Math.min(z, next));
      setPreviewOverflows(mainEl!.scrollHeight > mainEl!.clientHeight + 1);
    }

    function updateScrollPosition() {
      setScrolledToEnd(mainEl!.scrollTop + mainEl!.clientHeight >= mainEl!.scrollHeight - 2);
    }

    recalc();
    updateScrollPosition();
    const observer = new ResizeObserver(() => {
      recalc();
      updateScrollPosition();
    });
    observer.observe(mainEl);
    observer.observe(previewEl);
    mainEl.addEventListener("scroll", updateScrollPosition);
    return () => {
      observer.disconnect();
      mainEl.removeEventListener("scroll", updateScrollPosition);
    };
  }, [html]);

  return (
    <div className="flex h-dvh flex-col bg-white">
      <header className="flex h-[var(--header-h)] shrink-0 items-center gap-3 border-b border-gray-200 px-6">
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={sidebarOpen}
          aria-controls="signature-form-sidebar"
          className="-ml-2 p-2 text-gray-600 md:hidden"
        >
          <i className="fa-solid fa-bars" />
        </button>
        <i className="fa-solid fa-signature text-2xl text-teal-700" />
        <span className="font-semibold leading-none tracking-wide text-[length:var(--app-name-size)]">Signia</span>
        <span className="hidden text-sm font-normal text-gray-600 md:inline">Email Signature Generator</span>
        <a className="crubio-home-link" href="https://crubio.fyi">
          crubio.fyi
        </a>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-visible md:pl-[var(--panel-w)] xl:flex-row">
        {(sidebarOpen || styleDrawerOpen) && (
          <div
            className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-30 bg-black/50 xl:hidden"
            onClick={() => {
              setSidebarOpen(false);
              setStyleDrawerOpen(false);
            }}
            aria-hidden="true"
          />
        )}

        <aside
          id="signature-form-sidebar"
          className={`fixed bottom-0 left-0 top-[var(--header-h)] z-40 flex w-[var(--panel-w)] shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-out md:translate-x-0 md:transition-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
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
            className="mt-auto border-t border-gray-200 px-6 text-center text-sm text-gray-600"
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

        <div className="flex min-h-0 flex-1 flex-col">
          <main
            ref={mainRef}
            className="flex min-h-0 min-w-0 flex-1 flex-col items-center-safe justify-center-safe overflow-y-auto bg-gray-50 p-4 md:p-6"
          >
            <SignaturePreview html={html} measureRef={previewRef} style={{ zoom }} />
          </main>

          <div className="flex shrink-0 flex-col items-center gap-3 bg-gray-50 py-3">
            <div className="h-px w-4/5 bg-gray-200" />
            <div className="grid w-full grid-cols-3 items-center px-4">
              <div />
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => updateFields(EMPTY_SIGNATURE_FIELDS)}
                  className="flex w-28 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <i className="fa-solid fa-eraser text-base" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => applyState(DEFAULT_SIGNATURE_STATE)}
                  className="flex w-28 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <i className="fa-solid fa-rotate-left text-base" />
                  Reset
                </button>
              </div>
              <div className="flex justify-end">
                {previewOverflows && (
                  <button
                    type="button"
                    onClick={() =>
                      mainRef.current?.scrollTo({
                        top: scrolledToEnd ? 0 : mainRef.current.scrollHeight,
                        behavior: "smooth",
                      })
                    }
                    aria-label={scrolledToEnd ? "Scroll to top of preview" : "Scroll to bottom of preview"}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm md:hidden"
                  >
                    <i className={`fa-solid ${scrolledToEnd ? "fa-chevron-up" : "fa-chevron-down"}`} />
                  </button>
                )}
                {maxZoom > 1 && (
                  <div className="hidden items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm md:flex">
                    <i className="fa-solid fa-magnifying-glass-minus text-xs text-gray-400" />
                    <input
                      type="range"
                      min={1}
                      max={maxZoom}
                      step={0.01}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-32 accent-teal-600"
                      aria-label="Zoom preview"
                    />
                    <i className="fa-solid fa-magnifying-glass-plus text-xs text-gray-400" />
                    <span className="w-10 text-right text-xs font-medium text-gray-600">{Math.round(zoom * 100)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside
          id="signature-style-drawer"
          className={`fixed bottom-0 right-0 top-[var(--header-h)] z-40 flex w-[var(--panel-w)] shrink-0 flex-col border-l border-gray-200 bg-white transition-transform duration-200 ease-out xl:static xl:translate-x-0 xl:transition-none ${
            styleDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setStyleDrawerOpen((o) => !o)}
            aria-label="Toggle style panel"
            aria-expanded={styleDrawerOpen}
            className="absolute right-full top-1/2 -translate-y-1/2 rounded-l-lg border border-r-0 border-gray-200 bg-white p-2 text-gray-600 shadow-sm xl:hidden"
          >
            <i className={`fa-solid fa-chevron-left transition-transform ${styleDrawerOpen ? "rotate-180" : ""}`} />
          </button>

          <div className="flex-1 overflow-y-auto p-6">
            <SignatureStylePanel
              fields={fields}
              onFieldsChange={updateFields}
              template={template}
              onTemplateChange={updateTemplate}
              accentColor={accentColor}
              onAccentColorChange={updateAccentColor}
              onCommit={() => setStyleDrawerOpen(false)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
