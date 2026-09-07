import { ContactPanel } from '@/components/experience/ContactPanel'
import { ModeSwitch } from '@/components/navigation/ModeSwitch'
import { NormalProjects } from '@/components/normal/NormalProjects'
import { ABOUT } from '@/data/about'
import { PROFILE } from '@/data/profile'
import { PROJECTS } from '@/data/projects'
import { SERVICES } from '@/data/services'
import { SKILL_GROUPS } from '@/data/skills'

const SECTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const

/**
 * The headline numbers, summed from the projects rather than written down.
 *
 * Nothing here is a new claim: every figure is already recorded against a
 * project and verified against that project's own test run. Deriving it means
 * the summary cannot drift from the detail.
 */
const PROOF = {
  tests: PROJECTS.reduce((total, project) => total + project.proof.tests, 0),
  evaluations: PROJECTS.map((project) => project.proof.evaluation).filter(
    (value): value is string => value !== null,
  ),
  live: PROJECTS.filter((project) => project.status === 'live').length,
}

/**
 * The fast portfolio: the same person, the same work and the same data as the
 * 3D experience, with the spectacle removed.
 *
 * Every fact on this page is read from `src/data` — the identical source the
 * 3D route reads — and the project sections are rendered by the components
 * that route already uses. There is no second copy of the content and no
 * second project model, so the two modes cannot drift apart.
 *
 * Nothing here imports the 3D runtime, which is what keeps this route free of
 * Three.js entirely.
 */
export function NormalPortfolioPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <p className="text-sm font-semibold tracking-[0.2em]">{PROFILE.name}</p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <nav aria-label="Sections" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="focus-ring text-mist hover:text-chalk rounded text-xs tracking-[0.2em] uppercase transition-colors"
              >
                {section.label}
              </a>
            ))}
          </nav>
          <ModeSwitch />
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 sm:py-28">
          <h1 className="text-display max-w-4xl leading-[0.95] font-semibold tracking-[-0.02em] text-balance">
            {PROFILE.name}
          </h1>

          <div className="mt-8 flex items-center gap-5">
            <span aria-hidden className="bg-accent h-px w-12 shrink-0" />
            <p className="text-mist text-sm font-medium tracking-[0.3em] uppercase sm:text-base">
              {PROFILE.title}
            </p>
          </div>

          <p className="text-mist mt-10 max-w-xl text-base leading-relaxed sm:text-lg">
            {PROFILE.intro}
          </p>

          <a
            href="#projects"
            className="focus-ring text-accent mt-10 inline-block rounded text-sm hover:underline"
          >
            See the work →
          </a>
        </section>

        <Section id="work" title="Selected work">
          <dl className="grid gap-8 sm:grid-cols-3">
            <HeadlineStat
              label="Automated tests"
              value={PROOF.tests.toLocaleString()}
              note="Across three systems"
            />
            <HeadlineStat
              label="Evaluation suites"
              value={PROOF.evaluations.join(' · ')}
              note="Passed in full"
            />
            <HeadlineStat
              label="Live"
              value={`${PROOF.live} of ${PROJECTS.length}`}
              note="All three deployed"
            />
          </dl>

          <p className="text-mist mt-8 max-w-2xl text-sm leading-relaxed">
            Each figure comes from the project it belongs to, and each is
            reproducible by running that project&rsquo;s own suite.
          </p>
        </Section>

        <Section id="capabilities" title="Capabilities">
          <ul className="grid gap-10 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <li key={service.id}>
                <h3 className="text-base font-medium">{service.title}</h3>
                <p className="text-mist mt-2 text-sm leading-relaxed">{service.summary}</p>
                <p className="text-mist/80 mt-3 text-xs">{service.delivers.join(' · ')}</p>
              </li>
            ))}
          </ul>

          {/*
            What he works with, listed as stated rather than as a claim that
            each item is demonstrated by the three projects below — several are
            broader than what this repository links to.
          */}
          <div className="border-line mt-12 border-t pt-8">
            <ul className="grid gap-6 sm:grid-cols-2">
              {SKILL_GROUPS.map((group) => (
                <li key={group.id}>
                  <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">
                    {group.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{group.items.join(' · ')}</p>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section id="projects" title="Projects">
          <NormalProjects />
        </Section>

        <Section id="about" title="About">
          <div className="max-w-2xl space-y-4">
            {ABOUT.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-mist text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </Section>

        <Section id="contact" title="Contact">
          {/* The same component the 3D route uses, so the channels stay honest
              in both places and both go live from one edit. */}
          <div className="max-w-xl">
            <ContactPanel />
          </div>
        </Section>
      </main>

      <footer className="border-line text-mist/60 mt-24 border-t py-10 text-xs">
        {PROFILE.name} — {PROFILE.title}
      </footer>
    </div>
  )
}

function HeadlineStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <dt className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">{label}</dt>
      <dd className="mt-2 text-3xl font-medium sm:text-4xl">{value}</dd>
      <p className="text-mist/70 mt-2 text-xs leading-relaxed">{note}</p>
    </div>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-line/60 py-16 sm:py-20">
      <h2 className="text-mist/70 mb-10 text-[11px] tracking-[0.35em] uppercase">{title}</h2>
      {children}
    </section>
  )
}
