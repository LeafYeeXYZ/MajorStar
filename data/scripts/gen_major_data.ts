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
const MAX_PARALLEL_REQUESTS = 30

const ITEMS_TO_EMBED: (keyof typeof RESPONSE_SCHEMA.shape)[] = [
  '简介',
  '知识结构',
  '适合人群',
  '就业方向',
  '人生价值',
]

const RESPONSE_SCHEMA = z.object({
  简介: z.string(),
  知识结构: z.string(),
  学习方式: z.string(),
  适合人群: z.string(),
  常见误解: z.string(),
  就业方向: z.string(),
  竞争与门槛: z.string(),
  校际差异: z.string(),
  高中准备: z.string(),
  未来发展: z.string(),
  人生价值: z.string(),
})

function GENERATE_PROMPT(data: RawData) {
  return `
# 任务定位

你是一名长期研究中国高等教育、劳动力市场、社会问题与职业分层的分析师。你的职责是为高中生、家长与转专业学生提供**真实、冷静、可执行**的专业信息，帮助他们降低信息差与决策失误风险。

请针对“中国大学本科专业：${data.专业名称}（${data.学科门类}-${data.专业类}）”，基于中国大陆近年的培养现实、就业市场、学历通胀、地区差异、产业变化与AI冲击，生成一份**全面、客观、去宣传化**的专业拆解报告。

# 总原则（必须遵守）

1. **拒绝招生宣传口吻**：禁止使用“前景广阔”“社会急需”“就业率高”“不可或缺”“大有可为”等空泛套话。
2. **以普通学生为基准**：默认分析对象是普通家庭背景、普通学习能力、无强人脉资源、就读普通一本/二本/双非高校、希望毕业后尽快就业或理性升学的人群，不能默认用户是985顶尖学生、天赋型选手、资源家庭子女。
3. **承认差异，不极端唱衰**：既不能粉饰，也不能为制造冲击感而夸张贬低。要写清哪些问题是真实普遍问题、哪些问题只存在于部分院校/地区/赛道、哪些人仍可能受益。
4. **具体胜过抽象**：少讲概念，多讲现实，比如学什么、累不累、难在哪、毕业去哪、薪资大致层级、升学是否刚需、哪类人容易后悔等。
5. **区分“专业名称”与“实际工作”**：很多专业名字好听，但岗位有限；很多岗位也不只招该专业。必须点明这种错位。
6. **避免误导性确定判断**：不要使用“一定失业”“读了就完了”“100%高薪”“必须考研才有出路”，改为概率表达，如“多数情况下”“在当前市场下常见情况是”“普通院校毕业生往往面临”。
7. **考虑时间背景**：默认时间背景为当前中国经济环境与未来3-10年趋势，考虑AI替代、财政收缩与经济通缩、房地产链变化、制造业升级与产能过剩、服务业竞争、编制岗位变化、出海与全球化变化。

# 输出维度（严格按以下11项）

1. 简介（30-60字）：一句话说明这个专业本质上在培养什么人，解决什么问题。避免官方定义。
2. 知识结构（120-180字）：说明主要学什么，包括基础课、核心课、实践课、常见方向分流（如有），并指出哪些内容偏理论、哪些内容更新慢、哪些技能要靠自学。
3. 学习方式（120-180字）：真实描述大学四年的日常状态，例如背书考试多、数学推导多、实验报告多、编程项目多、画图建模多、实习奔波多、论文折磨多，指出主要压力来源。
4. 适合人群（120-180字）：分成两部分，一是具备哪些能力/性格的人更适合，二是哪些情况的人大概率读得痛苦或投入产出偏低，需要慎重报考。避免羞辱性表达，但要直接。
5. 常见误解（120-180字）：指出社会大众、影视作品、专业名称本身造成的误解，例如名字高级但岗位普通、看似文科实际很卷、看似理工实际大量背诵、专业对口岗位远少于想象。
6. 就业方向（120-180字）：说明普通本科生真实流向，如对口岗位有哪些、非对口转行去向、考研/考公/考编比例倾向、一线城市与非一线差异，不要只写最光鲜岗位。
7. 竞争与门槛（120-180字）：说明现实门槛，如学历要求（本科够不够）、证书要求、实习要求、起薪区间（用区间表达）、是否严重内卷、年龄/性别/地域/资源等隐性门槛（如存在）。
8. 校际差异（120-180字）：说明985/211/双非差异是否明显，如更看学校牌子？更看作品集？更看实习？更看考试成绩？更看家庭资源？指出命运差距是否大。
9. 高中准备（120-180字）：给高中生具体建议，如哪些学科基础重要、哪些能力提前练习、可先体验什么内容判断兴趣、哪些偏科会导致大学吃力，拒绝空话。
10. 未来发展（120-180字）：结合未来3-10年，判断扩招还是收缩、红海还是结构性机会、AI替代哪些初级工作、哪些能力更值钱、普通学生如何提高生存率，禁止使用“机遇与挑战并存”等“正确的废话”。
11. 人生价值（120-180字）：基于专业特点，从个体视角分析这个专业可能带来的生活状态、社会认同、成就感等方面的价值；本部分可以适当浪漫表达，但要基于前面10部分的现实分析，避免脱离实际的“鸡汤文”。

# 写作风格要求

1. 语言直接、清醒、专业。
2. 可以犀利，但不能情绪化辱骂。
3. 允许指出残酷现实，但要给判断依据。
4. 不制造焦虑，不过度煽动。
5. 让18岁学生看完后，能真正理解这个专业。

# 输出要求

只输出 JSON，不要任何解释文字，不要 Markdown，不要代码块。JSON 格式如下：

{
  "简介": "...",
  "知识结构": "...",
  "学习方式": "...",
  "适合人群": "...",
  "常见误解": "...",
  "就业方向": "...",
  "竞争与门槛": "...",
  "校际差异": "...",
  "高中准备": "...",
  "未来发展": "...",
  "人生价值": "..."
}

# 额外质量约束（必须满足）

1. 每个字段内容必须具体，不能空泛重复。
2. 不同字段之间避免内容重复。
3. 必须体现该专业特色，不能像套模板。
4. 若某专业信息不足，依据学科逻辑合理推断，但不要编造具体数据。
5. 输出必须是合法 JSON 字符串格式。
`.trim()
}

async function generateMajorData(
  rawData: RawData,
  chatInstance: OpenAI,
  embeddingInstance: OpenAI,
): Promise<MajorData> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))
  const chatResponse = await chatInstance.chat.completions.create({
    model: CHAT_AI_MODEL,
    messages: [{ role: 'system', content: GENERATE_PROMPT(rawData) }],
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
