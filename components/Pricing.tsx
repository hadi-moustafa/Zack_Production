import type { PricingPackage } from "@/lib/types";
import { IconArrowRight, IconCamera, IconStar } from "@/components/icons";
import Reveal from "@/components/Reveal";

const TIER_ICON: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  basic: IconCamera,
  standard: IconStar,
  premium: IconStar,
};

export default function Pricing({
  packages,
  description,
}: {
  packages: PricingPackage[];
  description: string;
}) {
  if (packages.length === 0) return null;

  const standardTiers = packages.filter((p) => p.price.trim() !== "");
  const customTier = packages.find((p) => p.price.trim() === "");
  const featuredIndex = Math.min(1, standardTiers.length - 1);

  return (
    <section id="pricing" className="bg-[var(--bg-dark-alt)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="section-index justify-center">
            <span className="num">03</span>
            <span className="line" />
            <span className="eyebrow">Pricing</span>
          </div>
          <h2 className="font-serif-display mt-4 text-[clamp(2.25rem,7vw,3.75rem)] font-semibold leading-[1.02] text-[var(--text-primary)]">
            Photography Packages
          </h2>
          <p className="mt-6 text-[clamp(0.95rem,2.4vw,1.05rem)] leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {standardTiers.map((pkg, i) => {
            const Icon = TIER_ICON[pkg.name.toLowerCase()] ?? IconCamera;
            const featured = i === featuredIndex && standardTiers.length > 1;
            return (
              <Reveal key={pkg.id} delay={i * 100}>
                <div
                  className={`relative flex h-full flex-col rounded-xl p-7 transition-all duration-300 ${
                    featured
                      ? "border border-[var(--accent-gold)] bg-[var(--bg-dark)] shadow-[0_30px_80px_-30px_rgba(201,162,75,0.35)] sm:-translate-y-3"
                      : "border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/60"
                  }`}
                >
                  {featured ? (
                    <span className="absolute -top-3 left-7 bg-[var(--accent-gold)] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-[#0a0a0a]">
                      Most popular
                    </span>
                  ) : null}
                  <Icon className="h-7 w-7 text-[var(--accent-gold)]" />
                  <h3 className="font-serif-display mt-5 text-2xl font-semibold text-[var(--text-primary)]">
                    {pkg.name}
                  </h3>
                  <p className="mt-2 text-4xl font-semibold text-[var(--accent-gold)]">
                    {pkg.price}
                  </p>
                  <ul className="mt-5 flex-1 space-y-2.5 text-sm text-[var(--text-secondary)]">
                    {pkg.features.map((feature, fi) => (
                      <li key={fi} className="flex gap-2.5">
                        <span className="text-[var(--accent-gold)]" aria-hidden>
                          —
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className={featured ? "btn-gold mt-7 justify-center" : "btn-ghost mt-7 justify-center"}
                  >
                    Choose plan <IconArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>

        {customTier ? (
          <Reveal delay={standardTiers.length * 100} className="mt-6">
            <div className="flex flex-col items-start gap-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-dark)] p-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-serif-display text-xl font-semibold text-[var(--text-primary)]">
                  {customTier.name}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-[var(--text-secondary)]">
                  {customTier.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
              <a href="#contact" className="btn-gold w-full shrink-0 justify-center sm:w-fit">
                Get in touch <IconArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
