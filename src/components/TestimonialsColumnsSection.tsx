import React from "react";
import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";
import { testimonials, type Testimonial } from "@/data/testimonials";
import { cn } from "@/lib/utils";

type TestimonialColumnProps = {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
  reverse?: boolean;
};

const TestimonialsColumn = ({
  className,
  testimonials: columnTestimonials,
  duration = 16,
  reverse = false,
}: TestimonialColumnProps) => {
  return (
    <div className={cn("min-w-0", className)}>
      <motion.div
        animate={{
          translateY: reverse ? "0%" : "-50%",
        }}
        initial={{
          translateY: reverse ? "-50%" : "0%",
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-5 pb-5"
      >
        {[0, 1].map((setIndex) => (
          <React.Fragment key={setIndex}>
            {columnTestimonials.map((testimonial) => (
              <article
                key={`${testimonial.id}-${setIndex}`}
                className="group w-full rounded-3xl border border-white/10 bg-card/80 p-5 text-left shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur transition hover:border-blue-400/35 hover:bg-card"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-amber-300">
                    {Array.from({ length: testimonial.rating }).map((_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-5 w-5 text-blue-300/70 transition group-hover:text-blue-300" />
                </div>

                <p className="text-sm leading-6 text-slate-200">"{testimonial.content}"</p>

                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/15 text-sm font-bold text-blue-100">
                    {testimonial.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{testimonial.name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                    {testimonial.course}
                  </span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                    {testimonial.achievement}
                  </span>
                </div>
              </article>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

const TestimonialsColumnsSection = () => {
  const firstColumn = testimonials.slice(0, 2);
  const secondColumn = testimonials.slice(2, 4);
  const thirdColumn = testimonials.slice(4, 6);

  return (
    <section className="relative overflow-hidden bg-background px-4 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--background))_0%,rgba(7,12,22,0.72)_22%,rgba(7,12,22,0.62)_72%,hsl(var(--background))_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(37,99,235,0.1),transparent_28%),radial-gradient(circle_at_82%_28%,rgba(14,165,233,0.06),transparent_26%)]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <div className="rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-200">
            Learner stories
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Proof that guided roadmaps turn into real career wins
          </h2>
          <p className="mt-5 text-sm leading-6 text-muted-foreground sm:text-base">
            Arcade Learn members use structured roadmaps, hands-on projects, and interview prep to move from
            learning mode to job-ready confidence.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-h-[720px] max-w-6xl grid-cols-1 gap-5 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)] md:grid-cols-2 lg:grid-cols-3">
          <TestimonialsColumn testimonials={firstColumn} duration={30} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={35} reverse />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={33} />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsColumnsSection;
