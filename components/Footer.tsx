import SocialLinks from "@/components/SocialLinks";
import type { SocialLink } from "@/lib/types";

export default function Footer({
  photographerName,
  email,
  socialLinks,
}: {
  photographerName: string;
  email: string;
  socialLinks: SocialLink[];
}) {
  return (
    <footer className="border-t border-neutral-200 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:px-12 sm:text-left">
        <p className="text-sm text-neutral-500">
          © {new Date().getFullYear()} {photographerName}. All rights reserved.
          {email ? (
            <>
              {" "}
              ·{" "}
              <a href={`mailto:${email}`} className="hover:text-neutral-900">
                {email}
              </a>
            </>
          ) : null}
        </p>
        <SocialLinks links={socialLinks} />
      </div>
    </footer>
  );
}
