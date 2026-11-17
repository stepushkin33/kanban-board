import { DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { Announcements } from '@dnd-kit/core'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { isTaskStatus, taskStatuses } from '../tasks/task'
import type { Task, TaskStatus } from '../tasks/task'
import { BoardColumn } from './BoardColumn'
import { boardCollision, moveByColumn } from './board-drag'
import { columnTitles } from './columns'
import { TaskCardPreview } from './TaskCard'

const announcements: Announcements = {
  onDragStart: () => 'Задача взята для перемещения.',
  onDragOver: ({ over }) => (isTaskStatus(over?.id) ? `Столбец ${columnTitles[over.id]}.` : 'За пределами столбцов.'),
  onDragEnd: ({ over }) =>
    isTaskStatus(over?.id) ? `Задача помещена в столбец ${columnTitles[over.id]}.` : 'Перемещение отменено.',
  onDragCancel: () => 'Перемещение отменено.',
}

interface BoardProps {
  groups: Record<TaskStatus, Task[]>
  today: Date
  isSearching: boolean
  onAdd: () => void
  onEdit: (task: Task) => void
  onRemove: (id: number) => void
  onMove: (id: number, type: TaskStatus) => void
}

export function Board({ groups, today, isSearching, onAdd, onEdit, onRemove, onMove }: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 7 } }),
    useSensor(KeyboardSensor, { coordinateGetter: moveByColumn }),
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={boardCollision}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            'Нажмите пробел, чтобы взять задачу. Используйте стрелки влево и вправо для выбора столбца. Пробел подтверждает перенос, Escape отменяет.',
        },
      }}
      onDragStart={({ active }) => {
        const type = active.data.current?.type
        if (isTaskStatus(type)) setActiveTask(groups[type].find((task) => task.id === active.id) ?? null)
      }}
      onDragEnd={({ active, over }) => {
        setActiveTask(null)
        if (typeof active.id === 'number' && isTaskStatus(over?.id)) onMove(active.id, over.id)
      }}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="board" aria-label="Столбцы задач">
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
        <DragOverlay dropAnimation={null}>
          {activeTask && <TaskCardPreview task={activeTask} today={today} />}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}
