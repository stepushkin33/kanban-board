import { pointerWithin } from '@dnd-kit/core'
import type { CollisionDetection, KeyboardCoordinateGetter } from '@dnd-kit/core'
import { isTaskStatus, taskStatuses } from '../tasks/task'

export const boardCollision: CollisionDetection = (args) => {
  if (args.pointerCoordinates) return pointerWithin(args)

  const center = args.collisionRect.left + args.collisionRect.width / 2
  return args.droppableContainers
    .flatMap(({ id }) => {
      const rect = args.droppableRects.get(id)
      return rect ? [{ id, data: { value: Math.abs(center - (rect.left + rect.width / 2)) } }] : []
    })
    .sort((first, second) => first.data.value - second.data.value)
}

export const moveByColumn: KeyboardCoordinateGetter = (event, { context, currentCoordinates }) => {
  if (event.code !== 'ArrowLeft' && event.code !== 'ArrowRight') return

  event.preventDefault()
  const current = context.over?.id ?? context.active?.data.current?.type
  if (!isTaskStatus(current) || !context.collisionRect) return

  const offset = event.code === 'ArrowRight' ? 1 : -1
  const next = taskStatuses[taskStatuses.indexOf(current) + offset]
  const target = next && context.droppableRects.get(next)
  if (!target) return

  const card = context.collisionRect
  return {
    x: currentCoordinates.x + (target.left + target.width / 2) - (card.left + card.width / 2),
    y: currentCoordinates.y + Math.min(0, target.bottom - card.bottom),
  }
}
