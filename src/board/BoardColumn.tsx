import { useDroppable } from '@dnd-kit/core'
import type { Task, TaskStatus } from '../tasks/task'
import { Icon } from '../ui/Icon'
import { columnTitles } from './columns'
import { TaskCard } from './TaskCard'

interface BoardColumnProps {
  type: TaskStatus
  tasks: readonly Task[]
  today: Date
  isSearching: boolean
  onAdd: () => void
  onEdit: (task: Task) => void
  onRemove: (id: number) => void
}

export function BoardColumn({ type, tasks, today, isSearching, onAdd, onEdit, onRemove }: BoardColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: type })

  return (
    <section ref={setNodeRef} className="board-column" data-over={isOver} aria-labelledby={`column-${type}`}>
      <header className="board-column__header">
        <h2 id={`column-${type}`}>
          <Icon name={type} />
          {columnTitles[type]}
        </h2>
        {type === 'todo' && (
          <button className="add-button" type="button" onClick={onAdd}>
            + Добавить
          </button>
        )}
      </header>
      {tasks.length > 0 ? (
        <ul className="board-column__tasks">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} today={today} onEdit={onEdit} onRemove={onRemove} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="board-column__empty">{isSearching ? 'Нет совпадений' : 'Нет задач'}</p>
      )}
    </section>
  )
}
