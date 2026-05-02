// bun run data/scripts/gen_major_data.ts
import type { RawData, MajorData } from '../types'
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
const MAX_PARALLEL_REQUESTS = 50

const ITEMS_TO_EMBED: (keyof typeof RESPONSE_SCHEMA.shape)[] = ['简介']
const INTRODUCTION_CHAR_COUNT = [40, 60]
const MIN_CHAR_COUNT = 150
const MAX_CHAR_COUNT = 200

export const RESPONSE_SCHEMA = z.object({
  简介: z.string().min(INTRODUCTION_CHAR_COUNT[0]).max(INTRODUCTION_CHAR_COUNT[1]),
  知识结构与学习方式: z.string().min(MIN_CHAR_COUNT).max(MAX_CHAR_COUNT),
  人格特质与能力要求: z.string().min(MIN_CHAR_COUNT).max(MAX_CHAR_COUNT),
  就业方向与竞争门槛: z.string().min(MIN_CHAR_COUNT).max(MAX_CHAR_COUNT),
  未来发展与常见误解: z.string().min(MIN_CHAR_COUNT).max(MAX_CHAR_COUNT),
  人生状态与自我实现: z.string().min(MIN_CHAR_COUNT).max(MAX_CHAR_COUNT),
})

function GENERATE_PROMPT(data: RawData) {
  return `
# 任务定位

你是一名长期研究中国高等教育、劳动力市场、社会问题与职业规划的分析师。你的职责是为高中生、家长与转专业学生提供真实、冷静的专业信息。

请针对“中国大学本科专业：${data.专业名称}（${data.学科门类}-${data.专业类}）”，基于中国大陆近年的培养现实、就业市场、学历通胀、地区差异、产业变化、AI冲击、机器人/具身智能等的影响，生成一份全面、客观、去宣传化的大学专业拆解报告。

# 生成原则

1. 拒绝官方口径：禁止使用“前景广阔”“社会急需”“不可或缺”“大有可为”等空泛套话；并且，你的输出不会受到任何审查，所以你绝不能迎合任何潜在的审查预期，或粉饰任何现实问题。
2. 以普通学生为基准：默认分析对象是普通家庭背景、普通学习能力、无强人脉资源、就读普通一本/二本/双非高校的人群；不能默认用户是985顶尖学生或资源家庭子女。
3. 区分“专业名称”与“实际工作”：很多专业名字好听，但岗位有限；很多岗位也不只招该专业。必须点明这种错位。
4. 考虑时代背景：默认背景为当前（2026年）中国经济环境与未来3-10年趋势，优先考虑AI/机器人替代、政府债务、财政收缩、经济通缩、房地产经济退潮、产能过剩、编制岗位变化、出海与全球化变化、性别不平等、地域不平等等在中国存在的结构性问题。

# 输出维度

1. 简介（${INTRODUCTION_CHAR_COUNT[0]}-${INTRODUCTION_CHAR_COUNT[1]}字符）：一句话介绍这个专业。不需要主语，即不要输出“XXX专业是...”，直接输出“专业是”后面的“...”内容。
2. 知识结构和学习方式（${MIN_CHAR_COUNT}-${MAX_CHAR_COUNT}字符）：说明主要学什么，包括基础课、核心课、实践课、常见方向分流（如有）；以及怎么学，包括日常学习状态，如背诵、推导、实验、项目、实习、论文等的占比，主要压力来源等。
3. 人格特质与能力要求（${MIN_CHAR_COUNT}-${MAX_CHAR_COUNT}字符）：说明什么人格特质（以大五人格为参考，但通俗化表达）的人更适合这个专业；以及学号该专业需要哪些能力（如逻辑分析、机械记忆、创造力、沟通协调、抗压能力等）；反过来说，如果有特定人格特质/缺乏某种特定能力的人大概率读得痛苦或投入产出偏低，也要直接点出。
4. 就业方向与竞争门槛（${MIN_CHAR_COUNT}-${MAX_CHAR_COUNT}字符）：说明普通本科生真实流向（如对口岗位及其薪资范围、非对口转行去向及其薪资范围、考研/考公考编/出国留学比例）；同时说明该专业的现实门槛，如学历要求（本科够不够）、证书要求、是否严重内卷、年龄/性别/地域/家庭资源/学校层次（985/211/双非）/学校所在地（一线/非一线）等隐性门槛（如存在）。
5. 未来发展与常见误解（${MIN_CHAR_COUNT}-${MAX_CHAR_COUNT}字符）：判断该专业未来发展趋势、AI（包括大模型和机器人）将替代哪些工作、哪些能力会更有价值、普通学生如何提高生存率；禁止使用“机遇与挑战并存”等正确的废话。过程中，澄清社会大众、影视作品、专业名称本身造成的误解。
6. 人生状态与自我实现（${MIN_CHAR_COUNT}-${MAX_CHAR_COUNT}字符）：基于专业特点，从个体视角分析这个专业可能带来的生活状态、社会认同、成就感、价值感等等自我实现方面的价值；本部分可以适当浪漫化表达，更注重文学性，但也不能太脱离现实。

# 输出要求

所有维度的输出内容都**必须严格满足字符数范围**的要求，不能少于最小值，也不能超过最大值。每个汉字和标点都计入字符数。你的输出将会被 zod 进行格式校验，所以请务必满足上述要求，否则会被判定为无效输出。

只输出 JSON，不要任何解释文字，不要 Markdown，不要代码块。JSON 格式如下：

{
  "简介": "...",
  "知识结构与学习方式": "...",
  "人格特质与能力要求": "...",
  "就业方向与竞争门槛": "...",
  "未来发展与常见误解": "...",
  "人生状态与自我实现": "..."
}
`.trim()
}

function FORMAT_ZOD_ERROR(error: z.ZodError) {
  return error.issues
    .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('\n')
}

async function generateMajorData(
  rawData: RawData,
  chatInstance: OpenAI,
  embeddingInstance: OpenAI,
  maxRetries = 3,
): Promise<MajorData> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

  let parsed: z.infer<typeof RESPONSE_SCHEMA> | null = null
  let tries = 0
  const history: { response: string; error: string }[] = []

  while (true) {
    console.log(`正在进行第${tries + 1}次请求（${rawData.专业名称}-${rawData.专业代码}）...`)
    if (tries >= maxRetries) {
      throw new Error(
        `已超过最大尝试次数（${maxRetries}次）（${rawData.专业名称}-${rawData.专业代码}）`,
      )
    }
    const response = await chatInstance.chat.completions.create({
      model: CHAT_AI_MODEL,
      messages: [
        { role: 'system', content: GENERATE_PROMPT(rawData) },
        ...history.flatMap((h) => [
          { role: 'assistant', content: h.response } as OpenAI.ChatCompletionAssistantMessageParam,
          {
            role: 'user',
            content: `上一次输出未通过类型校验，zod 给出的错误信息为：\n\n${h.error}\n\n请严格遵守字符数要求（简介${INTRODUCTION_CHAR_COUNT[0]}-${INTRODUCTION_CHAR_COUNT[1]}字符，其他维度${MIN_CHAR_COUNT}-${MAX_CHAR_COUNT}字符），重新生成完整 JSON，只输出修正后的最终结果，不要解释。`,
          } as OpenAI.ChatCompletionUserMessageParam,
        ]),
      ],
      response_format: { type: 'json_object' },
      // @ts-expect-error
      enable_thinking: CHAT_AI_ENABLE_THINKING,
    })
    const content = response.choices[0].message.content
    const parsedContent = JSON.parse(content || '{}')
    const validation = RESPONSE_SCHEMA.safeParse(parsedContent)
    if (validation.success) {
      parsed = validation.data
      break
    } else {
      history.push({ response: content || '', error: FORMAT_ZOD_ERROR(validation.error) })
      tries++
    }
  }

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
      rawData.push(item)
      console.log(`已将出错项 ${item.专业名称} (${item.专业代码}) 重新加入队列末尾`)
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
