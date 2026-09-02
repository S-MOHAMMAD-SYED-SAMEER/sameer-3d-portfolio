/**
 * What a visitor is looking at, said plainly and without being asked.
 *
 * Persistent and not dismissible. A disclosure someone has to find, or can
 * close and forget, is a disclosure that has not been made — and this one is
 * not an apology to be tucked away. It concedes exactly one thing (there is no
 * language model behind the extraction) and states the unusual thing that is
 * true: the code running is the project's own.
 *
 * Kept as its own component because the other two projects will need the same
 * words, and a second copy of a claim is a second thing to keep honest.
 */
export function DemoModeBanner({ children }: { children: React.ReactNode }) {
  return (
    <aside
      aria-labelledby="demo-mode-heading"
      className="border-line bg-surface/40 rounded-lg border p-5 sm:p-6"
    >
      <h2 id="demo-mode-heading" className="text-accent text-[10px] tracking-[0.3em] uppercase">
        Demo mode
      </h2>
      <p className="text-mist mt-3 max-w-3xl text-sm leading-relaxed">{children}</p>
    </aside>
  )
}
