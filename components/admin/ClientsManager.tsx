"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { photoPublicUrl } from "@/lib/media";
import { byOrder } from "@/lib/categories";
import type { Client, ClientKind } from "@/lib/types";
import { Card, SectionHeading, Label, TextInput, PrimaryButton, SecondaryButton, DangerLink } from "@/components/admin/ui";

const KIND_LABEL: Record<ClientKind, string> = { brand: "Brand / company", person: "Famous person" };

const selectClass =
  "mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-[15px] text-neutral-900 focus:border-neutral-900 focus:outline-none";

type Draft = { name: string; kind: ClientKind; role: string; url: string; logo_mono: boolean; file: File | null };
const EMPTY: Draft = { name: "", kind: "brand", role: "", url: "", logo_mono: true, file: null };

export default function ClientsManager({ initialClients, tableMissing }: { initialClients: Client[]; tableMissing: boolean }) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sorted = [...clients].sort(byOrder);

  async function send(method: "POST" | "PATCH" | "DELETE", body?: FormData | object, query = "") {
    setError(null);
    const isForm = body instanceof FormData;
    const res = await fetch(`/api/clients${query}`, {
      method,
      headers: body && !isForm ? { "Content-Type": "application/json" } : undefined,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) setError(json.error || "Couldn't save the change.");
    // Keep the dashboard's copy current, so the list survives switching tabs.
    else router.refresh();
    return res.ok ? json : null;
  }

  async function create() {
    if (!draft.name.trim()) {
      setError("Give them a name.");
      return;
    }
    setBusy(true);
    const form = new FormData();
    form.set("name", draft.name);
    form.set("kind", draft.kind);
    form.set("role", draft.role);
    form.set("url", draft.url);
    form.set("logo_mono", String(draft.logo_mono));
    if (draft.file) form.set("file", draft.file);
    const json = await send("POST", form);
    setBusy(false);
    if (json?.client) {
      setClients((prev) => [...prev, json.client]);
      setDraft({ ...EMPTY, kind: draft.kind });
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function update(id: string, change: Partial<Client>) {
    const before = clients;
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...change } : c)));
    const json = await send("PATCH", { id, ...change });
    if (json?.client) setClients((prev) => prev.map((c) => (c.id === id ? json.client : c)));
    else setClients(before);
  }

  async function replaceImage(id: string, file: File) {
    const form = new FormData();
    form.set("id", id);
    form.set("file", file);
    const json = await send("PATCH", form);
    if (json?.client) setClients((prev) => prev.map((c) => (c.id === id ? json.client : c)));
  }

  async function move(index: number, dir: -1 | 1) {
    const a = sorted[index];
    const b = sorted[index + dir];
    if (!a || !b) return;
    const next = [
      { id: a.id, sort_order: b.sort_order },
      { id: b.id, sort_order: a.sort_order },
    ];
    setClients((prev) => prev.map((c) => ({ ...c, sort_order: next.find((n) => n.id === c.id)?.sort_order ?? c.sort_order })));
    await send("PATCH", { reorder: next });
  }

  async function remove(client: Client) {
    if (!confirm(`Remove “${client.name}”?`)) return;
    if (await send("DELETE", undefined, `?id=${client.id}`)) setClients((prev) => prev.filter((c) => c.id !== client.id));
  }

  if (tableMissing) {
    return (
      <Card>
        <SectionHeading title="Clients" />
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          The clients list isn&apos;t set up in the database yet. Run <code>supabase/clients-2026-10.sql</code> in the Supabase SQL
          editor, then reload this page.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title="Add a brand or famous person"
          description="Shown in the Headliner design's “guest list” section (it stays hidden until you add someone). Only add real clients you've worked with. For brands, upload their logo (a transparent PNG or SVG looks best); for people, a photo — ideally one of you together."
        />
        {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="client-name">Name</Label>
            <TextInput id="client-name" value={draft.name} maxLength={80} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="client-kind">Type</Label>
            <select id="client-kind" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as ClientKind })} className={selectClass}>
              {(Object.keys(KIND_LABEL) as ClientKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="client-role">{draft.kind === "person" ? "Who they are (optional)" : "What we did (optional)"}</Label>
            <TextInput
              id="client-role"
              value={draft.role}
              maxLength={80}
              placeholder={draft.kind === "person" ? "e.g. Singer" : "e.g. Grand opening"}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="client-url">Link (optional)</Label>
            <TextInput
              id="client-url"
              type="url"
              value={draft.url}
              placeholder="https://instagram.com/…"
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="client-file">{draft.kind === "person" ? "Photo (optional)" : "Logo (optional)"}</Label>
            <input
              ref={fileRef}
              id="client-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              onChange={(e) => setDraft({ ...draft, file: e.target.files?.[0] ?? null })}
              className="mt-1.5 block w-full text-sm text-neutral-700 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
          </div>
          {draft.kind === "brand" ? (
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700">
              <input type="checkbox" checked={draft.logo_mono} onChange={(e) => setDraft({ ...draft, logo_mono: e.target.checked })} className="h-4 w-4" />
              Show logo in white (untick for logos on a coloured background)
            </label>
          ) : null}
        </div>
        <div className="mt-5">
          <PrimaryButton onClick={create} disabled={busy}>
            {busy ? "Adding…" : "Add"}
          </PrimaryButton>
        </div>
      </Card>

      <Card>
        <SectionHeading title={`On the list (${clients.length})`} description="Order here is the order on the site. Hidden entries stay saved but don't show." />
        {sorted.length === 0 ? <p className="text-sm text-neutral-500">Nobody yet.</p> : null}
        <ul className="space-y-3">
          {sorted.map((client, index) => (
            <li key={client.id} className={`rounded-lg border p-4 ${client.visible ? "border-neutral-200" : "border-dashed border-neutral-300 bg-neutral-50"}`}>
              <div className="flex gap-4">
                <label className="relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-neutral-900 text-center text-[0.65rem] text-white/70" title="Change image">
                  {client.image_path ? (
                    <Image
                      src={photoPublicUrl(client.image_path)}
                      alt={client.name}
                      fill
                      sizes="80px"
                      className={client.kind === "brand" ? `object-contain p-2 ${client.logo_mono ? "brightness-0 invert" : ""}` : "object-cover"}
                    />
                  ) : (
                    "Add image"
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    className="sr-only"
                    onChange={(e) => e.target.files?.[0] && replaceImage(client.id, e.target.files[0])}
                  />
                </label>
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`c-name-${client.id}`}>Name</Label>
                    <TextInput
                      id={`c-name-${client.id}`}
                      defaultValue={client.name}
                      onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== client.name && update(client.id, { name: e.target.value.trim() })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`c-role-${client.id}`}>{client.kind === "person" ? "Who they are" : "What we did"}</Label>
                    <TextInput
                      id={`c-role-${client.id}`}
                      defaultValue={client.role}
                      onBlur={(e) => e.target.value.trim() !== client.role && update(client.id, { role: e.target.value.trim() })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor={`c-url-${client.id}`}>Link</Label>
                    <TextInput
                      id={`c-url-${client.id}`}
                      type="url"
                      defaultValue={client.url}
                      onBlur={(e) => e.target.value.trim() !== client.url && update(client.id, { url: e.target.value.trim() })}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <select
                  aria-label="Type"
                  value={client.kind}
                  onChange={(e) => update(client.id, { kind: e.target.value as ClientKind })}
                  className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm"
                >
                  {(Object.keys(KIND_LABEL) as ClientKind[]).map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={client.visible} onChange={(e) => update(client.id, { visible: e.target.checked })} /> Visible
                </label>
                {client.kind === "brand" && client.image_path ? (
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={client.logo_mono} onChange={(e) => update(client.id, { logo_mono: e.target.checked })} /> White logo
                  </label>
                ) : null}
                <span className="ml-auto flex items-center gap-2">
                  <SecondaryButton className="!px-3 !py-1.5" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                    ↑
                  </SecondaryButton>
                  <SecondaryButton className="!px-3 !py-1.5" onClick={() => move(index, 1)} disabled={index === sorted.length - 1} aria-label="Move down">
                    ↓
                  </SecondaryButton>
                  <DangerLink onClick={() => remove(client)}>Remove</DangerLink>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
