import Image from "next/image";
import InView from "@/components/headliner/InView";
import EdLabel from "@/components/editorial/EdLabel";
import { photoPublicUrl } from "@/lib/media";
import { site } from "@/lib/site";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

// The award as one quiet line, then the portrait beside the name, roles and
// bio. The bio's opening paragraph shows; the rest opens on request.
export default function EdAbout({
  bio,
  photoPath,
  name,
  roles,
  award,
  tagline,
}: {
  bio: string;
  photoPath: string | null;
  name: string;
  roles: string;
  award: string;
  tagline: string;
}) {
  const [first, ...rest] = bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const roleList = roles.split(/[·•|]/).map((r) => r.trim()).filter(Boolean);

  return (
    <>
      {award ? (
        <div className="border-b border-[var(--ed-line)]">
          <p className="ed-wrap ed-label ed-label-ink py-6 text-center">
            <span aria-hidden className="mr-2 text-[var(--ed-accent)]">
              ★
            </span>
            {award}
          </p>
        </div>
      ) : null}

      <section id="about" className="ed-section scroll-mt-16">
        <InView className="ed-wrap" threshold={0.15}>
          <EdLabel n={1}>Who we are</EdLabel>

          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-8">
            {photoPath ? (
              <div className="ed-reveal relative aspect-[4/5] w-full max-w-md bg-[var(--ed-bg-alt)] lg:col-span-5 lg:max-w-none">
                <Image
                  src={photoPublicUrl(photoPath)}
                  alt={`${site.founder}, photographer and filmmaker at ${site.name}`}
                  fill
                  sizes="(min-width: 1024px) 38vw, (min-width: 448px) 448px, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className={`flex flex-col justify-end ${photoPath ? "lg:col-span-6 lg:col-start-7" : "lg:col-span-8"}`}>
              <h2 className="ed-display ed-h2 ed-reveal" style={d(100)}>
                {name}
              </h2>
              {roleList.length ? (
                <p className="ed-label ed-label-ink ed-reveal mt-5" style={d(200)}>
                  {roleList.join(" · ")}
                </p>
              ) : null}
              {first ? (
                <p className="ed-lead ed-reveal mt-8 max-w-[60ch] !text-[var(--ed-ink)]" style={d(300)}>
                  {first}
                </p>
              ) : null}
              {rest.length ? (
                <details className="ed-acc ed-reveal mt-6" style={d(400)}>
                  <summary className="ed-link w-fit">
                    More about {name.split(/\s+/)[0]} <span aria-hidden className="ed-plus" />
                  </summary>
                  {rest.map((p, i) => (
                    <p key={i} className="ed-body mt-4">
                      {p}
                    </p>
                  ))}
                </details>
              ) : null}
            </div>
          </div>
        </InView>

        {tagline ? (
          <InView className="ed-wrap mt-24 sm:mt-36">
            <p className="ed-display ed-h2 ed-reveal italic">{tagline}</p>
          </InView>
        ) : null}
      </section>
    </>
  );
}
