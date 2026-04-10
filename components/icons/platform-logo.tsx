interface Props {
  className?: string
}

export function PlatformLogo({ className }: Props) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="22"
      viewBox="0 0 24 24"
      width="22"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.2" />
      <path
        d="M2 17l10 5 10-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M2 12l10 5 10-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}
