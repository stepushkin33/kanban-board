import styles from './TaskCard.module.scss'
import { useSortable } from '@dnd-kit/sortable'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { isDeadlineNear, isTaskOverdue, TaskDetails } from '@/entities/task'
import type { Task } from '@/entities/task'
import { Icon } from '@/shared/ui/icon'
import { IconButton } from '@/shared/ui/icon-button'

interface TaskCardProps {
  task: Task
  today: Date
  onEdit?: () => void
  onRemove: (id: number) => void
}

export function TaskCard({ task, today, onEdit, onRemove }: TaskCardProps) {
  const [confirming, setConfirming] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const { attributes, listeners, isDragging, isOver, active, transform, transition, setNodeRef, setActivatorNodeRef } =
    useSortable({
      id: task.id,
      disabled: { draggable: confirming },
      data: { type: task.type },
      attributes: { role: 'article', roleDescription: 'перетаскиваемая задача' },
    })
  const style: CSSProperties & { '--card-sort-transition'?: string } = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    '--card-sort-transition': transition,
  }

  const setCardRef = useCallback(
    (node: HTMLElement | null) => {
      cardRef.current = node
      setNodeRef(node)
      setActivatorNodeRef(node)
    },
    [setNodeRef, setActivatorNodeRef],
  )

  useEffect(() => {
    if (confirming) cancelButton.current?.focus()
  }, [confirming])

  function cancelRemoval() {
    setConfirming(false)
    cardRef.current?.focus({ preventScroll: true })
  }

  return (
    <article
      ref={setCardRef}
      className={styles.root}
      style={style}
      data-overdue={isTaskOverdue(task, today)}
      data-near-deadline={isDeadlineNear(task, today)}
      data-dragging={isDragging}
      data-drop-target={isOver && active?.data.current?.type !== task.type}
      {...attributes}
      {...listeners}
      aria-label={task.text}
    >
      {!confirming && (
        <div
          className={styles.actions}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
        >
          {onEdit && (
            <IconButton
              className={`${styles.action} ${styles.edit}`}
              aria-label={`Редактировать задачу: ${task.text}`}
              title="Редактировать"
              type="button"
              onClick={onEdit}
            >
              <Icon name="edit" />
            </IconButton>
          )}
          <IconButton
            className={`${styles.action} ${styles.delete}`}
            aria-label={`Удалить задачу: ${task.text}`}
            title="Удалить"
            type="button"
            onClick={() => setConfirming(true)}
          >
            <Icon name="trash" />
          </IconButton>
        </div>
      )}
      <TaskDetails task={task} nearDeadline={isDeadlineNear(task, today)} />
      {confirming && (
        <div
          className={styles.confirmation}
          role="group"
          aria-label="Удалить задачу?"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              cancelRemoval()
            }
          }}
        >
          <p>Удалить задачу?</p>
          <div className={styles.buttons}>
            <button ref={cancelButton} className={styles.confirm} type="button" onClick={cancelRemoval}>
              Отмена
            </button>
            <button className={`${styles.confirm} ${styles.delete}`} type="button" onClick={() => onRemove(task.id)}>
              Удалить
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

export function TaskCardPreview({ task, today }: Pick<TaskCardProps, 'task' | 'today'>) {
  return (
    <div
      className={`${styles.root} ${styles.preview}`}
      data-overdue={isTaskOverdue(task, today)}
      data-near-deadline={isDeadlineNear(task, today)}
      aria-hidden="true"
    >
      <TaskDetails task={task} nearDeadline={isDeadlineNear(task, today)} />
    </div>
  )
}
