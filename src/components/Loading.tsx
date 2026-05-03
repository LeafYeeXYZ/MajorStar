import { Skeleton } from 'antd'
import { DisconnectOutlined } from '@ant-design/icons'

type LoadingProps = {
  message?: string
  icon: React.ReactNode
}

export function LoadingScreen({ message = '加载中', icon }: LoadingProps) {
  return (
    <div className="overflow-hidden w-full h-full p-5 flex items-center justify-center flex-col gap-4">
      <Skeleton.Node active>{icon}</Skeleton.Node>
      <div className="font-semibold text-blue-950">{message}</div>
    </div>
  )
}

export function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="overflow-hidden w-full h-full p-5 flex items-center justify-center flex-col gap-4">
      <div>
        <DisconnectOutlined className="text-5xl text-blue-950" />
      </div>
      <div className="font-semibold text-blue-950">加载失败: {message}</div>
    </div>
  )
}
