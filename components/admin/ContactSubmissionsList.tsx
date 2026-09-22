import type { ContactSubmission } from "@/lib/types";
import { Card, SectionHeading } from "@/components/admin/ui";

export default function ContactSubmissionsList({
  submissions,
}: {
  submissions: ContactSubmission[];
}) {
  return (
    <Card>
      <SectionHeading title={`Messages (${submissions.length})`} description="Sent through the contact form." />
      {submissions.length === 0 ? (
        <p className="text-sm text-neutral-500">No messages yet.</p>
      ) : (
        <div className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200">
          {submissions.map((s) => (
            <div key={s.id} className="p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-neutral-900">{s.name}</p>
                <p className="text-xs text-neutral-400">{new Date(s.created_at).toLocaleString()}</p>
              </div>
              <p className="mt-0.5 text-sm text-neutral-500">
                <a href={`mailto:${s.email}`} className="hover:text-neutral-900 hover:underline">
                  {s.email}
                </a>
                {s.phone ? ` · ${s.phone}` : ""}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">{s.message}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
