// bun run data/scripts/gen_server_data.ts
import type { MajorData, ServerData } from '../types'
import * as fs from 'node:fs/promises'

const MAJOR_DATA_PATH = 'data/major_data.json'
const SERVER_DATA_DIR = 'public/data'

if (import.meta.main) {
  const majorData: MajorData[] = JSON.parse(await fs.readFile(MAJOR_DATA_PATH, 'utf-8'))
  for (const item of majorData) {
    const serverData: ServerData = {
      学科门类: item.学科门类,
      专业类: item.专业类,
      专业名称: item.专业名称,
      专业代码: item.专业代码,
      简介: item.简介,
      知识结构与学习方式: item.知识结构与学习方式,
      人格特质与能力要求: item.人格特质与能力要求,
      就业方向与竞争门槛: item.就业方向与竞争门槛,
      未来发展与常见误解: item.未来发展与常见误解,
      人生状态与自我实现: item.人生状态与自我实现,
    }
    const outputPath = `${SERVER_DATA_DIR}/${item.专业代码}.json`
    await fs.writeFile(outputPath, JSON.stringify(serverData, null, 2), 'utf-8')
  }
  console.log(`已生成 ${majorData.length} 个文件`)
}
