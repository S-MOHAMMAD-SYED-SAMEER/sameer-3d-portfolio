import { SceneSurface } from '@/components/experience/surfaces/SceneSurface'
import { ABOUT } from '@/data/about'

/** The board beside the host: his words, next to him. */
export function AboutBoard() {
  return (
    <SceneSurface id="about" label="About" className="bg-[#111621]">
      <div className="flex h-full flex-col p-6">
        <p className="m-0 text-[24px] leading-[28px] font-semibold tracking-wide">{ABOUT.name}</p>
        <p className="text-accent m-0 mt-1 text-[20px] leading-[24px] tracking-[0.06em] uppercase">
          {ABOUT.title}
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {ABOUT.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-chalk/90 m-0 text-[21px] leading-[28px]">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </SceneSurface>
  )
}
