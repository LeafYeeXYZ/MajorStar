import * as fs from 'node:fs/promises'

import OpenAI from 'openai'

// bun run data/scripts/regen_major_vec.ts
import type { MajorData } from '../types'
import { RESPONSE_SCHEMA } from './gen_major_data.ts'

const DATA_PATH = 'data/major_data.json' // 记得压缩
const EMBEDDING_AI_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
const EMBEDDING_AI_API_KEY = '' // 随用随填
const EMBEDDING_AI_MODEL = 'text-embedding-v4'
const EMBEDDING_DIMENSION = 1024
const MAX_PARALLEL_REQUESTS = 10

const ITEMS_TO_EMBED: (keyof typeof RESPONSE_SCHEMA.shape)[] = ['简介', '人生状态与自我实现']

if (import.meta.main) {
  const originalData: MajorData[] = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'))
  const updatedData: MajorData[] = []
  const embeddingInstance = new OpenAI({
    baseURL: EMBEDDING_AI_BASE_URL,
    apiKey: EMBEDDING_AI_API_KEY,
  })
  const numTotal = originalData.length
  let numGenerated = 0
  let numFailed = 0
  const startTime = Date.now()
  const request = async () => {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50))
    const item = originalData.shift()
    if (!item) return
    try {
      const toEmbed = ITEMS_TO_EMBED.map((key) => item[key]).join('\n')
      const embeddingResponse = await embeddingInstance.embeddings.create({
        model: EMBEDDING_AI_MODEL,
        input: toEmbed,
        dimensions: EMBEDDING_DIMENSION,
      })
      item.embedding = embeddingResponse.data[0].embedding
      updatedData.push(item)
      console.log(`成功更新 ${item.专业名称} (${item.专业代码}) 的词向量`)
      numGenerated++
    } catch (error) {
      console.error(`处理 ${item.专业名称} (${item.专业代码}) 时出错:`, error)
      originalData.push(item)
      console.log(`已将出错项 ${item.专业名称} (${item.专业代码}) 重新加入队列末尾`)
      numFailed++
    } finally {
      const endTime = Date.now()
      const elapsedTime = (endTime - startTime) / 1000
      const speed = elapsedTime / numGenerated
      const remainingTime = originalData.length * speed
      console.log(
        `共 ${numTotal} 个, 成功 ${numGenerated} 个, 失败 ${numFailed} 个, 剩余 ${originalData.length} 个, 预计剩余时间 ${(remainingTime / 60).toFixed(2)} 分钟`,
      )
    }
    return request()
  }
  const promises = Array.from({ length: MAX_PARALLEL_REQUESTS }, () => request())
  await Promise.all(promises)
  await fs.writeFile(DATA_PATH, JSON.stringify(updatedData, null, 2), 'utf-8')
  console.log(`已更新 ${updatedData.length} 条数据并保存到 ${DATA_PATH} 中`)
}
