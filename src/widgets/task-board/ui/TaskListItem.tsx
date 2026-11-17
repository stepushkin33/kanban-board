import { useLayoutEffect, useRef } from 'react'
import type { Task, TaskFields } from '@/entities/task'
import { TaskCard } from './TaskCard'
import { TaskEditor } from '@/features/task-editor'

interface TaskListItemProps {
  task: Task
  today: Date
  editing: boolean
  onEdit?: () => void
  onSave: (fields: TaskFields) => void
  onDismiss: () => void
  onRemove: (id: number) => void
}

export function TaskListItem({ task, today, editing, onEdit, onSave, onDismiss, onRemove }: TaskListItemProps) {
  const item = useRef<HTMLLIElement>(null)
  const previousHeight = useRef<number | null>(null)
  const resize = useRef<Animation | null>(null)

  function changeMode(action: () => void) {
    previousHeight.current = item.current?.firstElementChild?.getBoundingClientRect().height ?? null
    resize.current?.cancel()
    action()
  }

  useLayoutEffect(() => {
    const node = item.current?.firstElementChild
    const from = previousHeight.current
    previousHeight.current = null
    if (!node || from === null) return

    if (!editing && node instanceof HTMLElement) node.focus({ preventScroll: true })
    const to = node.getBoundingClientRect().height
    if (from === to || !node.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    resize.current = node.animate(
      [
        { height: `${from}px`, overflow: 'clip' },
        { height: `${to}px`, overflow: 'clip' },
      ],
      { duration: 200, easing: 'ease-out' },
    )
  }, [editing])

  return (
    <li ref={item}>
      {editing ? (
        <TaskEditor
          task={task}
          today={today}
          onSave={(fields) => changeMode(() => onSave(fields))}
          onDismiss={() => changeMode(onDismiss)}
        />
      ) : (
        <TaskCard task={task} today={today} onEdit={onEdit && (() => changeMode(onEdit))} onRemove={onRemove} />
      )}
    </li>
  )
}
