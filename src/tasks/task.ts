export const taskStatuses = ['todo', 'in_progress', 'review', 'done'] as const

export type TaskStatus = (typeof taskStatuses)[number]

export interface Task {
  id: number
  type: TaskStatus
  startDay: number
  endDay: number
  text: string
}

export type TaskFields = Omit<Task, 'id'>

export function isTaskStatus(value: unknown): value is TaskStatus {
  return taskStatuses.some((status) => status === value)
}
