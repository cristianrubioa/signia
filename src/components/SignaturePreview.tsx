import { useEffect, useState, type CSSProperties, type RefObject } from "react";

interface Props {
  html: string;
  onReset: () => void;
  onResetToDefault: () => void;
  measureRef?: RefObject<HTMLDivElement | null>;
  actionsBarRef?: RefObject<HTMLDivElement | null>;
  style?: CSSProperties;
}

type CopyStatus = "idle" | "copied-rich" | "copied-html" | "error";

function toPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function previewDocument(html: string): string {
  // ponytail: overflow:hidden clips instead of scrolling if a heavily-filled signature ever
  // exceeds the iframe's fixed height, so the internal scrollbar can never appear.
  return `<!doctype html><html><head><style>html,body{margin:0;height:100%;overflow:hidden;}</style></head><body style="padding:64px 20px 24px;font-family:Arial,Helvetica,sans-serif;">${html}</body></html>`;
}

export default function SignaturePreview({ html, onReset, onResetToDefault, measureRef, actionsBarRef, style }: Props) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  function handleCopySignature() {
    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([toPlainText(html)], { type: "text/plain" }),
        }),
      ])
      .then(() => setStatus("copied-rich"))
      .catch(() => setStatus("error"));
  }

  function handleCopyHtml() {
    navigator.clipboard
      .writeText(html)
      .then(() => setStatus("copied-html"))
      .catch(() => setStatus("error"));
  }

  return (
    <>
      <div ref={measureRef} className="mx-auto flex w-full max-w-sm flex-col gap-8 md:max-w-3xl" style={style}>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center gap-1.5 border-b border-gray-200 px-4 py-3.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="border-b border-gray-200 px-4 py-3 text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-700">To:</span>{" "}
              <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                Your Recipient
              </span>
            </p>
            <p className="mt-2">
              <span className="font-semibold text-gray-700">Subject:</span>{" "}
              <span className="font-semibold">Check out my new Email Signature</span>
            </p>
          </div>
          <div className="px-4 pt-4">
            <div className="h-2.5 w-3/4 rounded bg-gray-200" />
            <div className="mt-2 h-2.5 w-1/2 rounded bg-gray-200" />
            <div className="mt-2 h-2.5 w-2/3 rounded bg-gray-200" />
          </div>

          {html ? (
            <iframe title="Signature preview" srcDoc={previewDocument(html)} className="mt-10 h-80 w-full" />
          ) : (
            <div className="mt-8 flex h-80 items-center justify-center text-sm text-gray-400">
              Enter your name to see a preview
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopySignature}
            disabled={!html}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <i className="fa-solid fa-copy text-base" />
            {status === "copied-rich" ? "Copied!" : "Copy signature"}
          </button>
          <button
            type="button"
            onClick={handleCopyHtml}
            disabled={!html}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <i className="fa-solid fa-code text-base" />
            {status === "copied-html" ? "Copied!" : "Copy HTML"}
          </button>
        </div>

        {status === "error" && (
          <p className="text-center text-sm text-red-500">
            Couldn't access the clipboard. Try "Copy HTML" instead, or check your browser's permissions.
          </p>
        )}
      </div>

      <div ref={actionsBarRef} className="absolute bottom-4 left-1/2 flex -translate-x-1/2 justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex w-28 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <i className="fa-solid fa-eraser text-base" />
          Clear
        </button>
        <button
          type="button"
          onClick={onResetToDefault}
          className="flex w-28 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <i className="fa-solid fa-rotate-left text-base" />
          Reset
        </button>
      </div>
    </>
  );
}
