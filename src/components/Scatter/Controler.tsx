import {
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined,
} from '@ant-design/icons'
import { Slider } from 'antd'
import { useEffect, useRef, useState } from 'react'

import { Button } from '../Button'

const SET_SCALE_DEBOUNCE_MS = 10
const MIN_SCALE_RANGE = 1

type ControlerProps = {
  offsetX?: number
  offsetY?: number
  initialMinX: number
  initialMaxX: number
  initialMinY: number
  initialMaxY: number
  minX: number
  maxX: number
  minY: number
  maxY: number
  setScale: (scale: { minX: number; maxX: number; minY: number; maxY: number }) => void
}

export function Controler({
  minX,
  maxX,
  minY,
  maxY,
  setScale: _setScale,
  initialMinX,
  initialMaxX,
  initialMinY,
  initialMaxY,
  offsetX,
  offsetY,
}: ControlerProps) {
  const [selfPosition, setSelfPosition] = useState<'lt' | 'rt' | 'lb' | 'rb'>('rb')
  const [draftScale, setDraftScale] = useState({
    minX,
    maxX,
    minY,
    maxY,
  })

  useEffect(() => {
    setDraftScale({
      minX,
      maxX,
      minY,
      maxY,
    })
  }, [minX, maxX, minY, maxY])

  const styleConfig =
    selfPosition === 'lt'
      ? { left: offsetX ?? 0, top: offsetY ?? 0 }
      : selfPosition === 'rt'
        ? { right: offsetX ?? 0, top: offsetY ?? 0 }
        : selfPosition === 'lb'
          ? { left: offsetX ?? 0, bottom: 0 }
          : { right: offsetX ?? 0, bottom: 0 }

  const setScaleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const setScale = (scale: { minX: number; maxX: number; minY: number; maxY: number }) => {
    if (setScaleTimeoutRef.current) {
      clearTimeout(setScaleTimeoutRef.current)
    }
    setScaleTimeoutRef.current = setTimeout(() => {
      _setScale(scale)
    }, SET_SCALE_DEBOUNCE_MS)
  }

  useEffect(() => {
    return () => {
      if (setScaleTimeoutRef.current) {
        clearTimeout(setScaleTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      className="fixed z-50 m-4 flex flex-col gap-1.5 border border-blue-950 bg-blue-50 p-2 font-semibold text-blue-950"
      style={styleConfig}
    >
      <div className="mb-0.5 flex gap-1.5">
        <div
          className={`flex cursor-pointer items-center justify-center border border-blue-950 p-1 ${selfPosition === 'lt' ? 'bg-blue-100' : 'bg-white'}`}
          onClick={() => setSelfPosition('lt')}
        >
          <RadiusUpleftOutlined className="text-[14px]" />
        </div>
        <div
          className={`flex cursor-pointer items-center justify-center border border-blue-950 p-1 ${selfPosition === 'rt' ? 'bg-blue-100' : 'bg-white'}`}
          onClick={() => setSelfPosition('rt')}
        >
          <RadiusUprightOutlined className="text-[14px]" />
        </div>
        <div
          className={`flex cursor-pointer items-center justify-center border border-blue-950 p-1 ${selfPosition === 'lb' ? 'bg-blue-100' : 'bg-white'}`}
          onClick={() => setSelfPosition('lb')}
        >
          <RadiusBottomleftOutlined className="text-[14px]" />
        </div>
        <div
          className={`flex cursor-pointer items-center justify-center border border-blue-950 p-1 ${selfPosition === 'rb' ? 'bg-blue-100' : 'bg-white'}`}
          onClick={() => setSelfPosition('rb')}
        >
          <RadiusBottomrightOutlined className="text-[14px]" />
        </div>
        <Button
          className="text-xs"
          onClick={() => {
            const nextScale = {
              minX: initialMinX,
              maxX: initialMaxX,
              minY: initialMinY,
              maxY: initialMaxY,
            }
            setDraftScale(nextScale)
            setScale({
              minX: initialMinX,
              maxX: initialMaxX,
              minY: initialMinY,
              maxY: initialMaxY,
            })
          }}
        >
          重置范围
        </Button>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="text-xs text-nowrap">X轴</div>
        <Slider
          className="m-0! mx-2! w-full"
          range={{ draggableTrack: true }}
          min={initialMinX}
          max={initialMaxX}
          value={[draftScale.minX, draftScale.maxX]}
          tooltip={{ formatter: null }}
          step={0.01}
          // @ts-expect-error 不知道为啥开启 draggableTrack 后类型报错了
          onChange={(value) => {
            if (value[1] - value[0] < MIN_SCALE_RANGE) {
              return
            }
            const nextScale = {
              minX: value[0],
              maxX: value[1],
              minY: draftScale.minY,
              maxY: draftScale.maxY,
            }
            setDraftScale(nextScale)
            setScale(nextScale)
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-nowrap">Y轴</div>
        <Slider
          className="m-0! mx-2! w-full"
          range={{ draggableTrack: true }}
          min={initialMinY}
          max={initialMaxY}
          value={[draftScale.minY, draftScale.maxY]}
          tooltip={{ formatter: null }}
          step={0.01}
          // @ts-expect-error 不知道为啥开启 draggableTrack 后类型报错了
          onChange={(value) => {
            if (value[1] - value[0] < MIN_SCALE_RANGE) {
              return
            }
            const nextScale = {
              minX: draftScale.minX,
              maxX: draftScale.maxX,
              minY: value[0],
              maxY: value[1],
            }
            setDraftScale(nextScale)
            setScale(nextScale)
          }}
        />
      </div>
    </div>
  )
}
