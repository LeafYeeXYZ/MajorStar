import { useEffect, useState } from 'react'
import { Skeleton } from 'antd'
import { AlignLeftOutlined } from '@ant-design/icons'
import { ServerDataSchema, type ClientData, type ServerData } from '../../data/types.ts'

type DetailSectionProps = {
  title: string
  children: string
}

function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className={`overflow-hidden border border-blue-950`}>
      <div className="flex items-center gap-3 border-b border-blue-950 px-3 py-2 bg-blue-50">
        <span className={`h-2 w-2 border border-blue-950 bg-blue-200`} />
        <div className="text-base font-semibold text-blue-950">{title}</div>
      </div>
      <div className="px-3.5 py-2 text-sm leading-6 text-blue-950 bg-white">{children}</div>
    </section>
  )
}

type TitleSectionProps = {
  clientData: ClientData
  shortIntro: string
}

function TitleSection({ clientData, shortIntro }: TitleSectionProps) {
  return (
    <section className="overflow-hidden">
      <div className="flex flex-col max-w-3xl min-w-full">
        <div className="pt-2 pb-5 mb-3 flex items-start justify-between gap-2.5 border-blue-950 border-b-2 border-dashed">
          <div className="text-3xl sm:text-4xl">{clientData['专业名称']}</div>
          <div className="flex items-center gap-2 font-semibold text-sm flex-wrap justify-end">
            <div>{clientData['专业代码']}</div>
            <div>
              {clientData['学科门类']}-{clientData['专业类']}
            </div>
          </div>
        </div>
        <div className="text-sm font-semibold text-blue-950/90 pl-0.5 leading-6">{shortIntro}</div>
      </div>
    </section>
  )
}

type SimilarMajorsSectionProps = {
  majors: (ClientData & { similarity: number })[]
  onClick: (data: ClientData) => void
}

function SimilarMajorsSection({ majors, onClick }: SimilarMajorsSectionProps) {
  return (
    <section className={`overflow-hidden border border-blue-950 bg-blue-50`}>
      <div className="flex items-center gap-3 border-b border-blue-950 px-3 py-2">
        <span className={`h-2 w-2 border border-blue-950 bg-blue-200`} />
        <div className="text-base font-semibold text-blue-950">相似专业</div>
      </div>
      <div className="p-3 text-blue-950 bg-white">
        <ul className="flex flex-row flex-wrap gap-3 items-center justify-between">
          {majors.map((item) => (
            <li
              key={item['专业代码']}
              onClick={() => onClick(item)}
              className="cursor-pointer hover:bg-blue-100/60 px-2.5 pt-1.5 pb-2 border border-blue-950 w-[calc(50%-0.375rem)] md:w-[calc(33.33%-0.5rem)] bg-blue-50/30"
            >
              <div className="flex items-center justify-between flex-wrap">
                <div className="font-semibold text-sm text-blue-950">{item['专业名称']}</div>
                <div className="font-semibold text-sm text-blue-950">{item['专业代码']}</div>
              </div>
              <div className="font-semibold text-xs text-blue-950/80 mt-0.5">{`相似度 ${(item.similarity * 100).toFixed(2)}%`}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function calcSimilarity(target: ClientData, other: ClientData): number {
  const targetVec = target.embedding as [number, number]
  const otherVec = other.embedding as [number, number]
  const distance = Math.sqrt((targetVec[0] - otherVec[0]) ** 2 + (targetVec[1] - otherVec[1]) ** 2)
  return 1 / (1 + distance)
}

const SIMILAR_MAJORS_COUNT = 6

type MajorProps = {
  targetData: ClientData
  allData: ClientData[]
  openModal: (data: ClientData) => void
}

export function Major({ targetData, allData, openModal }: MajorProps) {
  const [data, setData] = useState<ServerData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const similarMajors = allData
    .filter((item) => item['专业代码'] !== targetData['专业代码'])
    .map((item) => ({
      ...item,
      similarity: calcSimilarity(targetData, item),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, SIMILAR_MAJORS_COUNT)

  useEffect(() => {
    const controller = new AbortController()

    async function loadData(): Promise<void> {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        const response = await fetch(`/data/${targetData['专业代码']}.json`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`数据加载失败: ${response.status}`)
        }

        const rawData: unknown = await response.json()
        const parsed = ServerDataSchema.safeParse(rawData)

        if (!parsed.success) {
          throw new Error('数据格式校验失败')
        }

        setData(parsed.data)
      } catch (error_) {
        if (controller.signal.aborted) return
        setError(error_ instanceof Error ? error_.message : '数据加载失败')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      controller.abort()
    }
  }, [targetData['专业代码']])

  return (
    <div className="text-blue-950">
      {loading ? (
        <div className="overflow-hidden w-full h-full p-5 flex items-center justify-center flex-col gap-4">
          <Skeleton.Node active>
            <AlignLeftOutlined className="text-5xl text-blue-950" />
          </Skeleton.Node>
          <div className="font-semibold text-blue-950">加载中</div>
        </div>
      ) : error ? (
        <div className="overflow-hidden w-full h-full p-5 flex items-center justify-center text-center">
          <div className="text-blue-950 font-semibold">加载失败: {error}</div>
        </div>
      ) : data ? (
        <div className="space-y-4">
          <TitleSection clientData={targetData} shortIntro={data['简介']} />

          <SimilarMajorsSection majors={similarMajors} onClick={openModal} />

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="知识结构与学习方式">{data['知识结构与学习方式']}</DetailSection>
            <DetailSection title="人格特质与能力要求">{data['人格特质与能力要求']}</DetailSection>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="就业方向与竞争门槛">{data['就业方向与竞争门槛']}</DetailSection>
            <DetailSection title="未来发展与常见误解">{data['未来发展与常见误解']}</DetailSection>
          </div>

          <DetailSection title="人生状态与自我实现">{data['人生状态与自我实现']}</DetailSection>
        </div>
      ) : null}
    </div>
  )
}
