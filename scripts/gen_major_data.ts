import type { RawData, MajorData } from '../data/types'
import OpenAI from 'openai'
import * as fs from 'node:fs/promises'
import z from 'zod'

const RAW_DATA_PATH = 'data/raw_data.json' // 记得压缩
const OUTPUT_PATH = 'data/major_data.json' // 记得压缩
const CHAT_AI_BASE_URL = 'https://api.deepseek.com'
const CHAT_AI_API_KEY = '' // 随用随填
const CHAT_AI_MODEL = 'deepseek-v4-pro'
const CHAT_AI_ENABLE_THINKING = true
const EMBEDDING_AI_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
const EMBEDDING_AI_API_KEY = '' // 随用随填
const EMBEDDING_AI_MODEL = 'text-embedding-v4'
const EMBEDDING_DIMENSION = 1024
const MAX_PARALLEL_REQUESTS = 20

const PROMPT = `
，从以下10个维度进行详细描述:

1. 定义与本质: 用一句话讲清楚这个专业研究什么、解决什么问题。20-40 字。
2. 知识结构: 介绍核心课程，让读者知道日常学习内容。分为专业必修课和专业选修课两部分，各自列举几门并简要说明内容。100-150 字。
3. 学习方式: 很多高中生误以为大学只是听课考试，所以这部分很重要；可以介绍偏背诵还是偏理解、做实验还是写论文、是否需要编程、是否经常做小组项目、是否要实习/调研/田野调查等等。100-150 字。
4. 适合人群: 可以从兴趣、能力、性格说。100-150 字。
5. 常见误解: 该专业常见的刻板印象、大众误区等。100-150 字。
6. 就业方向: 包括对口岗位、跨行业岗位、深造路径等。100-150 字。
7. 竞争与门槛: 包括是否需要读研、行业竞争是否激烈、起薪水平大致怎样、城市差异大不大等。100-150 字。
8. 校际差异: 主要讲该专业在不同学校、不同地区的差异，帮助读者了解选校时该专业的考虑因素。100-150 字。
9. 高中准备: 给出具体可行的建议，帮助读者在高中阶段为大学学习做好准备。例如心理学可以围绕数学、生物、英语、统计思维、阅读习惯说；计算机可以围绕数学、逻辑、编程启蒙说；法学可以围绕阅读理解、表达能力、社会关注度说。100-150 字。
10. 未来发展: 介绍该专业在未来的发展前景、社会需求、技术进步等方面的趋势。着重介绍 AI 的发展对该专业的影响，帮助读者了解未来可能的变化和机会。100-150 字。

请确保每个维度的描述都符合要求的字数范围，并且内容翔实有用，能够真正帮助高中生了解这个专业。

最后的输出请严格按照以下 JSON 格式，不要有任何多余的文本：

{
  "定义与本质": "...",
  "知识结构": "...",
  "学习方式": "...",
  "适合人群": "...",
  "常见误解": "...",
  "就业方向": "...",
  "竞争与门槛": "...",
  "校际差异": "...",
  "高中准备": "...",
  "未来发展": "..."
}
`.trim()

const RESPONSE_SCHEMA = z.object({
  定义与本质: z.string(),
  知识结构: z.string(),
  学习方式: z.string(),
  适合人群: z.string(),
  常见误解: z.string(),
  就业方向: z.string(),
  竞争与门槛: z.string(),
  校际差异: z.string(),
  高中准备: z.string(),
  未来发展: z.string(),
})

const ITEMS_TO_EMBED: (keyof typeof RESPONSE_SCHEMA.shape)[] = [
  '定义与本质',
  '知识结构',
  '学习方式',
  '适合人群',
  '就业方向',
  '未来发展',
]

async function generateMajorData(
  rawData: RawData,
  chatInstance: OpenAI,
  embeddingInstance: OpenAI,
): Promise<MajorData> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))
  const prompt = `请针对"${rawData.专业名称}"专业${PROMPT}`
  const chatResponse = await chatInstance.chat.completions.create({
    model: CHAT_AI_MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    // @ts-expect-error - 目前 OpenAI SDK 的 TypeScript 定义不支持 enable_thinking 参数
    enable_thinking: CHAT_AI_ENABLE_THINKING,
  })
  const content = chatResponse.choices[0].message.content
  const parsed = RESPONSE_SCHEMA.parse(JSON.parse(content || '{}'))
  const toEmbed = ITEMS_TO_EMBED.map((key) => parsed[key]).join('\n')
  const embeddingResponse = await embeddingInstance.embeddings.create({
    model: EMBEDDING_AI_MODEL,
    input: toEmbed,
    dimensions: EMBEDDING_DIMENSION,
  })
  return {
    ...rawData,
    ...parsed,
    embedding: embeddingResponse.data[0].embedding,
  }
}

// bun run scripts/gen_major_data.ts
if (import.meta.main) {
  const rawData: RawData[] = JSON.parse(await fs.readFile(RAW_DATA_PATH, 'utf-8'))
  const majorData: MajorData[] = JSON.parse(await fs.readFile(OUTPUT_PATH, 'utf-8'))
  const chatInstance = new OpenAI({
    baseURL: CHAT_AI_BASE_URL,
    apiKey: CHAT_AI_API_KEY,
  })
  const embeddingInstance = new OpenAI({
    baseURL: EMBEDDING_AI_BASE_URL,
    apiKey: EMBEDDING_AI_API_KEY,
  })
  const numTotal = rawData.length
  let numSkipped = 0
  let numGenerated = 0
  let numFailed = 0
  const startTime = Date.now()
  const request = async () => {
    const item = rawData.shift()
    if (!item) return
    try {
      if (majorData.some((data) => data.专业代码 === item.专业代码)) {
        numSkipped++
        console.log(`跳过 ${item.专业名称} (${item.专业代码}), 已存在于 major_data.json 中`)
      } else {
        const data = await generateMajorData(item, chatInstance, embeddingInstance)
        majorData.push(data)
        numGenerated++
        await fs.writeFile(OUTPUT_PATH, JSON.stringify(majorData, null, 2), 'utf-8')
        console.log(`成功生成 ${item.专业名称} (${item.专业代码}), 已保存到 major_data.json 中`)
      }
    } catch (error) {
      numFailed++
      console.error(`处理 ${item.专业名称} (${item.专业代码}) 时出错:`, error)
    } finally {
      const endTime = Date.now()
      const elapsedTime = (endTime - startTime) / 1000
      const speed = elapsedTime / numGenerated
      const remainingTime = rawData.length * speed
      console.log(
        `共 ${numTotal} 个, 成功 ${numGenerated} 个, 跳过 ${numSkipped} 个, 失败 ${numFailed} 个, 剩余 ${rawData.length} 个, 预计剩余时间 ${(remainingTime / 60).toFixed(2)} 分钟`,
      )
    }
    return request()
  }
  const promises = Array.from({ length: MAX_PARALLEL_REQUESTS }, () => request())
  await Promise.all(promises)
}
