import { useEffect, useState } from 'react'
import { Skeleton } from 'antd'
import { AlignLeftOutlined } from '@ant-design/icons'
import { ServerDataSchema, type ClientData, type ServerData } from '../../data/types.ts'

type DetailSectionProps = {
  title: string
  className?: string
  children: string
}

function DetailSection({ title, className, children }: DetailSectionProps) {
  return (
    <section className={`overflow-hidden border border-blue-950 bg-blue-50 ${className ?? ''}`}>
      <div className="flex items-center gap-3 border-b border-blue-950 px-4 py-3">
        <span className={`h-2 w-2 border border-blue-950 bg-blue-200`} />
        <div className="text-base font-semibold text-blue-950">{title}</div>
      </div>
      <div className="px-5 pt-2 pb-3 text-[14px] leading-7 text-blue-950">{children}</div>
    </section>
  )
}

type TitleSectionProps = {
  clientData: Omit<ClientData, 'embedding'>
  shortIntro: string
}

function TitleSection({ clientData, shortIntro }: TitleSectionProps) {
  return (
    <section className="overflow-hidden border border-blue-950 p-5 bg-blue-50">
      <div className="flex flex-col sm:flex-row justify-center sm:justify-between max-w-3xl gap-6 min-w-full">
        <div className="font-semibold text-left text-blue-950">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="inline-block text-2xl sm:text-3xl">{clientData['专业名称']}</div>
            <div className="inline-block text-base pb-2.5">{clientData['专业代码']}</div>
          </div>
          <div className="text-sm leading-7 text-blue-950/80 pl-0.5">{shortIntro}</div>
        </div>
        <div className="flex flex-col justify-center gap-2 text-sm text-blue-950 font-semibold">
          <div className="border border-blue-950 px-2 py-1.5 bg-blue-100 text-nowrap min-w-32 text-center">{`学科门类: ${clientData['学科门类']}`}</div>
          <div className="border border-blue-950 px-2 py-1.5 bg-blue-100 text-nowrap min-w-32 text-center">{`专业类: ${clientData['专业类']}`}</div>
        </div>
      </div>
    </section>
  )
}

type MajorProps = {
  clientData: Omit<ClientData, 'embedding'>
}

export function Major({ clientData }: MajorProps) {
  const [data, setData] = useState<ServerData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadData(): Promise<void> {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        const response = await fetch(`/data/${clientData['专业代码']}.json`, {
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
  }, [clientData['专业代码']])

  return (
    <div className="space-y-5 text-blue-950">
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
        <div className="space-y-5">
          <TitleSection clientData={clientData} shortIntro={data['简介']} />

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="人生价值">{data['人生价值']}</DetailSection>
            <DetailSection title="未来发展">{data['未来发展']}</DetailSection>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="知识结构">{data['知识结构']}</DetailSection>
            <DetailSection title="竞争与门槛">{data['竞争与门槛']}</DetailSection>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="常见误解">{data['常见误解']}</DetailSection>
            <DetailSection title="就业方向">{data['就业方向']}</DetailSection>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="适合人群">{data['适合人群']}</DetailSection>
            <DetailSection title="校际差异">{data['校际差异']}</DetailSection>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="学习方式">{data['学习方式']}</DetailSection>
            <DetailSection title="高中准备">{data['高中准备']}</DetailSection>
          </div>
        </div>
      ) : null}
    </div>
  )
}
