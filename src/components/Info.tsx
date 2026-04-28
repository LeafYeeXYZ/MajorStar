import { Button, Popover } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

export function Info() {
  return (
    <Popover
      content={
        <div className="flex flex-col items-center gap-[0.3rem] font-semibold">
          <div>
            开源地址(GitHub):{' '}
            <a
              href="https://github.com/LeafYeeXYZ/MajorStar"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              LeafYeeXYZ/MajorStar
            </a>
          </div>
          <div>专业数据来源: 普通高等学校本科专业目录 (2026年)</div>
          <div>专业描述来源: DeepSeek-V4-Pro生成, 仅供参考</div>
        </div>
      }
      trigger={['hover', 'click']}
    >
      <Button icon={<InfoCircleOutlined />} />
    </Popover>
  )
}
