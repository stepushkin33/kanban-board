import { pointerWithin } from '@dnd-kit/core'
import type { CollisionDetection, DragEndEvent, KeyboardCoordinateGetter, Over } from '@dnd-kit/core'
import { taskStatusSchema, taskStatuses } from '@/entities/task'
import type { Task, TaskDrop, TaskStatus } from '@/entities/task'

export function dropColumn(over: Over | null | undefined): TaskStatus | undefined {
  const type = over?.data.current?.type
  return taskStatusSchema.validate(type) ? type : undefined
}

export const boardCollision: CollisionDetection = (args) => {
  const { collisionRect } = args
  const pointerCoordinates = args.pointerCoordinates ?? {
    x: collisionRect.left + collisionRect.width / 2,
    y: collisionRect.top + collisionRect.height / 2,
  }
  const hits = pointerWithin({ ...args, pointerCoordinates })
  const cards = hits.filter(({ id }) => typeof id === 'number')
  const column = hits[0]
  if (cards.length || !taskStatusSchema.validate(column?.id)) return cards.length ? cards : hits

  let above = false
  let below = false
  let closest: (typeof hits)[number] | undefined
  let minimumDistance = Infinity
  for (const container of args.droppableContainers) {
    if (typeof container.id !== 'number' || container.data.current?.type !== column.id) continue
    const rect = args.droppableRects.get(container.id)
    if (!rect) continue

    above ||= rect.bottom < pointerCoordinates.y
    below ||= rect.top > pointerCoordinates.y
    const distance = Math.abs(rect.top + rect.height / 2 - pointerCoordinates.y)
    if (distance < minimumDistance) {
      minimumDistance = distance
      closest = { id: container.id }
    }
  }
  return above && below && closest ? [closest] : hits
}

export const moveByArrow: KeyboardCoordinateGetter = (event, { context, currentCoordinates }) => {
  const horizontal = event.code === 'ArrowLeft' || event.code === 'ArrowRight'
  const vertical = event.code === 'ArrowUp' || event.code === 'ArrowDown'
  if (!horizontal && !vertical) return

  event.preventDefault()
  const type = dropColumn(context.over) ?? context.active?.data.current?.type
  const card = context.collisionRect
  if (!taskStatusSchema.validate(type) || !card) return

  const step = event.code === 'ArrowLeft' || event.code === 'ArrowUp' ? -1 : 1
  const targetColumn = horizontal ? taskStatuses[taskStatuses.indexOf(type) + step] : type
  if (!targetColumn) return

  const targets = context.droppableContainers.getEnabled().flatMap((container) => {
    if (typeof container.id !== 'number' || container.data.current?.type !== targetColumn) return []
    const rect = context.droppableRects.get(container.id)
    return rect ? [{ id: container.id, rect }] : []
  })

  let target
  if (horizontal) {
    const centerY = card.top + card.height / 2
    const distance = ({ rect }: (typeof targets)[number]) => Math.abs(rect.top + rect.height / 2 - centerY)
    target =
      targets.sort((first, second) => distance(first) - distance(second))[0]?.rect ??
      context.droppableRects.get(targetColumn)
  } else {
    targets.sort((first, second) => first.rect.top - second.rect.top)
    const current = targets.findIndex(({ id }) => id === (context.over?.id ?? context.active?.id))
    target = targets[current === -1 ? (step > 0 ? 0 : targets.length - 1) : current + step]?.rect
  }

  if (!target) return

  return {
    x: currentCoordinates.x + target.left + target.width / 2 - (card.left + card.width / 2),
    y: currentCoordinates.y + target.top + target.height / 2 - (card.top + card.height / 2),
  }
}

export function taskDrop({ active, over }: DragEndEvent, groups: Record<TaskStatus, Task[]>): TaskDrop | undefined {
  const type = dropColumn(over)
  if (!type || !over || active.id === over.id) return

  const activeType = active.data.current?.type
  const activeIndex = groups[type].findIndex(({ id }) => id === active.id)
  if (typeof over.id === 'number') {
    const targetIndex = groups[type].findIndex(({ id }) => id === over.id)
    const rect = active.rect.current.translated
    const after =
      activeIndex === -1
        ? Boolean(rect && rect.top + rect.height / 2 > over.rect.top + over.rect.height / 2)
        : activeIndex < targetIndex
    return { type, relativeTo: { id: over.id, after } }
  }

  if (activeType !== type) return { type }

  const rect = active.rect.current.translated
  if (!rect) return
  const first = groups[type][0]
  const last = groups[type].at(-1)
  const after = rect.top + rect.height / 2 >= over.rect.top + over.rect.height / 2
  const edge = after ? last : first
  if (edge && edge.id !== active.id) return { type, relativeTo: { id: edge.id, after } }
}
