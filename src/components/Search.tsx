import type { ClientData } from '../../data/types.ts'
import { Popover } from './Popover.tsx'
import { Button } from './Button.tsx'
import { SearchOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import { useEffect, useRef, useState } from 'react'

type SearchProps = {
  data: ClientData[]
  onClick: (data: ClientData) => void
  disabled?: boolean
}

export function Search({ data, onClick, disabled }: SearchProps) {
  return (
    <Popover content={<SearchPanel data={data} onClick={onClick} />}>
      <Button disabled={disabled} className="h-9 w-9 flex items-center justify-center">
        <SearchOutlined className="m-0!" />
      </Button>
    </Popover>
  )
}

const QUERY_CACHE_KEY = 'search_query'
const THROTTLE_DELAY = 200

function setCachedQuery(query: string) {
  localStorage.setItem(QUERY_CACHE_KEY, query)
}

function getCachedQuery(): string {
  return localStorage.getItem(QUERY_CACHE_KEY) || ''
}

function SearchPanel({ data, onClick }: SearchProps) {
  const [query, setQuery] = useState(getCachedQuery())
  const [throttledQuery, setThrottledQuery] = useState('')
  const lastUpdateRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastUpdateRef.current
    const commitQuery = () => {
      lastUpdateRef.current = Date.now()
      setThrottledQuery(query)
      setCachedQuery(query)
      timerRef.current = null
    }
    if (lastUpdateRef.current === 0 || elapsed >= THROTTLE_DELAY) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      commitQuery()
      return
    }
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(commitQuery, THROTTLE_DELAY - elapsed)
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [query])

  const filteredData = throttledQuery
    ? data.filter(
        (item) => item.专业名称.includes(throttledQuery) || item.专业代码.includes(throttledQuery),
      )
    : []

  return (
    <div className="flex flex-col items-start overflow-auto py-2 px-3 w-[min(calc(100dvw-1.5rem),24rem)]">
      <div className="text-blue-950 text-base font-semibold mb-1.5 px-px">搜索专业</div>
      <div className="w-full mb-2">
        <Input
          className="border border-blue-950! rounded-none!"
          placeholder="输入专业名称或代码搜索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="font-semibold w-full">
        {filteredData.length > 0 ? (
          <ul className="flex flex-col gap-px overflow-auto max-h-[50dvh] w-full text-[0.8rem]">
            {filteredData.map((item) => (
              <li
                key={item.专业代码}
                onClick={() => onClick(item)}
                className="cursor-pointer hover:bg-blue-200/80 px-2 py-1 flex items-center justify-between"
              >
                <div>
                  {item.专业名称} {item.专业代码}
                </div>
                <div>
                  {item.学科门类}-{item.专业类}
                </div>
              </li>
            ))}
          </ul>
        ) : throttledQuery ? (
          <div className="text-blue-950/80 text-xs">无结果</div>
        ) : (
          <div className="text-blue-950/80 text-xs">请输入专业名称或代码进行搜索</div>
        )}
      </div>
    </div>
  )
}
