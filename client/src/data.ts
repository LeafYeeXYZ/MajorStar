import { max, min } from '@psych/lib'
import type { MajorData } from '../../lib/types.ts'

const [rawUMAP, rawPCA]: [MajorData[], MajorData[]] = await Promise.all([
  fetch('/data_umap.json').then((res) => res.json()).then((json) => json.data),
  fetch('/data_pca.json').then((res) => res.json()).then((json) => json.data),
])

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

const configUMAP = {
  all: {
    x: {
      domain: [
        +min(rawUMAP.map((item) => item['专业描述向量'][0])).toFixed(2) - 0.1,
        +max(rawUMAP.map((item) => item['专业描述向量'][0])).toFixed(2) + 0.1,
      ],
    },
    y: {
      domain: [
        +min(rawUMAP.map((item) => item['专业描述向量'][1])).toFixed(2) - 0.1,
        +max(rawUMAP.map((item) => item['专业描述向量'][1])).toFixed(2) + 0.1,
      ],
    },
  },
  subjects: subjects.map((subject) => {
    const filteredData = rawUMAP.filter((item) => item['学科门类'] === subject)
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

const configPCA = {
  all: {
    x: {
      domain: [
        +min(rawPCA.map((item) => item['专业描述向量'][0])).toFixed(2) - 0.1,
        +max(rawPCA.map((item) => item['专业描述向量'][0])).toFixed(2) + 0.1,
      ],
    },
    y: {
      domain: [
        +min(rawPCA.map((item) => item['专业描述向量'][1])).toFixed(2) - 0.1,
        +max(rawPCA.map((item) => item['专业描述向量'][1])).toFixed(2) + 0.1,
      ],
    },
  },
  subjects: subjects.map((subject) => {
    const filteredData = rawPCA.filter((item) => item['学科门类'] === subject)
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

export const config = {
  umap: configUMAP,
  pca: configPCA,
}

const dataUMAP = {
  all: rawUMAP.map((item) => ({
    ...item,
    a: item['专业描述向量'][0],
    b: item['专业描述向量'][1],
  })),
  subjects: subjects.map((subject) =>
    rawUMAP
      .filter((item) => item['学科门类'] === subject)
      .map((item) => ({
        ...item,
        a: item['专业描述向量'][0],
        b: item['专业描述向量'][1],
      }))
  ),
}

const dataPCA = {
  all: rawPCA.map((item) => ({
    ...item,
    a: item['专业描述向量'][0],
    b: item['专业描述向量'][1],
  })),
  subjects: subjects.map((subject) =>
    rawPCA
      .filter((item) => item['学科门类'] === subject)
      .map((item) => ({
        ...item,
        a: item['专业描述向量'][0],
        b: item['专业描述向量'][1],
      }))
  ),
}

export const data = {
  umap: dataUMAP,
  pca: dataPCA,
}
