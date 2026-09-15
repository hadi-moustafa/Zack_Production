import type { PricingPackage } from "@/lib/types";
import { IconArrowRight, IconCamera, IconStar } from "@/components/icons";

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

  return (
    <section id="pricing" className="bg-[var(--bg-dark-alt)] py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_2fr]">
          <div>
            <p className="eyebrow">Pricing</p>
            <h2 className="font-serif-display mt-4 text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">
              Photography Packages
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--text-secondary)]">
              {description}
            </p>
            <a href="#contact" className="btn-ghost mt-8">
              Book now <IconArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {standardTiers.map((pkg) => {
              const Icon = TIER_ICON[pkg.name.toLowerCase()] ?? IconCamera;
              return (
                <div
                  key={pkg.id}
                  className="flex flex-col rounded-lg border border-[var(--border-subtle)] p-6"
                >
                  <Icon className="h-6 w-6 text-[var(--accent-gold)]" />
                  <h3 className="font-serif-display mt-4 text-xl font-semibold text-[var(--text-primary)]">
                    {pkg.name}
                  </h3>
                  <p className="mt-2 text-3xl font-semibold text-[var(--accent-gold)]">
                    {pkg.price}
                  </p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--text-secondary)]">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[var(--accent-gold)]" aria-hidden>
                          —
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className="btn-ghost mt-6 justify-center">
                    Choose plan
                  </a>
                </div>
              );
            })}

            {customTier ? (
              <div className="flex flex-col rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-dark)] p-6 sm:col-span-2">
                <h3 className="font-serif-display text-xl font-semibold text-[var(--text-primary)]">
                  {customTier.name}
                </h3>
                <p className="mt-2 text-lg text-[var(--accent-gold)]">Contact me</p>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-secondary)]">
                  {customTier.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
                <a href="#contact" className="btn-gold mt-6 w-fit">
                  Get in touch <IconArrowRight className="h-4 w-4" />
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
