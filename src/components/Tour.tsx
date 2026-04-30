import { Tour as AntTour, type TourProps as AntTourProps, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

export type TourProps = {
  steps: AntTourProps['steps']
  open: boolean
  onClose: AntTourProps['onClose']
  onFinish: AntTourProps['onFinish']
}

export function Tour({ steps, open, onClose, onFinish }: TourProps) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#172554', // Tailwind blue-950
          colorBgElevated: '#eff6ff', // Tailwind blue-50
          colorText: '#172554', // Tailwind blue-950
          borderRadius: 0,
          colorBorder: '#172554', // Tailwind blue-950
        },
      }}
    >
      <AntTour steps={steps} open={open} onClose={onClose} onFinish={onFinish} />
    </ConfigProvider>
  )
}
