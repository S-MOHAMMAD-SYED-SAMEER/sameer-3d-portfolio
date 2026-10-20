import { SceneSurface } from '@/components/experience/surfaces/SceneSurface'
import { SKILL_GROUPS } from '@/data/skills'

/**
 * The four skill groups, written on the systems drawing. The drawing's lines stay faintly visible
 * behind the text, so it still reads as the same wall.
 */
export function SkillsBoard() {
  return (
    <SceneSurface id="skills" label="Skills" className="bg-[#1b1d23]/90">
      <div className="grid h-full grid-cols-2 gap-x-8 gap-y-5 p-7">
        {SKILL_GROUPS.map((group) => (
          <section key={group.id} className="border-line/70 border-l-2 pl-4">
            <h3 className="text-accent m-0 text-[17px] leading-[22px] font-semibold tracking-wide">
              {group.title}
            </h3>
            <ul className="m-0 mt-2 list-none space-y-1 p-0">
              {group.items.map((item) => (
                <li key={item} className="text-chalk/90 text-[17px] leading-[22px]">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SceneSurface>
  )
}
