import type { PricingPackage } from "@/lib/types";

export default function Pricing({ packages }: { packages: PricingPackage[] }) {
  if (packages.length === 0) return null;

  return (
    <section id="pricing" className="bg-neutral-50 py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-12">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Pricing
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex flex-col rounded-lg border border-neutral-200 bg-white p-6"
            >
              <h3 className="text-lg font-semibold">{pkg.name}</h3>
              <p className="mt-2 text-2xl font-bold">{pkg.price}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-600">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
