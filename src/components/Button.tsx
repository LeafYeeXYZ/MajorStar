export type ButtonProps = {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function Button({ children, onClick, className, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`border border-blue-950 bg-blue-50 px-[0.6rem] py-[0.3rem] text-blue-950 transition-all duration-100 hover:bg-blue-950 hover:text-white active:scale-[97%] disabled:cursor-not-allowed disabled:grayscale disabled:filter disabled:hover:scale-100 disabled:hover:bg-blue-50 disabled:hover:text-blue-950 ${className || ''}`}
    >
      {children}
    </button>
  )
}
