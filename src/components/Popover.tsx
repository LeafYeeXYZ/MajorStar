import React, { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

export type PopoverProps = {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
}

export function Popover({ children, content, className }: PopoverProps) {
  const [visible, setVisible] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [coords, setCoords] = useState({ top: -9999, left: -9999 })

  const targetRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useLayoutEffect(() => {
    if (visible && targetRef.current && popoverRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect()
      const popoverRect = popoverRef.current.getBoundingClientRect()
      const MARGIN = 8
      const maxLeft = window.innerWidth - popoverRect.width - MARGIN
      const maxTop = window.innerHeight - popoverRect.height - MARGIN

      // 默认位置：目标元素上方居中
      let top = targetRect.top - popoverRect.height - MARGIN
      let left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2

      // 边界检测：上方空间不足时，尝试翻转到下方
      if (top < MARGIN) {
        const bottomTop = targetRect.bottom + MARGIN
        top = bottomTop > maxTop ? MARGIN : bottomTop
      }

      // 水平边界检测：始终保证左、右边距至少为 MARGIN
      if (left < MARGIN) {
        left = MARGIN
      } else if (left > maxLeft) {
        left = maxLeft
      }

      setCoords({ top, left })
    }
  }, [visible, content])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true))
    })
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setAnimate(false)
      timeoutRef.current = setTimeout(() => {
        setVisible(false)
      }, 150)
    }, 150)
  }

  return (
    <div
      ref={targetRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible &&
        createPortal(
          <div
            ref={popoverRef}
            className={`fixed z-50 border border-blue-950 bg-blue-50 text-blue-950 shadow-md transition duration-100 ease-in-out ${animate ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'} ${className || ''}`}
            style={{ top: coords.top, left: coords.left }}
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  )
}
