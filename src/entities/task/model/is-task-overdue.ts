import { startOfToday } from '@/shared/lib/calendar'
import type { Task } from './task'

export function isTaskOverdue(task: Pick<Task, 'type' | 'endDay'>, now = new Date()): boolean {
  return task.type !== 'done' && task.endDay < startOfToday(now)
}
