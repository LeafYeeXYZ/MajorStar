import { useEffect, useState } from 'react'
import { Skeleton } from 'antd'
import { ServerDataSchema, type ClientData, type ServerData } from '../../data/types.ts'

function DetailSection({
  title,
  accentClassName,
  className,
  children,
}: {
  title: string
  accentClassName: string
  className?: string
  children: string
}) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-slate-200/70 bg-white/92 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm= ${className ?? ''}`}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <span className={`h-2.5 w-2.5 rounded-full ${accentClassName}`} />
        <div className="text-base font-semibold text-slate-900">{title}</div>
      </div>
      <div className="text-balance px-5 pt-2 pb-3 text-[15px] leading-7 text-slate-700">{children}</div>
    </section>
  )
}

export function Major({ clientData }: { clientData: ClientData }) {
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
    <div className="space-y-5 text-balance text-slate-900">
      {loading ? (
        <div className="overflow-hidden rounded-3xl p-5">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : error ? (
        <div className="overflow-hidden rounded-3xl p-5">
          <div className="text-base font-semibold">数据加载失败</div>
          <div className="mt-2 text-sm leading-7">{error}</div>
        </div>
      ) : data ? (
        <div className="space-y-5">
          <section className="overflow-hidden rounded-3xl border border-black p-5 bg-blue-950">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl text-white flex items-center gap-4">
                  {clientData['专业名称']}
                  <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                    {clientData['专业代码']} - {clientData['学科门类']} - {clientData['专业类']}
                  </div>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">{data['定义与本质']}</p>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="知识结构" accentClassName="bg-indigo-500">
              {data['知识结构']}
            </DetailSection>
            <DetailSection title="学习方式" accentClassName="bg-cyan-500">
              {data['学习方式']}
            </DetailSection>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="适合人群" accentClassName="bg-emerald-500">
              {data['适合人群']}
            </DetailSection>
            <DetailSection title="常见误解" accentClassName="bg-amber-500">
              {data['常见误解']}
            </DetailSection>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="就业方向" accentClassName="bg-rose-500">
              {data['就业方向']}
            </DetailSection>
            <DetailSection title="竞争与门槛" accentClassName="bg-violet-500">
              {data['竞争与门槛']}
            </DetailSection>
          </div>


          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="校际差异" accentClassName="bg-fuchsia-500">
              {data['校际差异']}
            </DetailSection>
            <DetailSection title="高中准备" accentClassName="bg-orange-500">
              {data['高中准备']}
            </DetailSection>
          </div>

          <DetailSection title="未来发展" accentClassName="bg-slate-500">
            {data['未来发展']}
          </DetailSection>
        </div>
      ) : null}
    </div>
  )
}
