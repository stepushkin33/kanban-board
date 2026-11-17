import type { TaskStatus } from '../tasks/task'

export const columnTitles: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
}
