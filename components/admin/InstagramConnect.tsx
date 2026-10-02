"use client";

import { useState } from "react";
import { Card, SectionHeading, Label, TextInput, PrimaryButton, DangerLink } from "@/components/admin/ui";

export type InstagramStatus = { username: string; refreshedAt: string } | null;

export default function InstagramConnect({ initialStatus }: { initialStatus: InstagramStatus }) {
  const [status, setStatus] = useState<InstagramStatus>(initialStatus);
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/instagram", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? "Couldn't connect Instagram.");
      return;
    }
    setToken("");
    setStatus({ username: json.username, refreshedAt: new Date().toISOString() });
  }

  async function disconnect() {
    if (!confirm("Disconnect Instagram? The latest reel will stop showing on the site.")) return;
    const res = await fetch("/api/instagram", { method: "DELETE" });
    if (res.ok) setStatus(null);
  }

  return (
    <Card>
      <SectionHeading
        title="Latest Instagram reel"
        description="Shows your newest Instagram video in the Follow Along section. It updates on its own every 30 minutes."
      />
      {status ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="font-semibold">Connected as @{status.username}</span>
          <span className="text-emerald-700/70">
            Token renewed {new Date(status.refreshedAt).toLocaleDateString()} — it renews itself automatically.
          </span>
          <DangerLink onClick={disconnect} className="ml-auto">
            Disconnect
          </DangerLink>
        </div>
      ) : null}

      <div className={status ? "mt-5" : ""}>
        <Label htmlFor="ig-token">{status ? "Replace access token" : "Instagram access token"}</Label>
        <TextInput
          id="ig-token"
          type="password"
          autoComplete="off"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="IGAA…"
        />
        <p className="mt-1.5 text-xs text-neutral-500">
          A long-lived token from the Instagram API (Instagram Login) for a Business or Creator account.
        </p>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-5">
        <PrimaryButton onClick={connect} disabled={saving || !token.trim()}>
          {saving ? "Connecting…" : status ? "Update token" : "Connect Instagram"}
        </PrimaryButton>
      </div>
    </Card>
  );
}
