import { Application, extend } from '@pixi/react'
import { Graphics, Text, Container } from 'pixi.js'
import { type PointerEvent, useMemo, useRef, useState } from 'react'

import type { ClientData } from '../../../data/types'
import { type ScatterData, type Subject, SUBJECTS } from '../../hooks/useData'
import { useScreen } from '../../hooks/useScreen'
import { generateColorMapping } from './colors'
import { Controler } from './Controler'
import { Legend } from './Legend'
import { Tooltip } from './Tooltip'
import { parseOffset } from './utils'

extend({ Graphics, Text, Container })

type ScatterProps = {
  catagory: string
  scatterData: ScatterData | null
  openModal: (data: ClientData) => void
}

type Point = {
  x: number
  y: number
  c: `#${string}`
  code: string
  name: string
}

const POINT_RADIUS = 3
const TOOLTIP_WIDTH = 300
const TOOLTIP_HEIGHT = 116
const OFFSET_HEIGHT = parseOffset('3.5rem')
const LEGEND_HEIGHT = parseOffset('2.5rem')
const LABEL_FONT_SIZE = 12
const LABEL_OFFSET_Y = -22
const LABEL_SAFEZONE_Y = 20
const LABEL_SAFEZONE_X = 15
const INTERACTION_THROTTLE_MS = 30
const INTERACTION_MOBILE_EXPAND = 5
const SCALE_OFFSET = 0.2

export function Scatter({ catagory, scatterData, openModal: _openModal }: ScatterProps) {
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

  const { initialMinX, initialMaxX, initialMinY, initialMaxY } = useMemo(() => {
    if (!scatterData) return { initialMinX: 0, initialMaxX: 1, initialMinY: 0, initialMaxY: 1 }
    const allData =
      catagory === '全部专业'
        ? scatterData.all
        : scatterData.subjects[SUBJECTS.indexOf(catagory as Subject)]
    const xValues = allData.map((item) => item.a)
    const yValues = allData.map((item) => item.b)
    return {
      initialMinX: Math.min(...xValues) - SCALE_OFFSET,
      initialMaxX: Math.max(...xValues) + SCALE_OFFSET,
      initialMinY: Math.min(...yValues) - SCALE_OFFSET,
      initialMaxY: Math.max(...yValues) + SCALE_OFFSET,
    }
  }, [catagory, scatterData])

  const [{ minX, maxX, minY, maxY }, setScale] = useState({
    minX: initialMinX,
    maxX: initialMaxX,
    minY: initialMinY,
    maxY: initialMaxY,
  })

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

  const points: Point[] = useMemo(() => {
    if (!data) return []
    const xRange = maxX - minX
    const yRange = maxY - minY
    return data
      .filter((item) => item.a > minX && item.a < maxX && item.b > minY && item.b < maxY)
      .map((item) => ({
        x: ((item.a - minX) / xRange) * width,
        y: height - ((item.b - minY) / yRange) * height,
        c: colorMap[item[colorKey]],
        code: item['专业代码'],
        name: item['专业名称'],
      }))
  }, [data, width, height, colorMap, colorKey, minX, maxX, minY, maxY])

  const getPointAtPosition = useMemo(() => {
    return (x: number, y: number, mobile?: boolean) => {
      const distance = mobile ? POINT_RADIUS ** 2 * INTERACTION_MOBILE_EXPAND : POINT_RADIUS ** 2
      for (const point of points) {
        const dx = point.x - x
        const dy = point.y - y
        if (dx ** 2 + dy ** 2 <= distance) {
          return point
        }
      }
      return null
    }
  }, [points])

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

  const updateTooltip = (x: number, y: number) => {
    const point = getPointAtPosition(x, y)
    if (point) {
      setTooltipData({ x, y, code: point.code })
      return true
    }
    setTooltipData(null)
    return false
  }

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

  const mouseThrottleRef = useRef(0)
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const now = performance.now()
    if (now - mouseThrottleRef.current < INTERACTION_THROTTLE_MS) {
      return
    }
    mouseThrottleRef.current = now
    const target = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - target.left
    const y = event.clientY - target.top
    if (updateTooltip(x, y)) {
      event.currentTarget.style.cursor = 'pointer'
    } else {
      event.currentTarget.style.cursor = 'default'
    }
  }

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.cursor = 'default'
    setTooltipData(null)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const mobile = event.pointerType === 'touch'
    const target = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - target.left
    const y = event.clientY - target.top
    const point = getPointAtPosition(x, y, mobile)
    if (point) {
      openModal(point.code)
    }
  }

  return (
    <>
      {/* 控制器 */}
      {
        <Controler
          initialMinX={initialMinX}
          initialMaxX={initialMaxX}
          initialMinY={initialMinY}
          initialMaxY={initialMaxY}
          minX={minX}
          maxX={maxX}
          minY={minY}
          maxY={maxY}
          setScale={setScale}
          offsetY={OFFSET_HEIGHT + LEGEND_HEIGHT}
        />
      }
      {/* 图例 */}
      {legendData && (
        <Legend
          data={legendData}
          height={LEGEND_HEIGHT}
          offsetY={OFFSET_HEIGHT}
          hideFields={hideFields}
          setHideFields={setHideFields}
        />
      )}
      {/* 提示框 */}
      {tooltipItem && (
        <Tooltip
          x={tooltipPosition.x}
          y={tooltipPosition.y}
          data={tooltipItem}
          offsetY={OFFSET_HEIGHT + LEGEND_HEIGHT}
        />
      )}
      {/* 事件 */}
      <div
        className="fixed z-10"
        style={{
          width,
          height,
          top: OFFSET_HEIGHT + LEGEND_HEIGHT,
          left: 0,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      />
      {/* 绘图 */}
      <Application
        className="mt-24"
        width={width}
        height={height}
        resolution={window.devicePixelRatio}
        autoDensity
        backgroundColor={'#ffffff'}
        antialias
        clearBeforeRender
      >
        <pixiGraphics
          key={`${width}x${height}`}
          draw={(graphics) => {
            graphics.clear()
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
          }}
        />
        <pixiContainer>
          {visibleLabels.map((point) => (
            <pixiText
              key={point.code}
              x={point.x - (point.name.length * LABEL_FONT_SIZE) / 2}
              y={point.y + LABEL_OFFSET_Y}
              text={point.name}
              style={{ fill: 'rgba(22,36,86,0.8)', fontSize: LABEL_FONT_SIZE }}
            />
          ))}
        </pixiContainer>
      </Application>
    </>
  )
}
