import { SceneSurface } from '@/components/experience/surfaces/SceneSurface'
import { SERVICES, SERVICES_CTA } from '@/data/services'

interface ServicesBoardProps {
  /** Opens Contact: the way to start a conversation. */
  onContact: () => void
}

/** The seven services, one cell each, and the way to start a conversation in the eighth. */
export function ServicesBoard({ onContact }: ServicesBoardProps) {
  return (
    <SceneSurface id="services" label="Services" className="bg-[#0b0e13]">
      <ul className="m-0 grid h-full list-none grid-cols-2 grid-rows-4 gap-x-6 gap-y-3 p-5">
        {SERVICES.map((service) => (
          <li key={service.id} className="min-h-0 overflow-hidden">
            <h3 className="m-0 truncate text-[18px] leading-[22px] font-semibold">{service.title}</h3>
            <p className="text-mist m-0 mt-1 line-clamp-3 text-[15px] leading-[19px]">{service.summary}</p>
            <p className="text-accent m-0 mt-1 truncate text-[15px] leading-[19px]">{service.delivers[0]}</p>
          </li>
        ))}
        <li className="flex items-end">
          <button
            type="button"
            onClick={onContact}
            className="focus-ring bg-accent text-void rounded-full px-5 py-2 text-[17px] font-medium"
          >
            {SERVICES_CTA} →
          </button>
        </li>
      </ul>
    </SceneSurface>
  )
}
