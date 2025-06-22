import { type MajorData } from '../../lib/types.ts'
import { Scatter } from '@ant-design/plots'
import { Button, Modal, Tag } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { max, min } from '@psych/lib'
import { useRef } from 'react'

const raw = await fetch('/data.json')
const { data }: { data: MajorData[] } = await raw.json()
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
const configs: {
  x: { domain: [number, number] }
  y: { domain: [number, number] }
}[] = subjects.map((subject) => {
  const filteredData = data.filter((item) => item['学科门类'] === subject)
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
})

export default function App() {
  const [modal, contextHolder] = Modal.useModal()
  const openRef = useRef<boolean>(false)
  return (
    <div className='w-dvw flex flex-col items-center px-4 md:px-8 lg:px-12 gap-8'>
      {contextHolder}
      <div className='text-4xl font-semibold mt-20'>
        专业星云
      </div>
      <div className='mb-10 text-gray-600'>
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
      <div className='w-full h-[90dvh] border rounded-lg'>
        <Scatter
          title='所有专业 (可按学科门类筛选)'
          xField='a'
          yField='b'
          colorField='学科门类'
          scale={{
            x: { domain: [-1.8, 2.7] },
            y: { domain: [-2.2, 2.1] },
          }}
          labels={[
            {
              text: '专业名称',
              style: { dy: -20 },
              transform: [{ type: 'overlapHide' }],
            },
          ]}
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
            if (e.type === 'click' && e.data) {
              const data = e.data.data as MajorData
              if (openRef.current) return
              openRef.current = true
              modal.info({
                // title: `${data['专业名称']} (${data['专业代码']}) - ${data['学科门类']}${data['专业类']}`,
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
            }
          }}
        />
      </div>
      {subjects.map((subject, index) => (
        <div
          key={subject}
          id={subject}
          className='w-full h-[90dvh] border rounded-lg'
        >
          <Scatter
            title={`${subject}门类 (可按专业类筛选)`}
            xField='a'
            yField='b'
            colorField='专业类'
            scale={configs[index]}
            labels={[
              {
                text: '专业名称',
                style: { dy: -20 },
                transform: [{ type: 'overlapHide' }],
              },
            ]}
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
          />
        </div>
      ))}
      <div className='mb-8 text-sm text-gray-600 flex items-center gap-2'>
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
          |
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
          |
        </div>
        <div>
          专业数据来源: 普通高等学校本科专业目录 (2025年)
        </div>
        <div>
          |
        </div>
        <div>
          专业描述来源: AI生成
        </div>
      </div>
    </div>
  )
}
