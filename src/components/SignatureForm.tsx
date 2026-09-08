import { useId } from "react";
import type { SignatureFields } from "../lib/signature";

interface Props {
  fields: SignatureFields;
  onFieldsChange: (fields: SignatureFields) => void;
}

const INPUT_CLASS =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white";
const LABEL_CLASS = "block text-sm font-medium text-gray-700 mb-1.5";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    </div>
  );
}

export default function SignatureForm({ fields, onFieldsChange }: Props) {
  function update<K extends keyof SignatureFields>(key: K, value: SignatureFields[K]) {
    onFieldsChange({ ...fields, [key]: value });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="crubio-section-label text-teal-700 mb-2">Details</p>
        <div className="flex flex-col gap-3">
          <Field label="Full name" value={fields.name} onChange={(v) => update("name", v)} placeholder="Ada Lovelace" />
          <Field
            label="Job title"
            value={fields.title}
            onChange={(v) => update("title", v)}
            placeholder="Software Engineer"
          />
          <Field
            label="Company"
            value={fields.company}
            onChange={(v) => update("company", v)}
            placeholder="Acme Inc."
          />
          <Field
            label="Phone"
            value={fields.phone}
            onChange={(v) => update("phone", v)}
            placeholder="+1 555 123 4567"
            type="tel"
          />
          <Field
            label="Email"
            value={fields.email}
            onChange={(v) => update("email", v)}
            placeholder="ada@acme.com"
            type="email"
          />
          <Field
            label="Address"
            value={fields.address}
            onChange={(v) => update("address", v)}
            placeholder="1 Memorial Dr, Cambridge, MA"
          />
        </div>
      </div>
    </div>
  );
}
