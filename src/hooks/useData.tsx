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

type ScatterConfig = {
  all: {
    x: {
      domain: [number, number]
    }
    y: {
      domain: [number, number]
    }
  }
  subjects: {
    x: {
      domain: [number, number]
    }
    y: {
      domain: [number, number]
    }
  }[]
}

type ScatterData = {
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
const LABELS_OFFSET = 0.5
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
  const [scatterConfig, setScatterConfig] = useState<ScatterConfig | null>(null)
  const [scatterData, setScatterData] = useState<ScatterData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData(): Promise<void> {
      setLoading(true)
      setError(null)
      setScatterConfig(null)
      setScatterData(null)

      try {
        const response = await fetch(RAW_CLIENT_DATA_URL)

        if (!response.ok) {
          throw new Error(`数据加载失败: ${response.status}`)
        }

        const rawData: ClientData[] = await response.json()

        const minEmbedding0 = Math.min(...rawData.map((item) => item.embedding[0]))
        const maxEmbedding0 = Math.max(...rawData.map((item) => item.embedding[0]))
        const minEmbedding1 = Math.min(...rawData.map((item) => item.embedding[1]))
        const maxEmbedding1 = Math.max(...rawData.map((item) => item.embedding[1]))

        const scatterConfig: ScatterConfig = {
          all: {
            x: {
              domain: [
                +minEmbedding0.toFixed(2) - LABELS_OFFSET,
                +maxEmbedding0.toFixed(2) + LABELS_OFFSET,
              ],
            },
            y: {
              domain: [
                +minEmbedding1.toFixed(2) - LABELS_OFFSET,
                +maxEmbedding1.toFixed(2) + LABELS_OFFSET,
              ],
            },
          },
          subjects: SUBJECTS.map((subject) => {
            const filteredData = rawData.filter((item) => item['学科门类'] === subject)
            const xValues = filteredData.map((item) => item.embedding[0])
            const yValues = filteredData.map((item) => item.embedding[1])
            const xMin = Math.min(...xValues)
            const xMax = Math.max(...xValues)
            const yMin = Math.min(...yValues)
            const yMax = Math.max(...yValues)
            return {
              x: {
                domain: [+xMin.toFixed(2) - LABELS_OFFSET, +xMax.toFixed(2) + LABELS_OFFSET],
              },
              y: {
                domain: [+yMin.toFixed(2) - LABELS_OFFSET, +yMax.toFixed(2) + LABELS_OFFSET],
              },
            }
          }),
        }

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
        setScatterConfig(scatterConfig)
        setScatterData(scatterData)
      } catch (error) {
        setError(error instanceof Error ? error.message : '数据加载失败')
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  return { scatterConfig, scatterData, loading, error }
}
