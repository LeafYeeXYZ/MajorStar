import { DisconnectOutlined } from '@ant-design/icons'
import { Skeleton } from 'antd'

type LoadingProps = {
  message?: string
  icon: React.ReactNode
}

export function LoadingScreen({ message = '加载中', icon }: LoadingProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden p-5">
      <Skeleton.Node active>{icon}</Skeleton.Node>
      <div className="font-semibold text-blue-950">{message}</div>
    </div>
  )
}

export function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden p-5">
      <div>
        <DisconnectOutlined className="text-5xl text-blue-950" />
      </div>
      <div className="font-semibold text-blue-950">加载失败: {message}</div>
    </div>
  )
}
