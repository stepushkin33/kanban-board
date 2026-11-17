import type { Task, TaskDrop } from './task'

export function compareTaskOrder(first: Task, second: Task): number {
  if (first.position !== second.position) {
    if (first.position === undefined) return 1
    if (second.position === undefined) return -1
    return first.position - second.position
  }
  return first.startDay - second.startDay
}

export function placeTask(tasks: Task[], id: number, { type, relativeTo }: TaskDrop): Task[] {
  const task = tasks.find((candidate) => candidate.id === id)
  if (!task || id === relativeTo?.id || (!relativeTo && task.type === type)) return tasks

  const ordered = tasks.filter((candidate) => candidate.type === type).sort(compareTaskOrder)
  const destination = ordered.filter((candidate) => candidate.id !== id)
  const moved = { ...task, type }
  if (!relativeTo && destination.every((candidate) => candidate.position === undefined)) {
    delete moved.position
    return tasks.map((candidate) => (candidate === task ? moved : candidate))
  }

  const anchor = relativeTo ? destination.findIndex((candidate) => candidate.id === relativeTo.id) : destination.length
  if (anchor === -1) return tasks

  const index = relativeTo?.after ? anchor + 1 : anchor
  if (index === ordered.findIndex((candidate) => candidate.id === id)) {
    return tasks
  }

  destination.splice(index, 0, moved)
  const order = new Map(destination.map((candidate, position) => [candidate.id, { ...candidate, position }]))
  return tasks.map((candidate) => order.get(candidate.id) ?? candidate)
}
