import type { MajorData, ServerData } from '../data/types'
import * as fs from 'node:fs/promises'

const MAJOR_DATA_PATH = 'data/major_data.json'
const SERVER_DATA_DIR = 'public/data'

// bun run scripts/gen_server_data.ts
if (import.meta.main) {
  const majorData: MajorData[] = JSON.parse(await fs.readFile(MAJOR_DATA_PATH, 'utf-8'))
  for (const item of majorData) {
    const serverData: ServerData = {
      学科门类: item.学科门类,
      专业类: item.专业类,
      专业名称: item.专业名称,
      专业代码: item.专业代码,
      定义与本质: item.定义与本质,
      知识结构: item.知识结构,
      学习方式: item.学习方式,
      适合人群: item.适合人群,
      常见误解: item.常见误解,
      就业方向: item.就业方向,
      竞争与门槛: item.竞争与门槛,
      校际差异: item.校际差异,
      高中准备: item.高中准备,
      未来发展: item.未来发展,
    }
    const outputPath = `${SERVER_DATA_DIR}/${item.专业代码}.json`
    await fs.writeFile(outputPath, JSON.stringify(serverData, null, 2), 'utf-8')
  }
  console.log(`已生成 ${majorData.length} 个文件`)
}
