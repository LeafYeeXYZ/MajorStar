// TODO:
// - [x] 优化 Tooltip：将 Tooltip 独立成一个组件，并使用 React Portal 将其渲染到 DOM 中，而不是在 PixiJS 中绘制。这样可以更灵活地控制样式和内容，同时避免在 PixiJS 中处理文本换行等复杂布局问题
// - [x] 添加图例：显示颜色与学科门类/专业类的对应关系
// - [x] 实现文字标签：实现类似 Scatter.tsx 中的标签功能，能自动隐藏重叠的标签
// - [ ] 添加缩放和平移功能：允许用户缩放和平移散点图，以便更好地查看数据分布
// - [ ] 优化移动端体验：目前的交互方式不太适配移动端

import { Application, extend } from '@pixi/react'
import { Graphics, Text, Container } from 'pixi.js'
import { useMemo, useRef, useState } from 'react'

import type { ClientData } from '../../data/types'
import { type ScatterData, type ScatterConfig, type Subject, SUBJECTS } from '../hooks/useData'
import { useScreen } from '../hooks/useScreen'
import { generateColorMapping } from './Scatter/colors'
import { Legend } from './Scatter/Legend'
import { Tooltip } from './Scatter/Tooltip'
import { parseOffset } from './Scatter/utils'

extend({ Graphics, Text, Container })

type ScatterProps = {
  catagory: string
  scatterData: ScatterData | null
  scatterConfig: ScatterConfig | null
  openModal: (data: ClientData) => void
}

const POINT_RADIUS = 3
const MOUSE_OVER_FPS = 20
const TOOLTIP_WIDTH = 300
const TOOLTIP_HEIGHT = 116
const OFFSET_HEIGHT = parseOffset('3.5rem')
const LEGEND_HEIGHT = parseOffset('2.5rem')
const LABEL_FONT_SIZE = 12
const LABEL_OFFSET_Y = -22
const LABEL_SAFEZONE_Y = 20
const LABEL_SAFEZONE_X = 15

export function Scatter({
  catagory,
  scatterData,
  scatterConfig,
  openModal: _openModal,
}: ScatterProps) {
  const lastMouseOverTriggerRef = useRef<number>(0)

  const openModal = useMemo(() => {
    return (code: string) => {
      if (!scatterData) return
      const target = scatterData.all.find((item) => item['专业代码'] === code)
      if (target) {
        _openModal(target)
      }
    }
  }, [scatterData, _openModal])

  const { width, height } = useScreen({ offsetHeight: OFFSET_HEIGHT + LEGEND_HEIGHT })

  const fields = useMemo(() => {
    if (!scatterData) return null
    return catagory === '全部专业'
      ? new Set(SUBJECTS)
      : new Set(
          scatterData.subjects[SUBJECTS.indexOf(catagory as Subject)].map(
            (item) => item['专业类'] ?? '',
          ),
        )
  }, [catagory, scatterData])

  const [hideFields, setHideFields] = useState<Set<string> | null>(null)

  const data = useMemo(() => {
    if (!scatterData) return null
    return catagory === '全部专业'
      ? scatterData.all.filter((item) => !hideFields?.has(item['学科门类'] ?? ''))
      : scatterData.subjects[SUBJECTS.indexOf(catagory as Subject)].filter(
          (item) => !hideFields?.has(item['专业类'] ?? ''),
        )
  }, [catagory, scatterData, hideFields])

  const config = useMemo(() => {
    if (!scatterConfig) return null
    return catagory === '全部专业'
      ? scatterConfig.all
      : scatterConfig.subjects[SUBJECTS.indexOf(catagory as Subject)]
  }, [catagory, scatterConfig])

  const colorKey = useMemo(() => {
    return catagory === '全部专业' ? '学科门类' : '专业类'
  }, [catagory])

  const colorMap = useMemo(() => {
    if (!scatterData) return {}
    return generateColorMapping(scatterData)
  }, [scatterData])

  const legendData = useMemo(() => {
    if (!scatterData) return null
    const data: {
      name: string
      color: string
    }[] = []
    for (const field of fields ?? []) {
      data.push({
        name: field,
        color: colorMap[field] ?? '#000000',
      })
    }
    return data
  }, [colorMap, fields, scatterData])

  const points: {
    x: number
    y: number
    c: `#${string}`
    code: string
    name: string
  }[] = useMemo(() => {
    if (!data || !config) return []
    const [xMin, xMax] = config.x.domain
    const [yMin, yMax] = config.y.domain
    const xRange = xMax - xMin
    const yRange = yMax - yMin
    return data.map((item) => ({
      x: ((item.a - xMin) / xRange) * width,
      y: height - ((item.b - yMin) / yRange) * height,
      c: colorMap[item[colorKey]],
      code: item['专业代码'],
      name: item['专业名称'],
    }))
  }, [data, config, width, height, colorMap, colorKey])

  const visibleLabels = useMemo(() => {
    const visible: Array<(typeof points)[number]> = []
    const occupiedBoxes: { left: number; top: number; right: number; bottom: number }[] = []
    for (const point of points) {
      const labelWidth = point.name.length * LABEL_FONT_SIZE
      const left = point.x - labelWidth / 2 - LABEL_SAFEZONE_X
      const top = point.y + LABEL_OFFSET_Y - LABEL_SAFEZONE_Y
      const right = point.x - labelWidth / 2 + labelWidth + LABEL_SAFEZONE_X
      const bottom = top + LABEL_SAFEZONE_Y
      const hasOverlap = occupiedBoxes.some(
        (box) => left < box.right && right > box.left && top < box.bottom && bottom > box.top,
      )
      if (!hasOverlap) {
        occupiedBoxes.push({ left, top, right, bottom })
        visible.push(point)
      }
    }
    return visible
  }, [points])

  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; code: string } | null>(
    null,
  )

  const tooltipItem = useMemo(() => {
    if (!tooltipData || !data) return null
    return data.find((item) => item['专业代码'] === tooltipData.code) ?? null
  }, [data, tooltipData])

  const tooltipPosition = useMemo(() => {
    if (!tooltipData) {
      return { x: 0, y: 0 }
    }
    const margin = 8
    const offset = 12
    const preferredX = tooltipData.x + offset
    const preferredY = tooltipData.y - TOOLTIP_HEIGHT - offset
    const x = Math.min(
      Math.max(preferredX, margin),
      Math.max(margin, width - TOOLTIP_WIDTH - margin),
    )
    const y = preferredY < margin ? tooltipData.y + offset : preferredY
    return {
      x,
      y: Math.min(Math.max(y, margin), Math.max(margin, height - TOOLTIP_HEIGHT - margin)),
    }
  }, [height, tooltipData, width])

  return (
    <>
      {legendData && (
        <Legend
          data={legendData}
          height={LEGEND_HEIGHT}
          offsetY={OFFSET_HEIGHT}
          hideFields={hideFields}
          setHideFields={setHideFields}
        />
      )}
      {tooltipItem && (
        <Tooltip
          x={tooltipPosition.x}
          y={tooltipPosition.y}
          data={tooltipItem}
          offsetY={OFFSET_HEIGHT + LEGEND_HEIGHT}
        />
      )}
      <Application
        width={width}
        height={height}
        resolution={window.devicePixelRatio}
        autoDensity
        className="mt-24"
        backgroundColor={'#ffffff'}
        antialias
        clearBeforeRender
      >
        <pixiGraphics
          key={`${width}x${height}`}
          draw={(graphics) => {
            graphics.clear()
            graphics.removeAllListeners()
            for (const point of points) {
              graphics
                .circle(point.x, point.y, POINT_RADIUS)
                .fill({ color: point.c })
                .setStrokeStyle({
                  width: 1,
                  color: '#162456',
                })
                .stroke()
            }
            graphics.interactive = true
            graphics.on('click', (e) => {
              const { x, y } = e.global
              for (const point of points) {
                const dx = point.x - x
                const dy = point.y - y
                if (dx * dx + dy * dy <= POINT_RADIUS * POINT_RADIUS) {
                  openModal(point.code)
                  break
                }
              }
            })
            graphics.on('globalmousemove', (e) => {
              const now = performance.now()
              if (now - lastMouseOverTriggerRef.current < 1000 / MOUSE_OVER_FPS) {
                return
              }
              lastMouseOverTriggerRef.current = now
              const { x, y } = e.global
              let hovered = false
              let code = ''
              for (const point of points) {
                const dx = point.x - x
                const dy = point.y - y
                if (dx * dx + dy * dy <= POINT_RADIUS * POINT_RADIUS) {
                  hovered = true
                  code = point.code
                  break
                }
              }
              if (hovered) {
                graphics.cursor = 'pointer'
                setTooltipData({ x, y, code })
              } else {
                graphics.cursor = 'default'
                setTooltipData(null)
              }
            })
          }}
        />
        <pixiContainer>
          {visibleLabels.map((point) => (
            <pixiText
              key={point.code}
              x={point.x - (point.name.length * LABEL_FONT_SIZE) / 2}
              y={point.y + LABEL_OFFSET_Y}
              text={point.name}
              style={{ fill: 'rgba(22,36,86,0.9)', fontSize: LABEL_FONT_SIZE }}
            />
          ))}
        </pixiContainer>
      </Application>
    </>
  )
}
