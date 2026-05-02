import { Popover } from './Popover.tsx'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Button } from './Button.tsx'

export function Info() {
  return (
    <Popover
      content={
        <div className="flex flex-col items-start gap-[0.3rem] font-semibold text-[0.8rem] px-3 py-2">
          <div>
            GitHub开源地址:{' '}
            <a
              href="https://github.com/LeafYeeXYZ/MajorStar"
              className="text-blue-600 hover:underline"
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
    >
      <Button className="h-9 w-9 flex items-center justify-center">
        <InfoCircleOutlined className="m-0!" />
      </Button>
    </Popover>
  )
}
