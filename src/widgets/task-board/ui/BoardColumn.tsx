import styles from './BoardColumn.module.scss'
import { useDndContext, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useRef, useState } from 'react'
import type { Task, TaskFields, TaskStatus } from '@/entities/task'
import { Icon } from '@/shared/ui/icon'
import { columnTitles } from '../model/columns'
import { TaskEditor } from '@/features/task-editor'
import { TaskListItem } from './TaskListItem'

interface BoardColumnProps {
  type: TaskStatus
  tasks: readonly Task[]
  today: Date
  isSearching: boolean
  onAdd: (fields: TaskFields) => void
  onEdit: (id: number, fields: TaskFields) => void
  onRemove: (id: number) => void
}

export function BoardColumn({ type, tasks, today, isSearching, onAdd, onEdit, onRemove }: BoardColumnProps) {
  const { over } = useDndContext()
  const { setNodeRef } = useDroppable({ id: type, data: { type } })
  const [editor, setEditor] = useState<Task | 'new' | null>(null)
  const addButton = useRef<HTMLButtonElement>(null)
  const editingTask = editor && editor !== 'new' ? editor : null
  const visibleTasks = editingTask && !tasks.some(({ id }) => id === editingTask.id) ? [editingTask, ...tasks] : tasks

  function closeEditor() {
    setEditor(null)
    if (editor === 'new') addButton.current?.focus({ preventScroll: true })
  }

  function saveTask(fields: TaskFields) {
    if (editingTask) onEdit(editingTask.id, fields)
    else onAdd(fields)
    closeEditor()
  }

  return (
    <section
      ref={setNodeRef}
      className={styles.root}
      data-over={over?.data.current?.type === type}
      aria-labelledby={`column-${type}`}
    >
      <header className={styles.header}>
        <h2 id={`column-${type}`}>
          <Icon name={type} />
          {columnTitles[type]}
        </h2>
        {type === 'todo' && (
          <button
            ref={addButton}
            className={styles.add}
            type="button"
            aria-disabled={editor !== null}
            onClick={() => {
              if (editor === null) setEditor('new')
            }}
          >
            + Добавить
          </button>
        )}
      </header>
      {visibleTasks.length > 0 || editor === 'new' ? (
        <ul className={styles.tasks}>
          {editor === 'new' && (
            <li key="new">
              <TaskEditor today={today} onSave={saveTask} onDismiss={closeEditor} />
            </li>
          )}
          <SortableContext
            id={type}
            items={tasks.filter(({ id }) => id !== editingTask?.id).map(({ id }) => id)}
            strategy={verticalListSortingStrategy}
          >
            {visibleTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                today={today}
                editing={task.id === editingTask?.id}
                onEdit={editor === null ? () => setEditor(task) : undefined}
                onSave={saveTask}
                onDismiss={closeEditor}
                onRemove={onRemove}
              />
            ))}
          </SortableContext>
        </ul>
      ) : (
        <p className={styles.empty}>{isSearching ? 'Нет совпадений' : 'Нет задач'}</p>
      )}
    </section>
  )
}
