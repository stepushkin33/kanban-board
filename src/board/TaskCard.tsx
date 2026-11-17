import { useDraggable } from '@dnd-kit/core'
import { useCallback } from 'react'
import { formatTaskDate, toDateFieldValue } from '../tasks/dates'
import { isTaskOverdue } from '../tasks/is-task-overdue'
import type { Task } from '../tasks/task'
import { Icon } from '../ui/Icon'

function TaskDetails({ task }: { task: Task }) {
  return (
    <dl className="task-details">
      <div>
        <dt>Начало:</dt>
        <dd>
          <time dateTime={toDateFieldValue(task.startDay)}>{formatTaskDate(task.startDay)}</time>
        </dd>
      </div>
      <div className="task-details__deadline">
        <dt>Окончание:</dt>
        <dd>
          <time dateTime={toDateFieldValue(task.endDay)}>{formatTaskDate(task.endDay)}</time>
        </dd>
      </div>
      <div className="task-details__description">
        <dt>Описание:</dt>
        <dd>{task.text}</dd>
      </div>
    </dl>
  )
}

interface TaskCardProps {
  task: Task
  today: Date
  onEdit: (task: Task) => void
  onRemove: (id: number) => void
}

export function TaskCard({ task, today, onEdit, onRemove }: TaskCardProps) {
  const { attributes, listeners, isDragging, setNodeRef, setActivatorNodeRef } = useDraggable({
    id: task.id,
    data: { type: task.type },
    attributes: { role: 'article', roleDescription: 'перетаскиваемая задача' },
  })

  const setCardRef = useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node)
      setActivatorNodeRef(node)
    },
    [setNodeRef, setActivatorNodeRef],
  )

  return (
    <article
      ref={setCardRef}
      className="task-card"
      data-overdue={isTaskOverdue(task, today)}
      data-dragging={isDragging}
      {...attributes}
      {...listeners}
      aria-label={task.text}
    >
      <div
        className="task-card__actions"
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <button
          className="icon-button"
          aria-label={`Редактировать задачу: ${task.text}`}
          title="Редактировать"
          type="button"
          onClick={() => onEdit(task)}
        >
          <Icon name="edit" />
        </button>
        <button
          className="icon-button icon-button--danger"
          aria-label={`Удалить задачу: ${task.text}`}
          title="Удалить"
          type="button"
          onClick={() => onRemove(task.id)}
        >
          <Icon name="trash" />
        </button>
      </div>
      <TaskDetails task={task} />
    </article>
  )
}

export function TaskCardPreview({ task, today }: Pick<TaskCardProps, 'task' | 'today'>) {
  return (
    <div className="task-card task-card--preview" data-overdue={isTaskOverdue(task, today)} aria-hidden="true">
      <TaskDetails task={task} />
    </div>
  )
}
