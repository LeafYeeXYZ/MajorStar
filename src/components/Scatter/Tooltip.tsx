import type { ClientData } from '../../../data/types'

type TooltipProps = {
  x: number
  y: number
  data: ClientData
  offsetX?: number
  offsetY?: number
}

export function Tooltip({ x, y, data, offsetX, offsetY }: TooltipProps) {
  return (
    <div
      className={`fixed z-50 w-60 border bg-blue-50`}
      style={{ left: x + (offsetX ?? 0), top: y + (offsetY ?? 0) }}
    >
      <div className="mb-0.75 px-2.5 pt-2 text-[16px] font-semibold text-blue-950">
        {data['专业名称']}
      </div>
      <div className="flex items-center justify-between px-2.5 pb-2 text-xs font-semibold text-blue-950">
        <div>{data['专业代码']}</div>
        <div>
          {data['学科门类']}-{data['专业类']}
        </div>
      </div>
      <div className="border-t border-blue-950 bg-white px-2.5 pt-2 text-xs leading-5 font-semibold text-blue-950">
        {data['简介']}
      </div>
      <div className="bg-white px-2.5 pt-1 pb-2 text-[0.7rem] text-blue-950/70">
        上述专业简介由AI生成，仅供参考
      </div>
    </div>
  )
}
