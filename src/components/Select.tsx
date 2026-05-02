import { Select as AntSelect, ConfigProvider, type SelectProps as AntSelectProps } from 'antd'

export type SelectProps = {
  options: AntSelectProps['options']
  value: AntSelectProps['value']
  onChange: AntSelectProps['onChange']
  className?: string
  disabled?: boolean
}

export function Select({ options, value, onChange, className, disabled }: SelectProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#172554', // Tailwind blue-950
          colorBgElevated: '#eff6ff', // Tailwind blue-50
          colorText: '#172554', // Tailwind blue-950
          borderRadius: 0,
          colorBorder: '#172554', // Tailwind blue-950
        },
        components: {
          Select: {
            controlItemBgActive: '#bfdbfe', // Tailwind blue-200
            colorBgContainer: '#eff6ff', // Tailwind blue-50
          },
        },
      }}
    >
      <AntSelect
        options={options}
        value={value}
        onChange={onChange}
        className={`disabled:filter disabled:grayscale ${className || ''}`}
        disabled={disabled}
      />
    </ConfigProvider>
  )
}
