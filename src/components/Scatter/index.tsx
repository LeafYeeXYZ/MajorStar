import { Application, extend } from '@pixi/react'
import { Graphics, Text, Container } from 'pixi.js'
import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { ClientData } from '../../../data/types'
import { type ScatterData, type Subject, SUBJECTS } from '../../hooks/useData'
import { useScreen } from '../../hooks/useScreen'
import { generateColorMapping } from './colors'
import {
  SCATTER_POINT_RADIUS,
  TOOLTIP_WIDTH,
  TOOLTIP_HEIGHT,
  SCATTER_LABEL_FONT_SIZE,
  SCATTER_LABEL_OFFSET_Y,
  SCATTER_LABEL_SAFEZONE_X,
  SCATTER_LABEL_SAFEZONE_Y,
  SCATTER_INTERACTION_MOBILE_EXPAND,
  SCATTER_INTERACTION_THROTTLE_MS,
  SCATTER_SCALE_OFFSET,
  SCATTER_LEGEND_HEIGHT,
  SCATTER_OFFSET_HEIGHT,
} from './config'
import { Controler } from './Controler'
import { Legend } from './Legend'
import { Tooltip } from './Tooltip'

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

  const { width, height } = useScreen({
    offsetHeight: SCATTER_OFFSET_HEIGHT + SCATTER_LEGEND_HEIGHT,
  })

  const fields = useMemo(() => {
    if (!scatterData) return null
    return catagory === '全部专业'
      ? new Set(SUBJECTS)
      : new Set(
          scatterData.subjects[SUBJECTS.indexOf(catagory as Subject)].map((item) => item['专业类']),
        )
  }, [catagory, scatterData])

  const [hideFields, setHideFields] = useState<Set<string> | null>(null)

  const data = useMemo(() => {
    if (!scatterData) return null
    return catagory === '全部专业'
      ? scatterData.all.filter((item) => !hideFields?.has(item['学科门类'] ?? ''))
      : scatterData.subjects[SUBJECTS.indexOf(catagory as Subject)].filter(
          (item) => !hideFields?.has(item['专业类']),
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
      initialMinX: Math.min(...xValues) - SCATTER_SCALE_OFFSET,
      initialMaxX: Math.max(...xValues) + SCATTER_SCALE_OFFSET,
      initialMinY: Math.min(...yValues) - SCATTER_SCALE_OFFSET,
      initialMaxY: Math.max(...yValues) + SCATTER_SCALE_OFFSET,
    }
  }, [catagory, scatterData])

  const [{ minX, maxX, minY, maxY }, setScale] = useState({
    minX: initialMinX,
    maxX: initialMaxX,
    minY: initialMinY,
    maxY: initialMaxY,
  })

  useEffect(() => {
    setScale({ minX: initialMinX, maxX: initialMaxX, minY: initialMinY, maxY: initialMaxY })
  }, [initialMinX, initialMaxX, initialMinY, initialMaxY])

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

  const drawPoints = useCallback(
    (graphics: Graphics) => {
      graphics.clear()
      const colorGroups = new Map<string, Point[]>()
      for (const point of points) {
        if (!colorGroups.has(point.c)) colorGroups.set(point.c, [])
        colorGroups.get(point.c)!.push(point)
      }
      for (const [color, colorPoints] of colorGroups) {
        graphics.setStrokeStyle({ width: 1, color: '#162456' })
        for (const point of colorPoints) {
          graphics.circle(point.x, point.y, SCATTER_POINT_RADIUS)
        }
        graphics.fill({ color })
        graphics.stroke()
      }
    },
    [points],
  )

  const pointsGrid = useMemo(() => {
    const grid: Record<number, Record<number, Point[]>> = {}
    const cellSize = 20
    for (const p of points) {
      const r = Math.floor(p.y / cellSize)
      const c = Math.floor(p.x / cellSize)
      if (!grid[r]) grid[r] = {}
      if (!grid[r][c]) grid[r][c] = []
      grid[r][c].push(p)
    }
    return grid
  }, [points])

  const getPointAtPosition = useMemo(() => {
    return (x: number, y: number, mobile?: boolean) => {
      const distanceSq = mobile
        ? SCATTER_POINT_RADIUS ** 2 * SCATTER_INTERACTION_MOBILE_EXPAND
        : SCATTER_POINT_RADIUS ** 2
      const searchRadius = Math.ceil(Math.sqrt(distanceSq))
      const cellSize = 20

      const minR = Math.floor((y - searchRadius) / cellSize)
      const maxR = Math.floor((y + searchRadius) / cellSize)
      const minC = Math.floor((x - searchRadius) / cellSize)
      const maxC = Math.floor((x + searchRadius) / cellSize)

      for (let r = minR; r <= maxR; r++) {
        const row = pointsGrid[r]
        if (!row) continue
        for (let c = minC; c <= maxC; c++) {
          const cell = row[c]
          if (!cell) continue
          for (const point of cell) {
            const dx = point.x - x
            const dy = point.y - y
            if (dx ** 2 + dy ** 2 <= distanceSq) {
              return point
            }
          }
        }
      }
      return null
    }
  }, [pointsGrid])

  const visibleLabels = useMemo(() => {
    const CELL_SIZE = 120
    const visible: Array<(typeof points)[number]> = []
    const grid: Record<
      number,
      Record<number, { left: number; top: number; right: number; bottom: number }[]>
    > = {}
    for (const point of points) {
      const labelWidth = point.name.length * SCATTER_LABEL_FONT_SIZE
      const left = point.x - labelWidth / 2 - SCATTER_LABEL_SAFEZONE_X
      const top = point.y + SCATTER_LABEL_OFFSET_Y - SCATTER_LABEL_SAFEZONE_Y
      const right = point.x + labelWidth / 2 + SCATTER_LABEL_SAFEZONE_X
      const bottom = top + SCATTER_LABEL_SAFEZONE_Y
      const minCol = Math.floor(left / CELL_SIZE)
      const maxCol = Math.floor(right / CELL_SIZE)
      const minRow = Math.floor(top / CELL_SIZE)
      const maxRow = Math.floor(bottom / CELL_SIZE)
      let hasOverlap = false
      for (let r = minRow; r <= maxRow && !hasOverlap; r++) {
        const row = grid[r]
        if (!row) continue
        for (let c = minCol; c <= maxCol && !hasOverlap; c++) {
          const cell = row[c]
          if (cell) {
            hasOverlap = cell.some(
              (box) => left < box.right && right > box.left && top < box.bottom && bottom > box.top,
            )
          }
        }
      }
      if (!hasOverlap) {
        const box = { left, top, right, bottom }
        for (let r = minRow; r <= maxRow; r++) {
          if (!grid[r]) grid[r] = {}
          for (let c = minCol; c <= maxCol; c++) {
            if (!grid[r][c]) grid[r][c] = []
            grid[r][c].push(box)
          }
        }
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
    if (now - mouseThrottleRef.current < SCATTER_INTERACTION_THROTTLE_MS) {
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
          offsetY={SCATTER_OFFSET_HEIGHT + SCATTER_LEGEND_HEIGHT}
        />
      }
      {/* 图例 */}
      {legendData && (
        <Legend
          data={legendData}
          height={SCATTER_LEGEND_HEIGHT}
          offsetY={SCATTER_OFFSET_HEIGHT}
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
          offsetY={SCATTER_OFFSET_HEIGHT + SCATTER_LEGEND_HEIGHT}
        />
      )}
      {/* 事件 */}
      <div
        className="fixed z-10"
        style={{
          width,
          height,
          top: SCATTER_OFFSET_HEIGHT + SCATTER_LEGEND_HEIGHT,
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
        <pixiGraphics draw={drawPoints} />
        <pixiContainer>
          {visibleLabels.map((point) => (
            <pixiText
              key={point.code}
              x={point.x - (point.name.length * SCATTER_LABEL_FONT_SIZE) / 2}
              y={point.y + SCATTER_LABEL_OFFSET_Y}
              text={point.name}
              style={{ fill: 'rgba(22,36,86,0.8)', fontSize: SCATTER_LABEL_FONT_SIZE }}
            />
          ))}
        </pixiContainer>
      </Application>
    </>
  )
}
