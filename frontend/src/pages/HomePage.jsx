import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageTransition from "../components/motion/PageTransition";
import { cardVariants, sectionVariants } from "../components/motion/transitions";

const features = [
  {
    icon: "S",
    title: "For Students",
    description: "Discover jobs, build a credible profile, and stay visible to companies."
  },
  {
    icon: "C",
    title: "For Companies",
    description: "Reach motivated talent faster and manage hiring from one streamlined space."
  },
  {
    icon: "G",
    title: "For Colleges",
    description: "Coordinate the placement ecosystem with stronger visibility and smoother workflows."
  }
];

const testimonials = [
  {
    name: "Ananya Rao",
    role: "Student",
    feedback:
      "It gave me one clean place to showcase my profile, track jobs, and stay connected with recruiters.",
    avatar: "AR"
  },
  {
    name: "Karthik Mehta",
    role: "Company",
    feedback:
      "The platform helps us engage campuses with less friction and find better-fit candidates more quickly.",
    avatar: "KM"
  },
  {
    name: "Priya Nair",
    role: "Student",
    feedback:
      "The community and opportunity flow feels modern, simple, and far easier to keep up with than scattered tools.",
    avatar: "PN"
  }
];

function SectionIntro({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-300 sm:text-sm">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-7 text-gray-300 sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}

function SurfaceCard({ children, className = "" }) {
  return (
    <motion.article
      variants={cardVariants}
      className={`interactive-card rounded-[1.5rem] border border-gray-700 bg-gray-800 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:rounded-[1.75rem] sm:p-6 ${className}`.trim()}
    >
      {children}
    </motion.article>
  );
}

function HomePage() {
  return (
    <PageTransition className="space-y-12 sm:space-y-16">
      <motion.section
        variants={sectionVariants}
        custom={0}
        className="relative overflow-hidden rounded-[2rem] border border-gray-700 bg-[linear-gradient(135deg,#111827_0%,#1f2937_45%,#111827_100%)] px-5 py-14 shadow-[0_40px_140px_rgba(0,0,0,0.45)] sm:px-8 sm:py-18 md:rounded-[2.75rem] md:px-14 md:py-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.24),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.18),_transparent_30%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mb-5 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-blue-200 sm:text-xs">
            NexaWork Community Platform
          </p>
          <h1 className="mx-auto max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-5xl sm:leading-[1.02] md:text-7xl">
            Connect. Collaborate. Get Hired.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-gray-200 sm:text-base sm:leading-8 md:text-lg">
            A modern startup-style platform where students discover opportunities,
            companies hire with confidence, and colleges keep the entire ecosystem aligned.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to="/register"
              className="interactive-button glow-button rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-7 py-3.5 text-sm font-semibold text-white hover:from-blue-400 hover:to-purple-400"
            >
              Get Started
            </Link>
            <Link
              to="/jobs"
              className="interactive-button rounded-full border border-gray-600 bg-gray-800/80 px-7 py-3.5 text-sm font-semibold text-white hover:border-blue-400/40 hover:bg-gray-700"
            >
              Explore Jobs
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} custom={0.06} className="space-y-6 sm:space-y-8">
        <SectionIntro
          eyebrow="Platform Features"
          title="Built like a product, not just a portal."
          description="Every part of the experience is designed to help the hiring ecosystem move faster with less friction."
        />

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <SurfaceCard key={feature.title} className="hover:border-blue-400/40">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-base font-semibold text-blue-100 ring-1 ring-blue-400/25 sm:h-12 sm:w-12">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white sm:text-xl">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-300">{feature.description}</p>
            </SurfaceCard>
          ))}
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} custom={0.12} className="space-y-6 sm:space-y-8">
        <SectionIntro
          eyebrow="Testimonials"
          title="Trusted by learners and hiring teams."
          description="A few examples of how the platform feels from the people actually using it."
        />

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <SurfaceCard key={testimonial.name} className="hover:border-purple-400/40">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-xs font-semibold text-blue-100 ring-1 ring-purple-400/25 sm:h-14 sm:w-14 sm:text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white sm:text-lg">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-purple-300">{testimonial.role}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-gray-300">{testimonial.feedback}</p>
            </SurfaceCard>
          ))}
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} custom={0.18} className="space-y-6 sm:space-y-8">
        <SectionIntro
          eyebrow="Product Tour"
          title="See How It Works"
          description="A quick walkthrough of how students, companies, and colleges interact inside the platform."
        />

        <SurfaceCard className="mx-auto max-w-5xl p-3 sm:p-4 md:p-6">
          <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-gray-700 bg-gray-900 sm:rounded-[1.5rem]">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/ZVlUwwgOfKw"
              title="What is LinkedIn?"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </SurfaceCard>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        custom={0.24}
        className="relative overflow-hidden rounded-[1.75rem] border border-blue-400/30 bg-[linear-gradient(135deg,#1d4ed8_0%,#2563eb_38%,#a855f7_100%)] px-5 py-12 text-center shadow-[0_0_36px_rgba(59,130,246,0.28),0_32px_120px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:px-8 sm:py-14 md:rounded-[2.5rem] md:px-10 md:py-16"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_30%)]" />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/80 sm:text-sm">
            Get Started
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
            Start Your Journey Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-100 sm:text-base">
            Build your profile, explore opportunities, and become part of a stronger hiring network.
          </p>
          <Link
            to="/register"
            className="interactive-button glow-button mt-7 inline-flex rounded-full bg-gray-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Register Now
          </Link>
        </div>
      </motion.section>
    </PageTransition>
  );
}

export default HomePage;
