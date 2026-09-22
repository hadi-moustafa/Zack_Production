"use client";

import { useState } from "react";
import { TextInput } from "@/components/admin/ui";

const NEW_OPTION = "__new_category__";

const selectClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-[15px] text-neutral-900 transition focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

export default function CategoryPicker({
  value,
  categories,
  onChange,
  className = "",
}: {
  value: string;
  categories: string[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed);
    setAdding(false);
    setDraft("");
  }

  if (adding) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <TextInput
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="New category name"
          className="!mt-0"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitDraft();
            }
            if (e.key === "Escape") {
              setAdding(false);
              setDraft("");
            }
          }}
        />
        <button
          type="button"
          onClick={commitDraft}
          className="shrink-0 rounded-lg border border-neutral-300 px-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => {
            setAdding(false);
            setDraft("");
          }}
          className="shrink-0 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-500 transition hover:border-neutral-900"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <select
      value={categories.includes(value) ? value : ""}
      onChange={(e) => {
        if (e.target.value === NEW_OPTION) {
          setAdding(true);
        } else {
          onChange(e.target.value);
        }
      }}
      className={`${selectClass} ${className}`}
    >
      <option value="" disabled>
        Select a category…
      </option>
      {categories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      <option value={NEW_OPTION}>+ Add new category</option>
    </select>
  );
}
