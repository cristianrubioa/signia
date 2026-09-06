import { useEffect, useState } from "react";

interface Props {
  html: string;
  onReset: () => void;
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
  return `<!doctype html><html><body style="margin:0;padding:40px 20px 20px;font-family:Arial,Helvetica,sans-serif;">${html}</body></html>`;
}

export default function SignaturePreview({ html, onReset }: Props) {
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center gap-1.5 border-b border-gray-200 px-4 py-3.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="border-b border-gray-200 px-4 py-3 text-sm text-gray-500">
          <p>
            <span className="font-semibold text-gray-700">To:</span>{" "}
            <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
              Your Recipient
            </span>
          </p>
          <p className="mt-1">
            <span className="font-semibold text-gray-700">Subject:</span> Check out my new Email Signature
          </p>
        </div>
        <div className="px-4 pt-4">
          <div className="h-2.5 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 h-2.5 w-1/2 rounded bg-gray-200" />
        </div>

        {html ? (
          <iframe title="Signature preview" srcDoc={previewDocument(html)} className="mt-8 h-80 w-full" />
        ) : (
          <div className="mt-8 flex h-80 items-center justify-center text-sm text-gray-400">
            Enter your name to see a preview
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <i className="fa-solid fa-eraser" />
          Clear
        </button>
        <button
          type="button"
          onClick={handleCopySignature}
          disabled={!html}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 py-2 font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <i className="fa-solid fa-copy" />
          {status === "copied-rich" ? "Copied!" : "Copy signature"}
        </button>
        <button
          type="button"
          onClick={handleCopyHtml}
          disabled={!html}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <i className="fa-solid fa-code" />
          {status === "copied-html" ? "Copied!" : "Copy HTML"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-center text-sm text-red-500">
          Couldn't access the clipboard. Try "Copy HTML" instead, or check your browser's permissions.
        </p>
      )}
    </div>
  );
}
