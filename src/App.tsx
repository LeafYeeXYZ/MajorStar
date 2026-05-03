import type { ClientData } from '../data/types.ts'
import { Modal, type TourProps } from 'antd'
import { QuestionCircleOutlined, DotChartOutlined, GiftOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useData, SUBJECTS } from './hooks/useData.tsx'
import { Info } from './components/Info.tsx'
import { Major } from './components/Major.tsx'
import { Button } from './components/Button.tsx'
import { Tour } from './components/Tour.tsx'
import { Select } from './components/Select.tsx'
import { Search } from './components/Search.tsx'
import { LoadingScreen, ErrorScreen } from './components/Loading.tsx'

const IS_TOUR_PLAYED_KEY = 'isTourPlayed'

export default function App() {
  const { scatterConfig, scatterData, loading: dataLoading, error: dataError } = useData()
  const [catagory, setCategory] = useState<string>('全部专业')

  const [modal, contextHolder] = Modal.useModal()
  const openRef = useRef<boolean>(false)
  const openModal = (data: ClientData) => {
    if (openRef.current) return
    modal.info({
      centered: true,
      icon: null,
      title: null,
      content: (
        <Major
          targetData={data}
          allData={scatterData?.all || []}
          openModal={(data) => {
            const closeBtn = document.querySelector(
              '.ant-modal-confirm-btns .ant-btn',
            ) as HTMLButtonElement | null
            if (closeBtn) {
              closeBtn.click()
            }
            openModal(data)
          }}
        />
      ),
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

  const [scatterLoading, setScatterLoading] = useState<boolean>(true)
  const [scatterError, setScatterError] = useState<string | null>(null)
  const [scatter, setScatter] = useState<React.ReactNode | null>(null)
  useEffect(() => {
    setScatterLoading(true)
    setScatterError(null)
    import('./components/Scatter.tsx')
      .then(({ Scatter }) => {
        if (dataLoading || dataError) return
        setScatter(
          <Scatter
            catagory={catagory}
            scatterData={scatterData}
            scatterConfig={scatterConfig}
            openModal={openModal}
          />,
        )
        setScatterLoading(false)
      })
      .catch((err) => {
        setScatterError(err instanceof Error ? err.message : '专业星云加载失败')
        setScatterLoading(false)
      })
  }, [dataLoading, dataError, scatterConfig, scatterData, catagory, modal])

  const loading = dataLoading || scatterLoading
  const error = dataError || scatterError

  const infoRef = useRef<HTMLDivElement>(null)
  const helpRef = useRef<HTMLDivElement>(null)
  const catagoryRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const randomRef = useRef<HTMLDivElement>(null)
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
        description:
          '在图中, 专业之间的距离表示它们的相似度. 距离越近, 相似度越高. 你可以用鼠标拖动星云左侧和底部的滑块来放大查看指定区域的内容.',
      },
      {
        title: '专业分类',
        description:
          '你可以在这里选择专业星云中要显示的指定的学科门类. 默认显示全部12个门类的专业.',
        target: () => catagoryRef.current!,
      },
      {
        title: '搜索专业',
        description: '你可以在这里搜索专业名称或专业代码, 点击搜索结果可以查看该专业的详细介绍.',
        target: () => searchRef.current!,
      },
      {
        title: '专业基本信息',
        description:
          '把鼠标悬停在专业点上, 可以查看该专业的简介、专业代码、学科门类、专业类等基本信息.',
      },
      {
        title: '专业详细描述',
        description: '点击专业点, 可以加载该专业的详细描述.',
      },
      {
        title: '关于',
        description: '点击左上角的"信息"按钮, 查看开源地址等信息.',
        target: () => infoRef.current!,
      },
      {
        title: '帮助',
        description: '点击左上角的"帮助"按钮, 可以重新打开这个小教程.',
        target: () => helpRef.current!,
      },
      {
        title: '随机专业',
        description: '点击左上角的"礼物盒"按钮, 可以随机打开一个专业的详细介绍.',
        target: () => randomRef.current!,
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
    if (localStorage.getItem(IS_TOUR_PLAYED_KEY) !== 'true') {
      localStorage.setItem(IS_TOUR_PLAYED_KEY, 'true')
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
        }}
      />
      <header className="absolute top-0 left-0 w-full h-12 flex flex-row items-center z-10 pl-4 pr-3 pt-2 justify-between gap-4">
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
              className="h-9 w-9 flex items-center justify-center"
            >
              <QuestionCircleOutlined className="m-0!" />
            </Button>
          </div>
          <div ref={randomRef}>
            <Button
              onClick={() => {
                const allData = scatterData!.all
                const randomIndex = Math.floor(Math.random() * allData.length)
                const randomData = allData[randomIndex]
                openModal(randomData)
              }}
              disabled={loading || !!error}
              className="h-9 w-9 flex items-center justify-center"
            >
              <GiftOutlined className="m-0!" />
            </Button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-3 font-semibold flex-nowrap text-sm overflow-auto">
          <div className="flex items-center w-max" ref={catagoryRef}>
            <Select
              className="w-26! h-9!"
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
          <div ref={searchRef}>
            <Search
              data={scatterData?.all ?? []}
              onClick={(data) => openModal(data)}
              disabled={loading || !!error}
            />
          </div>
        </div>
      </header>
      <section className="w-full h-full">
        {loading ? (
          <LoadingScreen icon={<DotChartOutlined className="text-5xl text-blue-950" />} />
        ) : error ? (
          <ErrorScreen message={error} />
        ) : (
          <>{scatter}</>
        )}
      </section>
    </div>
  )
}
