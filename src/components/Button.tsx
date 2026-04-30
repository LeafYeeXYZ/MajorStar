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
      className={`border border-blue-950 bg-blue-50 text-blue-950 hover:bg-blue-950 hover:text-white active:scale-[97%] transition-all duration-100 px-[0.6rem] py-[0.3rem] disabled:filter disabled:grayscale disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-blue-50 disabled:hover:text-blue-950 ${className || ''}`}
    >
      {children}
    </button>
  )
}
