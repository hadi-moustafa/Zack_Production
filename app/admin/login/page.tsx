"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // Stay in the loading state through navigation — this component is
    // about to unmount, so there's no "success" state to show here; the
    // dashboard's own loading.tsx takes over as soon as the URL changes.
    router.push("/admin/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-neutral-100 px-5 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Admin</p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">Sign in to the dashboard</h1>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-[15px] transition focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-[15px] transition focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </main>
  );
}
