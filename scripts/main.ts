// deno-lint-ignore-file no-unused-vars
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { InputData, OutputData } from '../lib/types.ts'
import { PCA } from 'ml-pca'
import OpenAI from 'jsr:@openai/openai@5.6.0'
import { max, mean, min, std } from '@psych/lib'

const openai = new OpenAI({
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: '', // 随用随删
})
let totalGenerateTokens = 0
let totalEmbeddingTokens = 0

async function generateDesc(item: InputData): Promise<string> {
  const res = await openai.chat.completions.create({
    model: 'qwen-plus-2025-04-28',
    messages: [
      {
        role: 'system',
        content:
          '你的任务是为用户提供专业生成描述, 描述的格式为:\n\n{专业名称}是一个{2-3句话简要介绍该专业的核心内容和定位}. 它的培养目标是{描述该专业培养学生的核心能力和素质要求}. 该专业的主要课程包括{列举该5门专业的核心课程}. 它的就业方向包括{说明毕业生主要的就业领域和岗位类型}. 在未来, 该专业{分析该专业在当前和未来的发展趋势及社会需求}.\n\n请用中文回答、使用英文标点符号、回答中不要换行; 内容要专业、准确、简洁; 总字数控制在300-400字.',
      },
      {
        role: 'user',
        content: `${item['专业名称']} (属于${item['学科门类']}门类的${
          item['专业类']
        }专业类)`,
      },
    ],
    stream: false,
  })
  totalGenerateTokens += res.usage?.total_tokens || 0
  const desc = res.choices[0].message.content
  if (!desc) {
    throw new Error('生成专业描述时模型返回了空内容')
  }
  return desc
    .replace(/，/g, ', ')
    .replace(/。/g, '. ')
    .replace(/；/g, '; ')
    .replace(/：/g, ': ')
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/（/g, ' (')
    .replace(/）/g, ') ')
    .replace(/《/g, '"')
    .replace(/》/g, '"')
    .replace(/…/g, '...')
    .replace(/！/g, '! ')
    .replace(/？/g, '? ')
    .replace(/—/g, '-')
    .replace(/【/g, ' [')
    .replace(/】/g, '] ')
    .trim()
}

async function generateVector(desc: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-v4',
    input: desc,
    dimensions: 1024,
    encoding_format: 'float',
  })
  totalEmbeddingTokens += res.usage?.total_tokens || 0
  return res.data[0].embedding
}

async function addDesc() {
  if (!import.meta.dirname) {
    throw new Error('import.meta.dirname is not defined')
  }
  const inputFilePath = resolve(import.meta.dirname, '../lib/raw.json')
  const outputFilePath = resolve(import.meta.dirname, '../lib/data.json')
  const existFilePath = outputFilePath
  const inputData: InputData[] = JSON.parse(
    await readFile(inputFilePath, 'utf-8'),
  )
  let existData: OutputData[]
  try {
    existData = JSON.parse(await readFile(existFilePath, 'utf-8')).data
  } catch {
    existData = []
  }
  const outputData: OutputData[] = []
  for (const item of inputData) {
    const existingItem = existData.find(
      (data) => data['专业代码'] === item['专业代码'],
    )
    if (existingItem) {
      outputData.push(existingItem)
      continue
    }
    const desc = await generateDesc(item)
    const vector = await generateVector(desc)
    if (!desc || !vector) {
      throw new Error('生成专业描述或向量时返回了空内容')
    }
    outputData.push({
      ...item,
      '专业描述文本': desc,
      '专业描述向量': vector,
    })
    await writeFile(
      outputFilePath,
      JSON.stringify({ data: outputData }, null, 2),
      'utf-8',
    )
    console.log(
      outputData.length,
      '/',
      inputData.length,
      '|',
      '总文本生成Tokens:',
      totalGenerateTokens,
      '总向量生成Tokens:',
      totalEmbeddingTokens,
    )
  }
}

async function applyPCA() {
  if (!import.meta.dirname) {
    throw new Error('import.meta.dirname is not defined')
  }
  const inputFilePath = resolve(import.meta.dirname, '../lib/data.json')
  const outputFilePath = resolve(
    import.meta.dirname,
    '../client/public/data.json',
  )
  const inputData: OutputData[] = JSON.parse(
    await readFile(inputFilePath, 'utf-8'),
  ).data
  const pca = new PCA(
    inputData.map((item) => item['专业描述向量']),
  )
  const transformedData = inputData.map((item) => ({
    ...item,
    '专业描述向量': pca.predict([item['专业描述向量']], { nComponents: 2 })
      .to1DArray(),
  }))
  // 标准化向量
  const meanX = mean(transformedData.map((item) => item['专业描述向量'][0]))
  const meanY = mean(transformedData.map((item) => item['专业描述向量'][1]))
  const stdX = std(transformedData.map((item) => item['专业描述向量'][0]))
  const stdY = std(transformedData.map((item) => item['专业描述向量'][1]))
  for (const item of transformedData) {
    item['专业描述向量'][0] = (item['专业描述向量'][0] - meanX) / stdX
    item['专业描述向量'][1] = (item['专业描述向量'][1] - meanY) / stdY
  }
  const maxX = max(transformedData.map((item) => item['专业描述向量'][0]))
  const minX = min(transformedData.map((item) => item['专业描述向量'][0]))
  const maxY = max(transformedData.map((item) => item['专业描述向量'][1]))
  const minY = min(transformedData.map((item) => item['专业描述向量'][1]))
  console.log('标准化后X轴范围:', minX, '-', maxX)
  console.log('标准化后Y轴范围:', minY, '-', maxY)
  await writeFile(
    outputFilePath,
    JSON.stringify({ data: transformedData }, null, 2),
    'utf-8',
  )
}

if (import.meta.main) {
  // await addDesc()
  await applyPCA()
}
