import type { ClientData } from '../data/types.ts'
// import Scatter from '@ant-design/plots/es/components/scatter'
import { Modal, type TourProps, Skeleton } from 'antd'
import { QuestionCircleOutlined, ReloadOutlined, DotChartOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useData, SUBJECTS, type Subject } from './hooks/useData.tsx'
import { Info } from './components/Info.tsx'
import { Major } from './components/Major.tsx'
import { Button } from './components/Button.tsx'
import { Tour } from './components/Tour.tsx'
import { Select } from './components/Select.tsx'

function getIsTourPlayed(): boolean {
  const isPlayed = localStorage.getItem('isTourPlayed')
  return isPlayed === 'true'
}

function setIsTourPlayed(isPlayed: boolean): void {
  localStorage.setItem('isTourPlayed', String(isPlayed))
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export default function App() {
  const { scatterConfig, scatterData, loading: dataLoading, error: dataError } = useData()

  const [modal, contextHolder] = Modal.useModal()
  const openRef = useRef<boolean>(false)

  const [showLabels, setShowLabels] = useState<'显示' | '隐藏'>('显示')
  const [catagory, setCategory] = useState<string>('全部专业')
  const [key, setKey] = useState<string>(crypto.randomUUID())

  const [scatterLoading, setScatterLoading] = useState<boolean>(true)
  const [scatterError, setScatterError] = useState<string | null>(null)
  const [scatter, setScatter] = useState<React.ReactNode | null>(null)
  useEffect(() => {
    if (dataLoading || dataError) return
    setScatterLoading(true)
    setScatterError(null)
    import('@ant-design/plots/es/components/scatter')
      .then(({ default: Scatter }) => {
        setScatter(
          <Scatter
            key={key}
            className="pt-12!"
            xField="a"
            yField="b"
            colorField={catagory === '全部专业' ? '学科门类' : '专业类'}
            shapeField="point"
            slider={{
              x: {
                labelFormatter: (d: number) => d.toFixed(2),
                showLabel: false,
                style: {
                  selectionFill: '#eff6ff',
                  selectionFillOpacity: 1,
                  selectionStroke: '#162456',
                  handleIconRadius: 0,
                  handleIconFill: '#eff6ff',
                  handleIconStroke: '#162456',
                  handleIconStrokeOpacity: 1,
                },
              },
              y: {
                labelFormatter: (d: number) => d.toFixed(2),
                showLabel: false,
                style: {
                  selectionFill: '#eff6ff',
                  selectionFillOpacity: 1,
                  selectionStroke: '#162456',
                  handleIconRadius: 0,
                  handleIconFill: '#eff6ff',
                  handleIconStroke: '#162456',
                  handleIconStrokeOpacity: 1,
                },
              },
            }}
            scale={
              catagory === '全部专业'
                ? scatterConfig?.all
                : scatterConfig?.subjects[SUBJECTS.indexOf(catagory as Subject)]
            }
            style={{ stroke: 'rgba(22,36,86,0.9)' }}
            label={
              showLabels == '显示'
                ? [
                    {
                      text: '专业名称',
                      style: { dy: -20 },
                      transform: [{ type: 'overlapHide' }],
                    },
                  ]
                : []
            }
            tooltip={{
              title: '专业名称',
              items: ['专业代码', '学科门类', '专业类', '定义与本质'],
            }}
            data={
              catagory === '全部专业'
                ? scatterData?.all
                : scatterData?.subjects[SUBJECTS.indexOf(catagory as Subject)]
            }
            onEvent={(_, e) => {
              if (e.type === 'click' && e.data && e.data.data) {
                const data = e.data.data as ClientData
                if (openRef.current) return
                modal.info({
                  centered: true,
                  icon: null,
                  title: null,
                  content: <Major clientData={data} />,
                  width: 920,
                  okText: '关闭',
                  okType: 'default',
                  onOk: () => {
                    openRef.current = false
                  },
                  onCancel: () => {
                    openRef.current = false
                  },
                  afterClose: () => {
                    openRef.current = false
                  },
                })
                openRef.current = true
              }
            }}
            interaction={{
              // brushFilter: true, // 和滑动条冲突
              tooltip: {
                render: (
                  _event: unknown,
                  tooltipData: {
                    title?: string
                    items?: Array<{
                      color?: string
                      name?: string
                      value?: string | number | null
                    }>
                  },
                ) => {
                  const { title, items } = tooltipData as {
                    title?: string
                    items?: Array<{
                      color?: string
                      name?: string
                      value?: string | number | null
                    }>
                  }
                  const safeTitle = escapeHtml(title ?? '')
                  const safeItems = (items ?? [])
                    .map((item) => {
                      const name = escapeHtml(item.name ?? '')
                      const value = escapeHtml(String(item.value ?? ''))
                      const color = item.color ?? '#1677ff'
                      const showValue = value === '' ? '-' : value

                      if (item.name === '定义与本质') {
                        return `
                        <div class="mt-3 pt-3 border-t border-blue-950/20">
                          <div class="text-[13px] leading-[1.7] text-blue-950 line-clamp-4">${showValue}</div>
                        </div>
                      `
                      }

                      return `
                      <div class="flex items-center justify-between gap-4 py-1.5">
                        <div class="flex items-center gap-2 min-w-0">
                          <span class="w-2 h-2 rounded-full shrink-0" style="background: ${color};"></span>
                          <span class="text-xs text-blue-950/70 shrink-0">${name}</span>
                        </div>
                        <div class="text-xs font-semibold text-blue-950 text-right truncate">${showValue}</div>
                      </div>
                    `
                    })
                    .join('')

                  return `
                  <div class="min-w-70 max-w-105 px-3 py-2.5 bg-blue-50 border border-blue-950 text-blue-950 shadow-md">
                    <div class="flex items-start justify-between gap-3 mb-3">
                      <div class="min-w-0">
                        <div class="text-[15px] font-bold leading-[1.4]">${safeTitle}</div>
                        <div class="mt-1 text-xs text-blue-950/60">点击可查看详细描述</div>
                      </div>
                    </div>
                    ${safeItems}
                  </div>
                `
                },
              },
            }}
          />,
        )
      })
      .catch((err) => {
        setScatterError(err instanceof Error ? err.message : '专业星云加载失败')
      })
      .finally(() => {
        setScatterLoading(false)
      })
  }, [dataLoading, dataError, scatterConfig, scatterData, catagory, showLabels, key, modal])

  const loading = dataLoading || scatterLoading
  const error = dataError || scatterError

  const infoRef = useRef<HTMLDivElement>(null)
  const helpRef = useRef<HTMLDivElement>(null)
  const catagoryRef = useRef<HTMLDivElement>(null)
  const showLabelsRef = useRef<HTMLDivElement>(null)
  const reloadRef = useRef<HTMLDivElement>(null)
  const steps: TourProps['steps'] = useMemo(() => {
    return [
      {
        title: '使用说明',
        description: '欢迎使用专业星云! 这个小教程将帮助你了解如何使用这个应用.',
      },
      {
        title: '专业星云',
        description:
          '图中的每个点都代表一个专业, 共845个 (2026年普通高等学校本科专业目录中的所有专业).',
      },
      {
        title: '专业相似度',
        description: '在图中, 专业之间的距离表示它们的相似度. 距离越近, 相似度越高.',
      },
      {
        title: '专业分类',
        description:
          '你可以在这里选择专业星云中要显示的指定的学科门类. 默认显示全部12个门类的专业.',
        target: () => catagoryRef.current!,
      },
      {
        title: '专业名称标签',
        description: '你可以在这里选择是否在专业星云中显示专业名称标签.',
        target: () => showLabelsRef.current!,
      },
      {
        title: '专业基本信息',
        description:
          '把鼠标悬停在专业点上, 可以查看该专业的简介、专业代码、学科门类、专业类等基本信息.',
      },
      {
        title: '专业详细描述',
        description: '点击专业点, 可以加载该专业的详细描述 (加载时间取决于网络状况).',
      },
      {
        title: '关于',
        description: '点击左上角的"信息"按钮, 查看作者、开源地址、数据来源等信息.',
        target: () => infoRef.current!,
      },
      {
        title: '帮助',
        description: '点击左上角的"帮助"按钮, 可以重新打开这个小教程.',
        target: () => helpRef.current!,
      },
      {
        title: '重置',
        description:
          '在星云中框选可以显示指定区域的内容; 双击鼠标, 或点击左上角的"重置"按钮, 可以重置视图.',
        target: () => reloadRef.current!,
      },
      {
        title: '专业星云',
        description: '希望你喜欢这个小应用! 如果有任何问题或建议, 欢迎在 GitHub 上提交 issue.',
      },
    ]
  }, [])
  const [tourOpen, setTourOpen] = useState<boolean>(false)
  useEffect(() => {
    if (loading || error) return
    if (!getIsTourPlayed()) {
      setTourOpen(true)
    }
  }, [loading, error])

  return (
    <div className="relative w-dvw h-dvh overflow-hidden">
      {contextHolder}
      <Tour
        open={tourOpen}
        steps={steps}
        onClose={() => {
          setTourOpen(false)
        }}
        onFinish={() => {
          setTourOpen(false)
          setIsTourPlayed(true)
        }}
      />
      <header className="absolute top-0 left-0 w-full h-12 flex flex-row items-center z-10 px-4 pt-2 justify-between gap-4">
        <div className="flex items-center font-semibold gap-3">
          <div className="mr-0 lg:mr-2 text-nowrap text-2xl text-blue-950">专业星云</div>
          <div ref={infoRef}>
            <Info />
          </div>
          <div ref={helpRef}>
            <Button
              onClick={() => {
                setTourOpen(true)
              }}
              disabled={loading || !!error}
            >
              <QuestionCircleOutlined className="m-0!" />
            </Button>
          </div>
          <div ref={reloadRef}>
            <Button
              onClick={() => {
                setKey(crypto.randomUUID())
              }}
              disabled={loading || !!error}
            >
              <ReloadOutlined className="m-0!" />
            </Button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-4 font-semibold flex-nowrap text-sm overflow-auto">
          <div className="flex items-center w-max" ref={catagoryRef}>
            <Select
              className="w-26!"
              value={catagory}
              onChange={(value) => {
                setCategory(value)
              }}
              options={[
                { label: '全部专业', value: '全部专业' },
                ...SUBJECTS.map((subject) => ({
                  label: `仅${subject}`,
                  value: subject,
                })),
              ]}
              disabled={loading || !!error}
            />
          </div>
          <div className="flex items-center w-max" ref={showLabelsRef}>
            <Select
              className="w-26!"
              value={showLabels}
              onChange={(value) => {
                setShowLabels(value)
              }}
              options={[
                { label: '显示标签', value: '显示' },
                { label: '隐藏标签', value: '隐藏' },
              ]}
              disabled={loading || !!error}
            />
          </div>
        </div>
      </header>
      <section className="w-full h-full">
        {loading ? (
          <div className="overflow-hidden w-full h-full p-5 flex items-center justify-center flex-col gap-4">
            <Skeleton.Node active>
              <DotChartOutlined className="text-5xl text-blue-950" />
            </Skeleton.Node>
            <div className="font-semibold text-blue-950">加载中</div>
          </div>
        ) : error ? (
          <div className="overflow-hidden w-full h-full p-5 flex items-center justify-center">
            <div className="text-blue-950 font-semibold">加载失败: {error}</div>
          </div>
        ) : (
          <>{scatter}</>
        )}
      </section>
    </div>
  )
}
