import { type MajorData } from '../../lib/types.ts'
import { Scatter } from '@ant-design/plots'
import { Button, Modal, Popover, Select, Tag } from 'antd'
import {
  ArrowDownOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { max, min } from '@psych/lib'
import { useMemo, useRef, useState } from 'react'

const [rawUMAP, rawPCA] = await Promise.all([
  fetch('/data_umap.json'),
  fetch('/data_pca.json'),
])
const [jsonUMAP, jsonPCA] = await Promise.all([
  rawUMAP.json(),
  rawPCA.json(),
])
const dataUMAP: MajorData[] = jsonUMAP.data
const dataPCA: MajorData[] = jsonPCA.data

const subjects: string[] = [
  '哲学',
  '经济学',
  '法学',
  '教育学',
  '文学',
  '历史学',
  '理学',
  '工学',
  '农学',
  '医学',
  '管理学',
  '艺术学',
]

const configUMAP: {
  all: {
    x: { domain: [number, number] }
    y: { domain: [number, number] }
  }
  subjects: {
    x: { domain: [number, number] }
    y: { domain: [number, number] }
  }[]
} = {
  all: {
    x: {
      domain: [
        +min(dataUMAP.map((item) => item['专业描述向量'][0])).toFixed(2) - 0.1,
        +max(dataUMAP.map((item) => item['专业描述向量'][0])).toFixed(2) + 0.1,
      ],
    },
    y: {
      domain: [
        +min(dataUMAP.map((item) => item['专业描述向量'][1])).toFixed(2) - 0.1,
        +max(dataUMAP.map((item) => item['专业描述向量'][1])).toFixed(2) + 0.1,
      ],
    },
  },
  subjects: subjects.map((subject) => {
    const filteredData = dataUMAP.filter((item) => item['学科门类'] === subject)
    const xValues = filteredData.map((item) => item['专业描述向量'][0])
    const yValues = filteredData.map((item) => item['专业描述向量'][1])
    return {
      x: {
        domain: [
          +(min(xValues) - 0.1).toFixed(2),
          +(max(xValues) + 0.1).toFixed(2),
        ],
      },
      y: {
        domain: [
          +(min(yValues) - 0.1).toFixed(2),
          +(max(yValues) + 0.1).toFixed(2),
        ],
      },
    }
  }),
}
const configPCA: {
  all: {
    x: { domain: [number, number] }
    y: { domain: [number, number] }
  }
  subjects: {
    x: { domain: [number, number] }
    y: { domain: [number, number] }
  }[]
} = {
  all: {
    x: {
      domain: [
        +min(dataPCA.map((item) => item['专业描述向量'][0])).toFixed(2) - 0.1,
        +max(dataPCA.map((item) => item['专业描述向量'][0])).toFixed(2) + 0.1,
      ],
    },
    y: {
      domain: [
        +min(dataPCA.map((item) => item['专业描述向量'][1])).toFixed(2) - 0.1,
        +max(dataPCA.map((item) => item['专业描述向量'][1])).toFixed(2) + 0.1,
      ],
    },
  },
  subjects: subjects.map((subject) => {
    const filteredData = dataPCA.filter((item) => item['学科门类'] === subject)
    const xValues = filteredData.map((item) => item['专业描述向量'][0])
    const yValues = filteredData.map((item) => item['专业描述向量'][1])
    return {
      x: {
        domain: [
          +(min(xValues) - 0.1).toFixed(2),
          +(max(xValues) + 0.1).toFixed(2),
        ],
      },
      y: {
        domain: [
          +(min(yValues) - 0.1).toFixed(2),
          +(max(yValues) + 0.1).toFixed(2),
        ],
      },
    }
  }),
}

export default function App() {
  const [modal, contextHolder] = Modal.useModal()
  const openRef = useRef<boolean>(false)
  const [showLabels, setShowLabels] = useState<boolean>(true)
  const [method, setMethod] = useState<'UMAP' | 'PCA'>('UMAP')
  const data = useMemo(() => {
    return method === 'UMAP' ? dataUMAP : dataPCA
  }, [method])
  const config = useMemo(() => {
    return method === 'UMAP' ? configUMAP : configPCA
  }, [method])
  return (
    <div className='relative w-dvw flex flex-col items-center px-4 md:px-8 lg:px-12 gap-8 pb-8 lg:pb-12'>
      {contextHolder}
      <div className='absolute top-4 left-4 z-10'>
        <Popover
          content={
            <div className='flex flex-col items-center gap-2 font-semibold'>
              <div>
                作者:{' '}
                <a
                  href='https://github.com/LeafYeeXYZ'
                  className='text-blue-500 hover:underline'
                >
                  小叶子
                </a>
              </div>
              <div>
                GitHub:{' '}
                <a
                  href='https://github.com/LeafYeeXYZ/MajorStar'
                  className='text-blue-500 hover:underline'
                >
                  MajorStar
                </a>
              </div>
              <div>
                专业数据来源: 普通高等学校本科专业目录 (2025年)
              </div>
              <div>
                专业描述来源: AI生成, 仅供参考
              </div>
            </div>
          }
          trigger={['hover']}
        >
          <Button
            icon={<InfoCircleOutlined />}
            size='large'
            type='text'
          />
        </Popover>
      </div>
      <div className='absolute top-4 right-4 z-10'>
        <Popover
          content={
            <div className='flex flex-col items-center gap-4 font-semibold'>
              <div className='flex items-center gap-2 justify-start w-full'>
                <div>
                  专业名称标签:
                </div>
                <Select
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
              <div className='flex items-center gap-2 justify-start w-full'>
                <div>
                  向量降维方法:
                </div>
                <Select
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
          }
          trigger={['hover', 'click']}
        >
          <Button
            icon={<SettingOutlined />}
            size='large'
            type='text'
          />
        </Popover>
      </div>
      <div className='mt-20 flex items-center justify-center'>
        <div className='text-4xl font-semibold'>
          专业星云
        </div>
      </div>
      <div className='text-gray-600 text-balance text-center'>
        相似的专业会聚集在一起, 鼠标悬停可查看专业信息, 点击可查看专业介绍
      </div>
      <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mb-8'>
        {subjects.map((subject) => (
          <Button
            key={subject}
            type='text'
            icon={<ArrowDownOutlined />}
            href={`#${subject}`}
          >
            {subject}门类
          </Button>
        ))}
      </div>
      <div className='w-full h-[85dvh] border rounded-lg'>
        <Scatter
          title='所有专业 (可按学科门类筛选)'
          xField='a'
          yField='b'
          colorField='学科门类'
          scale={config.all}
          labels={showLabels
            ? [
              {
                text: '专业名称',
                style: { dy: -20 },
                transform: [{ type: 'overlapHide' }],
              },
            ]
            : undefined}
          tooltip={{
            title: '',
            items: [
              '专业名称',
              '专业代码',
              '学科门类',
              '专业类',
              '专业类代码',
            ],
          }}
          data={data.map((item) => ({
            ...item,
            a: item['专业描述向量'][0],
            b: item['专业描述向量'][1],
          }))}
          onEvent={(_, e) => {
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
          }}
        />
      </div>
      {subjects.map((subject, index) => (
        <div
          key={subject}
          id={subject}
          className='w-full h-[85dvh] border rounded-lg'
        >
          <Scatter
            title={`${subject}门类 (可按专业类筛选)`}
            xField='a'
            yField='b'
            colorField='专业类'
            scale={config.subjects[index]}
            labels={showLabels
              ? [
                {
                  text: '专业名称',
                  style: { dy: -20 },
                  transform: [{ type: 'overlapHide' }],
                },
              ]
              : undefined}
            tooltip={{
              title: '',
              items: [
                '专业名称',
                '专业代码',
                '学科门类',
                '专业类',
                '专业类代码',
              ],
            }}
            data={data
              .filter((item) => item['学科门类'] === subject)
              .map((item) => ({
                ...item,
                a: item['专业描述向量'][0],
                b: item['专业描述向量'][1],
              }))}
            onEvent={(_, e) => {
              if (e.type === 'click' && e.data && e.data.data) {
                const data = e.data.data as MajorData
                if (openRef.current) {
                  return
                }
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
            }}
          />
        </div>
      ))}
    </div>
  )
}
