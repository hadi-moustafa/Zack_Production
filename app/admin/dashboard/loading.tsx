export default function DashboardLoading() {
  return (
    <div className="min-h-full bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Admin</p>
            <h1 className="text-xl font-semibold text-neutral-900">Site dashboard</h1>
          </div>
          <div className="h-9 w-20 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
        <div className="flex gap-2 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          {["Photos & Videos", "Page Text", "Pricing", "Social Links", "Messages"].map((label) => (
            <span
              key={label}
              className="shrink-0 animate-pulse rounded-full bg-neutral-200 px-4 py-2 text-sm font-semibold text-transparent"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div className="h-40 animate-pulse rounded-xl border border-neutral-200 bg-white" />
          <div className="h-64 animate-pulse rounded-xl border border-neutral-200 bg-white" />
        </div>
      </main>
    </div>
  );
}
