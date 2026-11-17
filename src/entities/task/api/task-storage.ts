import { taskListSchema } from '../model/task'
import type { Task } from '../model/task'

const storageKey = 'kanban-board:tasks:v1'

export function readTasks(fallback: Task[]): Task[] {
  try {
    const stored = window.localStorage.getItem(storageKey)
    if (stored === null) return fallback

    const result = taskListSchema.safeParse(JSON.parse(stored))
    if (result.success) return result.data
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
