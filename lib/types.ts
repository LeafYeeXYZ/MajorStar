export type InputData = {
  '学科门类': string
  '专业类': string
  '专业类代码': string
  '专业名称': string
  '专业代码': string
  '专业描述文本'?: string
  '专业描述向量'?: number[]
}

export type OutputData = {
  '学科门类': string
  '专业类': string
  '专业类代码': string
  '专业名称': string
  '专业代码': string
  '专业描述文本': string
  '专业描述向量': number[]
}

export type MajorData = OutputData
