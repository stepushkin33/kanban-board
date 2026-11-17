import { parseDateQuery, toDateFieldValue } from './dates'
import type { Task, TaskStatus } from './task'

export function groupTasks(tasks: readonly Task[], search: string): Record<TaskStatus, Task[]> {
  const groups: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], review: [], done: [] }
  const query = search.trim().toLocaleLowerCase('ru-RU')
  const date = parseDateQuery(query)

  for (const task of tasks) {
    const matches = date
      ? toDateFieldValue(task.startDay) === date || toDateFieldValue(task.endDay) === date
      : task.text.toLocaleLowerCase('ru-RU').includes(query)

    if (matches) groups[task.type].push(task)
  }

  for (const group of Object.values(groups)) {
    group.sort((first, second) => first.startDay - second.startDay)
  }

  return groups
}
