import { type MajorData } from '../../lib/types.ts'
import { Scatter, type ScatterConfig } from '@ant-design/plots'
import { Button, Modal, Popover, Select, Tag, Tour, type TourProps } from 'antd'
import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { config, data as d, subjects } from './data.ts'

function getIsTourPlayed(): boolean {
  const isPlayed = localStorage.getItem('isTourPlayed')
  return isPlayed === 'true'
}
function setIsTourPlayed(isPlayed: boolean): void {
  localStorage.setItem('isTourPlayed', String(isPlayed))
}

export default function App() {
  const [modal, contextHolder] = Modal.useModal()
  const openRef = useRef<boolean>(false)

  const [showLabels, setShowLabels] = useState<boolean>(true)
  const [method, setMethod] = useState<'UMAP' | 'PCA'>('UMAP')
  const [catagory, setCategory] = useState<string>('全部专业')

  const infoRef = useRef<HTMLDivElement>(null)
  const helpRef = useRef<HTMLDivElement>(null)
  const catagoryRef = useRef<HTMLDivElement>(null)
  const showLabelsRef = useRef<HTMLDivElement>(null)
  const methodRef = useRef<HTMLDivElement>(null)
  const steps: TourProps['steps'] = useMemo(() => {
    return [
      {
        title: '使用说明',
        description:
          '欢迎使用专业星云! 这个小教程将帮助你了解如何使用这个应用.',
      },
      {
        title: '专业星云',
        description:
          '图中的每个点都代表一个专业, 共845个 (包含2025年普通高等学校本科专业目录中的所有专业).',
      },
      {
        title: '专业相似度',
        description:
          '在图中, 专业之间的距离表示它们的相似度. 距离越近, 相似度越高.',
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
        title: '向量降维方法',
        description:
          '你可以在这里选择使用的向量降维方法 (影响专业星云的分布形状). 默认使用UMAP, 也可以选择PCA.',
        target: () => methodRef.current!,
      },
      {
        title: '专业基本信息',
        description:
          '把鼠标悬停在专业点上, 可以查看该专业的专业代码、学科门类、专业类等基本信息.',
      },
      {
        title: '专业详细描述',
        description: '点击专业点, 可以查看该专业的详细描述.',
      },
      {
        title: '关于',
        description:
          '点击左上角的"信息"按钮, 查看作者、开源地址、数据来源等信息.',
        target: () => infoRef.current!,
      },
      {
        title: '帮助',
        description: '点击左上角的"帮助"按钮, 可以重新打开这个小教程.',
        target: () => helpRef.current!,
      },
      {
        title: '专业星云',
        description:
          '希望你喜欢这个小应用! 如果有任何问题或建议, 欢迎在GitHub上提交issue.',
      },
    ]
  }, [])
  const [tourOpen, setTourOpen] = useState<boolean>(false)
  useEffect(() => {
    if (!getIsTourPlayed()) {
      setTourOpen(true)
    }
  }, [])

  const colorField: ScatterConfig['colorField'] = useMemo(() => {
    return catagory === '全部专业' ? '学科门类' : '专业类'
  }, [catagory])

  const scale: ScatterConfig['scale'] = useMemo(() => {
    if (catagory === '全部专业') {
      return method === 'UMAP' ? config.umap.all : config.pca.all
    }
    return method === 'UMAP'
      ? config.umap.subjects[subjects.indexOf(catagory)]
      : config.pca.subjects[subjects.indexOf(catagory)]
  }, [method, catagory])

  const label: ScatterConfig['label'] = useMemo(() => {
    return showLabels
      ? [
        {
          text: '专业名称',
          style: { dy: -20 },
          transform: [{ type: 'overlapHide' }],
        },
      ]
      : undefined
  }, [showLabels])

  const data: ScatterConfig['data'] = useMemo(() => {
    if (catagory === '全部专业') {
      return method === 'UMAP' ? d.umap.all : d.pca.all
    }
    return method === 'UMAP'
      ? d.umap.subjects[subjects.indexOf(catagory)]
      : d.pca.subjects[subjects.indexOf(catagory)]
  }, [method, catagory])

  const onEvent: ScatterConfig['onEvent'] = useMemo(() => {
    return (_, e) => {
      if (e.type === 'click' && e.data && e.data.data) {
        const data = e.data.data as MajorData
        if (openRef.current) return
        modal.info({
          title: (
            <div className='font-semibold flex items-center gap-2'>
              <div>
                {data['专业名称']}
              </div>
              <div>
                <Tag color='blue' className='!m-0'>
                  {data['专业代码']}
                </Tag>
              </div>
              <div>
                <Tag color='blue' className='!m-0'>
                  {data['学科门类']}
                </Tag>
              </div>
              <div>
                <Tag color='blue' className='!m-0'>
                  {data['专业类']}
                </Tag>
              </div>
            </div>
          ),
          content: (
            <div className='text-balance text-gray-800'>
              {data['专业描述文本']}
            </div>
          ),
          width: 600,
          okText: '关闭',
          okType: 'default',
          onOk: () => {
            openRef.current = false
          },
        })
        openRef.current = true
      }
    }
  }, [])

  const tooltip: ScatterConfig['tooltip'] = useMemo(() => {
    return {
      title: '',
      items: [
        '专业名称',
        '专业代码',
        '学科门类',
        '专业类',
        '专业类代码',
      ],
    }
  }, [])

  return (
    <div className='relative w-dvw h-dvh overflow-hidden'>
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
      <header className='absolute top-0 left-0 w-full h-12 flex flex-row items-center z-10 px-4 pt-2 justify-between gap-4'>
        <div className='flex items-center font-semibold gap-2'>
          <div className='mr-0 lg:mr-2 text-nowrap text-2xl'>
            专业星云
          </div>
          <div ref={infoRef}>
            <Info />
          </div>
          <div ref={helpRef}>
            <Help setTourOpen={setTourOpen} />
          </div>
        </div>
        <div className='flex flex-row items-center gap-4 font-semibold flex-nowrap text-sm overflow-auto'>
          <div
            className='flex items-center gap-2 justify-start w-max'
            ref={catagoryRef}
          >
            <div className='text-nowrap'>
              学科门类:
            </div>
            <Select
              className='!w-26'
              value={catagory}
              onChange={(value) => {
                setCategory(value)
              }}
              options={[
                { label: '全部专业', value: '全部专业' },
                ...subjects.map((subject) => ({
                  label: subject,
                  value: subject,
                })),
              ]}
            />
          </div>
          <div
            className='flex items-center gap-2 justify-start w-max'
            ref={showLabelsRef}
          >
            <div className='text-nowrap'>
              专业名称标签:
            </div>
            <Select
              className='!w-18'
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
          <div
            className='flex items-center gap-2 justify-start w-max'
            ref={methodRef}
          >
            <div className='text-nowrap'>
              向量降维方法:
            </div>
            <Select
              className='!w-22'
              value={method}
              onChange={(value) => {
                setMethod(value as 'UMAP' | 'PCA')
              }}
              options={[
                { label: 'UMAP', value: 'UMAP' },
                { label: 'PCA', value: 'PCA' },
              ]}
            />
          </div>
        </div>
      </header>
      <section className='w-full h-full'>
        <Scatter
          className='!pt-12'
          xField='a'
          yField='b'
          colorField={colorField}
          shapeField='point'
          scale={scale}
          style={{ stroke: 'rgba(50,0,0,0.7)' }}
          label={label}
          tooltip={tooltip}
          data={data}
          onEvent={onEvent}
        />
      </section>
    </div>
  )
}

function Help({ setTourOpen }: { setTourOpen: (open: boolean) => void }) {
  return (
    <Button
      icon={<QuestionCircleOutlined />}
      onClick={() => {
        setTourOpen(true)
      }}
    />
  )
}

function Info() {
  return (
    <Popover
      content={
        <div className='flex flex-col items-center gap-[0.3rem] font-semibold'>
          <div>
            开源地址(GitHub):{' '}
            <a
              href='https://github.com/LeafYeeXYZ/MajorStar'
              className='text-blue-500 hover:underline'
              target='_blank'
              rel='noopener noreferrer'
            >
              LeafYeeXYZ/MajorStar
            </a>
          </div>
          <div>
            专业数据来源: 普通高等学校本科专业目录 (2025年)
          </div>
          <div>
            专业描述来源: AI生成, 仅供参考
          </div>
          <div>
            作者:{' '}
            <a
              href='https://github.com/LeafYeeXYZ'
              className='text-blue-500 hover:underline'
              target='_blank'
              rel='noopener noreferrer'
            >
              小叶子
            </a>
          </div>
        </div>
      }
      trigger={['hover', 'click']}
    >
      <Button icon={<InfoCircleOutlined />} />
    </Popover>
  )
}
