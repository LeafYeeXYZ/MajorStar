import { Scatter as AntScatter } from '@ant-design/plots'
import { type ScatterData, type ScatterConfig, type Subject, SUBJECTS } from '../hooks/useData'
import type { ClientData } from '../../data/types'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

type ScatterProps = {
  catagory: string
  scatterData: ScatterData | null
  scatterConfig: ScatterConfig | null
  openModal: (data: ClientData) => void
}

export function Scatter({ catagory, scatterData, scatterConfig, openModal }: ScatterProps) {
  return (
    <AntScatter
      className="pt-12!"
      xField="a"
      yField="b"
      colorField={catagory === '全部专业' ? '学科门类' : '专业类'}
      shapeField="point"
      slider={{
        x: {
          labelFormatter: (d: number) => d.toFixed(2),
          showLabel: false,
          style: {
            selectionFill: '#eff6ff',
            selectionFillOpacity: 1,
            selectionStroke: '#162456',
            handleIconRadius: 0,
            handleIconFill: '#eff6ff',
            handleIconStroke: '#162456',
            handleIconStrokeOpacity: 1,
          },
        },
        y: {
          labelFormatter: (d: number) => d.toFixed(2),
          showLabel: false,
          style: {
            selectionFill: '#eff6ff',
            selectionFillOpacity: 1,
            selectionStroke: '#162456',
            handleIconRadius: 0,
            handleIconFill: '#eff6ff',
            handleIconStroke: '#162456',
            handleIconStrokeOpacity: 1,
          },
        },
      }}
      scale={
        catagory === '全部专业'
          ? scatterConfig?.all
          : scatterConfig?.subjects[SUBJECTS.indexOf(catagory as Subject)]
      }
      style={{ stroke: 'rgba(22,36,86,0.9)' }}
      label={[
        {
          text: '专业名称',
          style: { dy: -20 },
          transform: [{ type: 'overlapHide' }],
        },
      ]}
      tooltip={{
        title: '专业名称',
        items: ['专业代码', '学科门类', '专业类', '简介'],
      }}
      data={
        catagory === '全部专业'
          ? scatterData?.all
          : scatterData?.subjects[SUBJECTS.indexOf(catagory as Subject)]
      }
      onEvent={(_, e) => {
        if (e.type === 'click' && e.data && e.data.data) {
          const data = e.data.data as ClientData
          openModal(data)
        }
      }}
      interaction={{
        // brushFilter: true, // 和滑动条冲突
        // fisheye: true, // 太卡了
        tooltip: {
          render: (
            _event: unknown,
            tooltipData: {
              title?: string
              items?: Array<{
                color?: string
                name?: string
                value?: string | number | null
              }>
            },
          ) => {
            const { title, items } = tooltipData as {
              title?: string
              items?: Array<{
                color?: string
                name?: string
                value?: string | number | null
              }>
            }
            const safeTitle = escapeHtml(title ?? '')
            const safeItems = (items ?? [])
              .map((item) => {
                const name = escapeHtml(item.name ?? '')
                const value = escapeHtml(String(item.value ?? ''))
                const color = item.color ?? '#1677ff'
                const showValue = value === '' ? '-' : value

                if (item.name === '简介') {
                  return `
                            <div class="mt-3 pt-3 border-t border-blue-950/20">
                              <div class="text-[13px] leading-[1.7] text-blue-950 line-clamp-4">${showValue}</div>
                            </div>
                          `
                }

                return `
                          <div class="flex items-center justify-between gap-4 py-1.5">
                            <div class="flex items-center gap-2 min-w-0">
                              <span class="w-2 h-2 rounded-full shrink-0" style="background: ${color};"></span>
                              <span class="text-xs text-blue-950/70 shrink-0">${name}</span>
                            </div>
                            <div class="text-xs font-semibold text-blue-950 text-right truncate">${showValue}</div>
                          </div>
                        `
              })
              .join('')

            return `
                      <div class="min-w-70 max-w-105 px-3 py-2.5 bg-blue-50 border border-blue-950 text-blue-950 shadow-md">
                        <div class="flex items-start justify-between gap-3 mb-3">
                          <div class="min-w-0">
                            <div class="text-[15px] font-bold leading-[1.4]">${safeTitle}</div>
                            <div class="mt-1 text-xs text-blue-950/60">点击可查看详细描述</div>
                          </div>
                        </div>
                        ${safeItems}
                      </div>
                    `
          },
        },
      }}
    />
  )
}
