import styles from './TaskBoard.module.scss'
import { DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { Announcements } from '@dnd-kit/core'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { taskStatusSchema, taskStatuses } from '@/entities/task'
import type { Task, TaskDrop, TaskFields, TaskStatus } from '@/entities/task'
import { BoardColumn } from './BoardColumn'
import { boardCollision, dropColumn, moveByArrow, taskDrop } from '../model/board-drag'
import { columnTitles } from '../model/columns'
import { TaskCardPreview } from './TaskCard'

const announcements: Announcements = {
  onDragStart: () => 'Задача взята для перемещения.',
  onDragOver: ({ over }) => {
    const type = dropColumn(over)
    if (!type) return 'За пределами столбцов.'

    const index = over?.data.current?.sortable?.index
    return typeof index === 'number'
      ? `Столбец ${columnTitles[type]}, позиция ${index + 1}.`
      : `Столбец ${columnTitles[type]}.`
  },
  onDragEnd: ({ over }) => {
    const type = dropColumn(over)
    return type ? `Задача помещена в столбец ${columnTitles[type]}.` : 'Перемещение отменено.'
  },
  onDragCancel: () => 'Перемещение отменено.',
}

interface TaskBoardProps {
  groups: Record<TaskStatus, Task[]>
  today: Date
  isSearching: boolean
  onAdd: (fields: TaskFields) => void
  onEdit: (id: number, fields: TaskFields) => void
  onRemove: (id: number) => void
  onMove: (id: number, drop: TaskDrop) => void
}

export function TaskBoard({ groups, today, isSearching, onAdd, onEdit, onRemove, onMove }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 7 } }),
    useSensor(KeyboardSensor, { coordinateGetter: moveByArrow, scrollBehavior: 'auto' }),
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={boardCollision}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            'Нажмите пробел, чтобы взять задачу. Стрелки вверх и вниз меняют позицию, влево и вправо — столбец. Пробел подтверждает перенос, Escape отменяет.',
        },
      }}
      onDragStart={({ active }) => {
        const type = active.data.current?.type
        if (taskStatusSchema.validate(type)) setActiveTask(groups[type].find((task) => task.id === active.id) ?? null)
      }}
      onDragEnd={(event) => {
        setActiveTask(null)
        const drop = taskDrop(event, groups)
        if (drop && typeof event.active.id === 'number') onMove(event.active.id, drop)
      }}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className={styles.board} aria-label="Столбцы задач">
        {taskStatuses.map((type) => (
          <BoardColumn
            key={type}
            type={type}
            tasks={groups[type]}
            today={today}
            isSearching={isSearching}
            onAdd={onAdd}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
      </div>
      {createPortal(
        <DragOverlay dropAnimation={window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? null : undefined}>
          {activeTask && <TaskCardPreview task={activeTask} today={today} />}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}
