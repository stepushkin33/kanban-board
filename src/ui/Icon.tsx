import type { ReactNode } from 'react'

export type IconName = 'search' | 'close' | 'edit' | 'trash' | 'todo' | 'in_progress' | 'review' | 'done'

const paths: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.4 15.4 4.1 4.1" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  edit: <path d="M13.5 6.5l4 4M4 20l4.5-1 11-11a2.8 2.8 0 0 0-4-4l-11 11L4 20Z" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v6m4-6v6" />,
  todo: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
      <path className="icon-details" d="M6.8 13.3h10.4a5.3 5.3 0 0 1-10.4 0Z" />
      <path className="icon-details" d="M8.5 8.4h.1m6.8 0h.1" strokeWidth="2.8" />
    </>
  ),
  in_progress: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
      <path className="icon-details" d="M7.8 13.9a4.8 4.8 0 0 0 8.4 0M8.5 8.8h.1m6.8 0h.1" strokeWidth="2.4" />
    </>
  ),
  review: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
      <path className="icon-details" d="m6.7 10 2-1.4 2 1.4m2.6 0 2-1.4 2 1.4" />
      <ellipse className="icon-details" cx="12" cy="15.1" rx="2.4" ry="2.8" />
    </>
  ),
  done: (
    <>
      <path
        d="M3.5 11a8.5 8.5 0 1 1 17 0v10a.8.8 0 0 1-1.3.6L17 20l-2.5 2-2.5-2-2.5 2L7 20l-2.2 1.6a.8.8 0 0 1-1.3-.6Z"
        fill="currentColor"
        stroke="none"
      />
      <path className="icon-details" d="M8.5 9.5v1.3m7-1.3v1.3" strokeWidth="2.3" />
    </>
  ),
}

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}
