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
      // 默认位置：目标元素上方居中
      let top = targetRect.top - popoverRect.height - 8
      let left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2
      // 边界检测：上方空间不足时，自动翻转到下方
      if (top < 8) {
        top = targetRect.bottom + 8
      }
      // 边界检测：防止左右溢出屏幕
      if (left < 8) {
        left = 8
      } else if (left + popoverRect.width > window.innerWidth - 8) {
        left = window.innerWidth - popoverRect.width - 8
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
      className="inline-block relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible &&
        createPortal(
          <div
            ref={popoverRef}
            className={`fixed z-50 border border-blue-950 bg-blue-50 text-blue-950 px-3 py-2 shadow-md transition duration-150 ease-in-out ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${className || ''}`}
            style={{ top: coords.top, left: coords.left }}
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  )
}
