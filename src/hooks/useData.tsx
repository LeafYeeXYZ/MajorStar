import { useState, useEffect } from 'react'

import type { ClientData } from '../../data/types.ts'

export type Subject =
  | '哲学'
  | '经济学'
  | '法学'
  | '教育学'
  | '文学'
  | '历史学'
  | '理学'
  | '工学'
  | '农学'
  | '医学'
  | '管理学'
  | '艺术学'

export type ScatterData = {
  all: (ClientData & {
    a: number
    b: number
  })[]
  subjects: (ClientData & {
    a: number
    b: number
  })[][]
}

const RAW_CLIENT_DATA_URL = '/data.json'
export const SUBJECTS: Subject[] = [
  '哲学',
  '经济学',
  '法学',
  '教育学',
  '文学',
  '历史学',
  '理学',
  '工学',
  '农学',
  '医学',
  '管理学',
  '艺术学',
]

export function useData() {
  const [scatterData, setScatterData] = useState<ScatterData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData(): Promise<void> {
      setLoading(true)
      setError(null)
      setScatterData(null)
      try {
        const response = await fetch(RAW_CLIENT_DATA_URL)
        if (!response.ok) {
          throw new Error(`数据加载失败: ${response.status}`)
        }
        const rawData: ClientData[] = await response.json()
        const scatterData: ScatterData = {
          all: rawData.map((item) => ({
            ...item,
            a: item.embedding[0],
            b: item.embedding[1],
          })),
          subjects: SUBJECTS.map((subject) =>
            rawData
              .filter((item) => item['学科门类'] === subject)
              .map((item) => ({
                ...item,
                a: item.embedding[0],
                b: item.embedding[1],
              })),
          ),
        }
        setScatterData(scatterData)
      } catch (error) {
        setError(error instanceof Error ? error.message : '数据加载失败')
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  return { scatterData, loading, error }
}
