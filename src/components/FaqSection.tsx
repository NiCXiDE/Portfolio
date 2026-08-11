import type { Dictionary } from "@/i18n/dictionaries";

export function FaqSection({ dict }: { dict: Dictionary }) {
  return (
    <section
      id="faq"
      className="w-full scroll-mt-24 border-t border-ink/10 bg-sky-soft/60 px-6 py-8 sm:px-10 md:px-20"
      aria-labelledby="faq-heading"
    >
      <h2
        id="faq-heading"
        className="text-base font-bold text-ink md:text-lg"
      >
        {dict.faq.title}
      </h2>
      <dl className="mt-4 grid gap-4 md:grid-cols-2 md:gap-x-10 md:gap-y-5">
        {dict.faq.items.map((item) => (
          <div key={item.q} className="max-w-xl">
            <dt className="text-sm font-semibold text-ink md:text-base">
              {item.q}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink/80 md:text-[0.95rem]">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
