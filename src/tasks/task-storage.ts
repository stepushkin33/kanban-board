import { isTaskStatus } from './task'
import type { Task } from './task'

const storageKey = 'kanban-board:tasks:v1'

function isTaskTimestamp(value: unknown): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return false

  const year = new Date(value).getUTCFullYear()
  return year >= 1 && year <= 9999
}

function isTask(value: unknown): value is Task {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    Number.isSafeInteger(value.id) &&
    'type' in value &&
    isTaskStatus(value.type) &&
    'startDay' in value &&
    isTaskTimestamp(value.startDay) &&
    'endDay' in value &&
    isTaskTimestamp(value.endDay) &&
    'text' in value &&
    typeof value.text === 'string'
  )
}

function isTaskList(value: unknown): value is Task[] {
  return Array.isArray(value) && value.every(isTask) && new Set(value.map(({ id }) => id)).size === value.length
}

export function readTasks(fallback: Task[]): Task[] {
  try {
    const stored = window.localStorage.getItem(storageKey)
    if (stored === null) return fallback

    const tasks: unknown = JSON.parse(stored)
    if (isTaskList(tasks)) return tasks
  } catch {
    // Storage may be blocked, or the saved JSON may be malformed.
  }

  return fallback
}

export function writeTasks(tasks: readonly Task[]): boolean {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(tasks))
    return true
  } catch {
    return false
  }
}
