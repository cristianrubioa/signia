import { useEffect, useState } from "react";

interface Props {
  html: string;
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
  return `<!doctype html><html><body style="margin:0;padding:16px;font-family:Arial,Helvetica,sans-serif;">${html}</body></html>`;
}

export default function SignaturePreview({ html }: Props) {
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
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="rounded-lg border border-gray-200 bg-white">
        {html ? (
          <iframe title="Signature preview" srcDoc={previewDocument(html)} className="h-56 w-full rounded-lg" />
        ) : (
          <div className="flex h-56 items-center justify-center text-sm text-gray-400">
            Enter your name to see a preview
          </div>
        )}
      </div>

      <div className="flex gap-3">
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
