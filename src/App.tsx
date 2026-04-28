import type { ClientData } from '../data/types.ts'
import { Scatter, type ScatterConfig } from '@ant-design/plots'
import { Button, Modal, Select, Tour, type TourProps } from 'antd'
import { QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CONFIG, DATA, SUBJECTS } from './data.ts'
import { Info } from './components/Info.tsx'
import { Major } from './components/Major.tsx'

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
  const [modal, contextHolder] = Modal.useModal()
  const openRef = useRef<boolean>(false)

  const [showLabels, setShowLabels] = useState<boolean>(true)
  const [catagory, setCategory] = useState<string>('全部专业')
  const [key, setKey] = useState<string>(crypto.randomUUID())

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
    if (!getIsTourPlayed()) {
      setTourOpen(true)
    }
  }, [])

  const scale: ScatterConfig['scale'] = useMemo(() => {
    if (catagory === '全部专业') {
      return CONFIG.all
    }
    return CONFIG.subjects[SUBJECTS.indexOf(catagory)]
  }, [catagory])
  const label: ScatterConfig['label'] = useMemo(() => {
    return showLabels
      ? [
          {
            text: '专业名称',
            style: { dy: -20 },
            transform: [{ type: 'overlapHide' }],
          },
        ]
      : []
  }, [showLabels])
  const data: ScatterConfig['data'] = useMemo(() => {
    if (catagory === '全部专业') {
      return DATA.all
    }
    return DATA.subjects[SUBJECTS.indexOf(catagory)]
  }, [catagory])

  const onEvent: ScatterConfig['onEvent'] = (_, e) => {
    if (e.type === 'click' && e.data && e.data.data) {
      const data = e.data.data as ClientData
      if (openRef.current) return
      modal.info({
        className:
          'major-detail-modal overflow-hidden rounded-[28px] border border-slate-200/80 bg-transparent shadow-[0_30px_90px_rgba(15,23,42,0.22)] ' +
          '[&_.ant-modal-content]:overflow-hidden [&_.ant-modal-content]:rounded-[28px] ' +
          '[&_.ant-modal-content]:border [&_.ant-modal-content]:border-slate-200/80 ' +
          '[&_.ant-modal-content]:bg-[linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(255,255,255,0.96)_100%)] ' +
          '[&_.ant-modal-header]:mb-0 [&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-slate-200/80 ' +
          '[&_.ant-modal-header]:bg-[linear-gradient(135deg,rgba(241,245,249,0.94),rgba(255,255,255,0.94))] ' +
          '[&_.ant-modal-body]:pt-0 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-slate-200/80 ' +
          '[&_.ant-modal-footer]:bg-[rgba(248,250,252,0.78)]',
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
  }

  const tooltip: ScatterConfig['tooltip'] = {
    title: '专业名称',
    items: ['专业代码', '学科门类', '专业类', '定义与本质'],
  }

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
        <div className="flex items-center font-semibold gap-2">
          <div className="mr-0 lg:mr-2 text-nowrap text-2xl">专业星云</div>
          <div ref={infoRef}>
            <Info />
          </div>
          <div ref={helpRef}>
            <Button
              icon={<QuestionCircleOutlined />}
              onClick={() => {
                setTourOpen(true)
              }}
            />
          </div>
          <div ref={reloadRef}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setKey(crypto.randomUUID())
              }}
            />
          </div>
        </div>
        <div className="flex flex-row items-center gap-4 font-semibold flex-nowrap text-sm overflow-auto">
          <div className="flex items-center gap-2 justify-start w-max" ref={catagoryRef}>
            <div className="text-nowrap">学科门类:</div>
            <Select
              className="w-26!"
              value={catagory}
              onChange={(value) => {
                setCategory(value)
              }}
              options={[
                { label: '全部专业', value: '全部专业' },
                ...SUBJECTS.map((subject) => ({
                  label: subject,
                  value: subject,
                })),
              ]}
            />
          </div>
          <div className="flex items-center gap-2 justify-start w-max" ref={showLabelsRef}>
            <div className="text-nowrap">专业名称标签:</div>
            <Select
              className="w-18!"
              value={showLabels}
              onChange={(value) => {
                setShowLabels(value)
              }}
              options={[
                { label: '显示', value: true },
                { label: '隐藏', value: false },
              ]}
            />
          </div>
        </div>
      </header>
      <section className="w-full h-full">
        <Scatter
          key={key}
          className="pt-12!"
          xField="a"
          yField="b"
          colorField={catagory === '全部专业' ? '学科门类' : '专业类'}
          shapeField="point"
          scale={scale}
          style={{ stroke: 'rgba(50,0,0,0.7)' }}
          label={label}
          tooltip={tooltip}
          data={data}
          onEvent={onEvent}
          interaction={{
            brushFilter: true,
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
                        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(5, 5, 5, 0.08);">
                          <div style="font-size: 12px; line-height: 1.4; color: rgba(0, 0, 0, 0.56); margin-bottom: 8px;">简介</div>
                          <div style="font-size: 13px; line-height: 1.7; color: rgba(0, 0, 0, 0.88); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden; white-space: normal;">${showValue}</div>
                        </div>
                      `
                    }

                    return `
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 6px 0;">
                        <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                          <span style="width: 8px; height: 8px; border-radius: 999px; background: ${color}; flex: 0 0 auto;"></span>
                          <span style="font-size: 12px; color: rgba(0, 0, 0, 0.56); flex: 0 0 auto;">${name}</span>
                        </div>
                        <div style="font-size: 12px; font-weight: 600; color: rgba(0, 0, 0, 0.88); text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${showValue}</div>
                      </div>
                    `
                  })
                  .join('')

                return `
                  <div style="min-width: 280px; max-width: 420px; padding: 14px 16px; border-radius: 14px; background: rgba(255, 255, 255, 0.98); box-shadow: 0 12px 32px rgba(15, 23, 42, 0.16); border: 1px solid rgba(15, 23, 42, 0.08);">
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
                      <div style="min-width: 0;">
                        <div style="font-size: 15px; font-weight: 700; line-height: 1.4; color: rgba(0, 0, 0, 0.92);">${safeTitle}</div>
                        <div style="margin-top: 4px; font-size: 12px; color: rgba(0, 0, 0, 0.45);">点击可查看详细描述</div>
                      </div>
                    </div>
                    ${safeItems}
                  </div>
                `
              },
            },
          }}
        />
      </section>
    </div>
  )
}
