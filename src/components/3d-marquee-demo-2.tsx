"use client";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { testimonials } from "@/data/testimonials";

const REVIEW_TILE_COUNT = 56;

export function ThreeDMarqueeDemoSecond() {
  const reviewItems = Array.from({ length: REVIEW_TILE_COUNT }, (_, index) => {
    const testimonial = testimonials[index % testimonials.length];
    const snippet =
      testimonial.content.length > 110
        ? `${testimonial.content.slice(0, 110)}...`
        : testimonial.content;

    return {
      id: `review-tile-${index}-${testimonial.id}`,
      content: (
        <article className="w-[320px] rounded-2xl border border-white/15 bg-slate-950/85 p-4 text-left text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/25 text-xs font-bold text-sky-100">
              {testimonial.avatar}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {testimonial.name}
              </p>
              <p className="truncate text-xs text-slate-300">
                {testimonial.role} at {testimonial.company}
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-200">{snippet}</p>

          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="font-medium text-sky-200">{testimonial.course}</span>
            <span className="tracking-wide text-amber-300">
              {"★".repeat(testimonial.rating)}
            </span>
          </div>
        </article>
      ),
    };
  });

  return (
    <div className="relative mx-auto my-10 flex h-screen w-full max-w-7xl flex-col items-center justify-center overflow-hidden rounded-3xl">
      <h2 className="relative z-20 mx-auto max-w-4xl text-center text-2xl font-bold text-balance text-white md:text-4xl lg:text-6xl">
        Learners are winning careers, one{" "}
        <span className="relative z-20 inline-block rounded-xl bg-blue-500/40 px-4 py-1 text-white underline decoration-sky-500 decoration-[6px] underline-offset-[16px] backdrop-blur-sm">
          review
        </span>{" "}
        at a time.
      </h2>
      <p className="relative z-20 mx-auto max-w-2xl py-8 text-center text-sm text-neutral-200 md:text-base">
        Real user stories from Arcade Learn members who switched roles,
        increased salary, and built production-ready skills through our
        roadmap-first learning experience.
      </p>

      <div className="relative z-20 flex flex-wrap items-center justify-center gap-4 pt-4">
        <button className="rounded-md bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-black focus:outline-none">
          Start your roadmap
        </button>
        <button className="rounded-md border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black focus:outline-none">
          See all stories
        </button>
      </div>

      {/* overlay */}
      <div className="absolute inset-0 z-10 h-full w-full bg-black/80 dark:bg-black/40" />
      <ThreeDMarquee
        className="pointer-events-none absolute inset-0 h-full w-full"
        items={reviewItems}
      />
    </div>
  );
}
