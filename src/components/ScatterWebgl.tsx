// TODO:
// - [ ] 优化性能：目前每次鼠标移动都会遍历所有点来检测 hover，数据量大时可能会有性能问题。可以考虑使用空间分割算法（如四叉树）来加速点的查找
// - [ ] 优化 Tooltip：将 Tooltip 独立成一个组件，并使用 React Portal 将其渲染到 DOM 中，而不是在 PixiJS 中绘制。这样可以更灵活地控制样式和内容，同时避免在 PixiJS 中处理文本换行等复杂布局问题
// - [ ] 实现文字标签：实现类似 Scatter.tsx 中的标签功能，能自动隐藏重叠的标签
// - [ ] 添加缩放和平移功能：允许用户缩放和平移散点图，以便更好地查看数据分布
// - [ ] 添加图例：显示颜色与学科门类/专业类的对应关系

import { Application, extend } from '@pixi/react'
import { Container, Graphics, Text } from 'pixi.js'
import { useMemo, useRef, useState } from 'react'

import type { ClientData } from '../../data/types'
import { type ScatterData, type ScatterConfig, type Subject, SUBJECTS } from '../hooks/useData'
import { useScreen } from '../hooks/useScreen'

type ScatterProps = {
  catagory: string
  scatterData: ScatterData | null
  scatterConfig: ScatterConfig | null
  openModal: (data: ClientData) => void
}

extend({ Graphics, Container, Text })

const POINT_RADIUS = 3
const MOUSE_OVER_FPS = 30
const TOOLTIP_WIDTH = 300
const TOOLTIP_HEIGHT = 116

export function Scatter({
  catagory,
  scatterData,
  scatterConfig,
  openModal: _openModal,
}: ScatterProps) {
  const lastMouseOverTriggerRef = useRef<number>(0)

  const openModal = (code: string) => {
    if (!scatterData) return
    const target = scatterData.all.find((item) => item['专业代码'] === code)
    if (target) {
      _openModal(target)
    }
  }

  const { width, height } = useScreen({ offsetHeight: '3.5rem' })

  const data =
    catagory === '全部专业'
      ? scatterData?.all
      : scatterData?.subjects[SUBJECTS.indexOf(catagory as Subject)]

  const config =
    catagory === '全部专业'
      ? scatterConfig?.all
      : scatterConfig?.subjects[SUBJECTS.indexOf(catagory as Subject)]

  const colorKey = catagory === '全部专业' ? '学科门类' : '专业类'
  const colorMap = useMemo(() => {
    if (!scatterData) return {}
    return generateColorMapping(scatterData)
  }, [scatterData])

  const points: {
    x: number
    y: number
    c: `#${string}`
    code: string
  }[] = useMemo(() => {
    if (!data || !config || width <= 0 || height <= 0) return []
    const [xMin, xMax] = config.x.domain
    const [yMin, yMax] = config.y.domain
    const xRange = xMax - xMin
    const yRange = yMax - yMin
    return data.map((item) => ({
      x: ((item.a - xMin) / xRange) * width,
      y: height - ((item.b - yMin) / yRange) * height,
      c: colorMap[item[colorKey]],
      code: item['专业代码'],
    }))
  }, [data, config, width, height, colorMap, colorKey])

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
    <Application
      width={width}
      height={height}
      resolution={window.devicePixelRatio}
      autoDensity
      className="z-50 mt-14"
      backgroundColor={'#ffffff'}
      antialias
      clearBeforeRender
    >
      <pixiGraphics
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
        <pixiGraphics
          draw={(graphics) => {
            graphics.clear()
            if (!tooltipItem) {
              return
            }
            graphics
              .rect(tooltipPosition.x, tooltipPosition.y, TOOLTIP_WIDTH, TOOLTIP_HEIGHT)
              .fill({ color: '#eff6ff' })
              .setStrokeStyle({
                width: 1,
                color: '#162456',
              })
              .stroke()
          }}
        />
        {tooltipItem ? (
          <pixiContainer>
            <pixiText
              text={tooltipItem['专业名称']}
              x={tooltipPosition.x + 12}
              y={tooltipPosition.y + 8}
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 16,
                fill: '#162456',
                fontWeight: '700',
                wordWrap: true,
                wordWrapWidth: TOOLTIP_WIDTH - 24,
              }}
            />
            <pixiText
              text={`${tooltipItem['专业代码']}  ${tooltipItem['学科门类']}-${tooltipItem['专业类']}`}
              x={tooltipPosition.x + 12}
              y={tooltipPosition.y + 32}
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 12,
                fill: '#162456',
                fontWeight: '600',
                wordWrap: true,
                wordWrapWidth: TOOLTIP_WIDTH - 24,
              }}
            />
            <pixiText
              text={tooltipItem['简介']}
              x={tooltipPosition.x + 12}
              y={tooltipPosition.y + 52}
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 12,
                fill: '#162456',
                breakWords: true,
                whiteSpace: 'normal',
                wordWrap: true,
                wordWrapWidth: TOOLTIP_WIDTH - 24,
                lineHeight: 18,
              }}
            />
          </pixiContainer>
        ) : null}
      </pixiContainer>
    </Application>
  )
}

const ORIGINAL_COLORS: `#${string}`[] = [
  '#fca5a5', // red-300
  '#fcd34d', // amber-300
  '#bef264', // lime-300
  '#6ee7b7', // emerald-300
  '#67e8f9', // cyan-300
  '#93c5fd', // blue-300
  '#c4b5fd', // violet-300
  '#f0abfc', // fuchsia-300
  '#fda4af', // rose-300
  '#fdba74', // orange-300
  '#fde047', // yellow-300
  '#86efac', // green-300
  '#5eead4', // teal-300
  '#7dd3fc', // sky-300
  '#a5b4fc', // indigo-300
  '#d8b4fe', // purple-300
  '#f9a8d4', // pink-300
  '#334155', // slate-700
  '#3f3f46', // zinc-700
  '#5b4f4b', // taupe-700
  '#463947', // mauve-700
  '#394447', // mist-700
  '#474739', // olive-700
]

const EXTENDED_COLORS: `#${string}`[] = [
  ...ORIGINAL_COLORS,
  ...ORIGINAL_COLORS.map((color) => {
    // 生成更深的颜色
    const r = Math.max(0, parseInt(color.slice(1, 3), 16) - 40)
      .toString(16)
      .padStart(2, '0')
    const g = Math.max(0, parseInt(color.slice(3, 5), 16) - 40)
      .toString(16)
      .padStart(2, '0')
    const b = Math.max(0, parseInt(color.slice(5, 7), 16) - 40)
      .toString(16)
      .padStart(2, '0')
    return `#${r}${g}${b}` as `#${string}`
  }),
]

function generateColorMapping(data: ScatterData): {
  [key: string]: `#${string}`
} {
  const result: { [key: string]: `#${string}` } = {}
  let subjectIndex = 0
  for (const subject of SUBJECTS) {
    result[subject] = EXTENDED_COLORS[subjectIndex % EXTENDED_COLORS.length]
    subjectIndex++
    const subjectData = data.subjects[SUBJECTS.indexOf(subject)]
    const categories = new Set(subjectData.map((item) => item['专业类']))
    let categoryIndex = 0
    for (const category of categories) {
      result[category] = EXTENDED_COLORS[categoryIndex % EXTENDED_COLORS.length]
      categoryIndex++
    }
  }
  return result
}
