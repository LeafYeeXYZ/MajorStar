import { useRef } from 'react'

type LegendProps = {
  data: {
    name: string
    color: string
  }[]
  height: number
  offsetX?: number
  offsetY?: number
  hideFields: Set<string> | null
  setHideFields: (fields: Set<string>) => void
}

export function Legend({ data, height, offsetX, offsetY, hideFields, setHideFields }: LegendProps) {
  const hideItemsRef = useRef<Set<string>>(new Set())
  return (
    <div
      className={`fixed z-50 flex w-full items-center gap-3 overflow-auto px-4`}
      style={{ left: offsetX ?? 0, top: offsetY ?? 0, height }}
    >
      {data.map((item) => (
        <div
          key={item.name}
          className={`flex cursor-pointer items-center gap-1 ${hideFields?.has(item.name) ? 'opacity-80 grayscale filter' : ''}`}
          onClick={() => {
            const newHideItems = new Set(hideItemsRef.current)
            if (newHideItems.has(item.name)) {
              newHideItems.delete(item.name)
            } else {
              newHideItems.add(item.name)
            }
            hideItemsRef.current = newHideItems
            setHideFields(newHideItems)
          }}
          onDoubleClick={() => {
            const newHideItems = new Set(
              data
                .filter((legendItem) => legendItem.name !== item.name)
                .map((legendItem) => legendItem.name),
            )
            hideItemsRef.current = newHideItems
            setHideFields(newHideItems)
          }}
        >
          <div
            className="h-3 w-3 border border-blue-950"
            style={{ backgroundColor: item.color }}
          ></div>
          <div className="text-xs font-semibold text-nowrap text-blue-950">{item.name}</div>
        </div>
      ))}
    </div>
  )
}
