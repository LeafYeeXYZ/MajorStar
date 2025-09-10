import { max, min } from '@psych/lib'
import raw from './data.json' with { type: 'json' }

export const subjects = [
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

export const config = {
  all: {
    x: {
      domain: [
        +min(raw.data.map((item) => item['专业描述向量'][0])).toFixed(2) - 0.1,
        +max(raw.data.map((item) => item['专业描述向量'][0])).toFixed(2) + 0.1,
      ],
    },
    y: {
      domain: [
        +min(raw.data.map((item) => item['专业描述向量'][1])).toFixed(2) - 0.1,
        +max(raw.data.map((item) => item['专业描述向量'][1])).toFixed(2) + 0.1,
      ],
    },
  },
  subjects: subjects.map((subject) => {
    const filteredData = raw.data.filter((item) => item['学科门类'] === subject)
    const xValues = filteredData.map((item) => item['专业描述向量'][0])
    const yValues = filteredData.map((item) => item['专业描述向量'][1])
    return {
      x: {
        domain: [
          +(min(xValues) - 0.1).toFixed(2),
          +(max(xValues) + 0.1).toFixed(2),
        ],
      },
      y: {
        domain: [
          +(min(yValues) - 0.1).toFixed(2),
          +(max(yValues) + 0.1).toFixed(2),
        ],
      },
    }
  }),
}

export const data = {
  all: raw.data.map((item) => ({
    ...item,
    a: item['专业描述向量'][0],
    b: item['专业描述向量'][1],
  })),
  subjects: subjects.map((subject) =>
    raw.data
      .filter((item) => item['学科门类'] === subject)
      .map((item) => ({
        ...item,
        a: item['专业描述向量'][0],
        b: item['专业描述向量'][1],
      }))
  ),
}
