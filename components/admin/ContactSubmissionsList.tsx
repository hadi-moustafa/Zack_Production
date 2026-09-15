import type { ContactSubmission } from "@/lib/types";

export default function ContactSubmissionsList({
  submissions,
}: {
  submissions: ContactSubmission[];
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold">Contact submissions</h2>
      {submissions.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">No messages yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-neutral-200 rounded-md border border-neutral-200">
          {submissions.map((s) => (
            <div key={s.id} className="p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-neutral-400">
                  {new Date(s.created_at).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-neutral-500">
                {s.email}
                {s.phone ? ` · ${s.phone}` : ""}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">{s.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
