import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-10">
      {/* ===================== */}
      {/* Header (Light) */}
      {/* ===================== */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-3">
          <span className="h-6 w-1 rounded bg-sky-400" />
          <h1 className="text-3xl font-semibold">About</h1>
        </div>

        <p className="text-sm text-sky-900/70">
          A community + marketplace built to make everyday health feel simpler,
          more grounded, and more intentional.
        </p>
      </div>

      {/* ===================== */}
      {/* Philosophy (Light Blue) */}
      {/* ===================== */}
      <div className="rounded border border-sky-200 bg-sky-50/60 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Our Philosophy</h2>

        <p className="leading-relaxed opacity-90">
          We believe health starts with{" "}
          <span className="font-medium text-sky-700">
            what you put into your mouth
          </span>{" "}
          — not as a rigid rule, but as a foundation. The foods you repeat, the
          habits you default to, and especially what you drink every day quietly
          shape how you feel.
        </p>

        <p className="leading-relaxed opacity-90">
          <span className="font-medium text-sky-700">
            Water is the lifeblood
          </span>
          . It touches everything — energy, focus, digestion, recovery, and
          resilience. What you drink sets the tone: hydration, caffeine, sugar,
          electrolytes, supplements. Small choices, repeated consistently,
          matter.
        </p>

        <p className="leading-relaxed opacity-90">
          This platform exists to support clarity over hype, learning over
          perfection, and progress that fits real life.
        </p>
      </div>

      {/* ===================== */}
      {/* Dark Blue Section */}
      {/* ===================== */}
      <div className="rounded-xl bg-gradient-to-b from-sky-900 to-sky-950 text-sky-100 p-8 space-y-8">
        {/* Community + Marketplace */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded border border-sky-700/40 bg-sky-900/60 p-6 space-y-2">
            <h3 className="font-semibold text-sky-50">Community</h3>
            <p className="text-sm text-sky-200/80">
              A place to share what’s working, ask honest questions, and learn
              from others navigating their health journeys. Editor posts focus
              on practical, evidence-minded habits and products.
            </p>
            <Link
              className="text-sm underline text-sky-300 hover:text-sky-200"
              href="/community"
            >
              Explore Community →
            </Link>
          </div>

          <div className="rounded border border-sky-700/40 bg-sky-900/60 p-6 space-y-2">
            <h3 className="font-semibold text-sky-50">Marketplace</h3>
            <p className="text-sm text-sky-200/80">
              A curated set of products we’d genuinely recommend. We prioritize
              transparent ingredients, thoughtful formulation, and tools that
              support sustainable routines — not shortcuts.
            </p>
            <Link
              className="text-sm underline text-sky-300 hover:text-sky-200"
              href="/marketplace"
            >
              Browse Marketplace →
            </Link>
          </div>
        </div>

        {/* ===================== */}
        {/* Guardrails – Deeper Blue */}
        {/* ===================== */}
        <div className="rounded-xl bg-sky-950 border border-sky-700/50 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-sky-50">
            Our Guardrails
          </h2>

          <ul className="list-disc pl-5 space-y-2 text-sm text-sky-200">
            <li>No shame. Health is personal and non-linear.</li>
            <li>No miracle claims. We aim for clarity, not hype.</li>
            <li>
              Food-first mindset. Supplements support — they don’t replace —
              fundamentals.
            </li>
            <li>Practical beats perfect. Small habits win.</li>
          </ul>

          <p className="text-xs text-sky-400">
            This platform is for education and community discussion only and does
            not provide medical advice.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex gap-6 pt-2">
          <Link
            className="text-sm underline text-sky-300 hover:text-sky-200"
            href="/community"
          >
            Go to Community
          </Link>
          <Link
            className="text-sm underline text-sky-300 hover:text-sky-200"
            href="/marketplace"
          >
            Go to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
