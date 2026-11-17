import { startOfToday } from '@/shared/lib/calendar'
import type { Task } from './task'

const millisecondsPerDay = 24 * 60 * 60 * 1000
const deadlineWarningDays = 3

export function isDeadlineNear(task: Pick<Task, 'type' | 'endDay'>, now = new Date()): boolean {
  const today = startOfToday(now)
  const afterWarningWindow = today + (deadlineWarningDays + 1) * millisecondsPerDay

  return task.type !== 'done' && task.endDay >= today && task.endDay < afterWarningWindow
}
