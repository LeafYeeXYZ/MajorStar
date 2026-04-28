import raw from './data.json' with { type: 'json' }
import type { ClientData } from '../data/types.ts'

const RAW_CLIENT_DATA: ClientData[] = raw
export const SUBJECTS = [
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
const MIN_EMBEDDING_0 = Math.min(...RAW_CLIENT_DATA.map((item) => item.embedding[0]))
const MAX_EMBEDDING_0 = Math.max(...RAW_CLIENT_DATA.map((item) => item.embedding[0]))
const MIN_EMBEDDING_1 = Math.min(...RAW_CLIENT_DATA.map((item) => item.embedding[1]))
const MAX_EMBEDDING_1 = Math.max(...RAW_CLIENT_DATA.map((item) => item.embedding[1]))
export const CONFIG = {
  all: {
    x: {
      domain: [+MIN_EMBEDDING_0.toFixed(2) - 0.1, +MAX_EMBEDDING_0.toFixed(2) + 0.1],
    },
    y: {
      domain: [+MIN_EMBEDDING_1.toFixed(2) - 0.1, +MAX_EMBEDDING_1.toFixed(2) + 0.1],
    },
  },
  subjects: SUBJECTS.map((subject) => {
    const filteredData = RAW_CLIENT_DATA.filter((item) => item['学科门类'] === subject)
    const xValues = filteredData.map((item) => item.embedding[0])
    const yValues = filteredData.map((item) => item.embedding[1])
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)
    return {
      x: {
        domain: [+xMin.toFixed(2) - 0.1, +xMax.toFixed(2) + 0.1],
      },
      y: {
        domain: [+yMin.toFixed(2) - 0.1, +yMax.toFixed(2) + 0.1],
      },
    }
  }),
}

export const DATA = {
  all: RAW_CLIENT_DATA.map((item) => ({
    ...item,
    a: item.embedding[0],
    b: item.embedding[1],
    embedding: undefined,
  })),
  subjects: SUBJECTS.map((subject) =>
    RAW_CLIENT_DATA.filter((item) => item['学科门类'] === subject).map((item) => ({
      ...item,
      a: item.embedding[0],
      b: item.embedding[1],
      embedding: undefined,
    })),
  ),
}
