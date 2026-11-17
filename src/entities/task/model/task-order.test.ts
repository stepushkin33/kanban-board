import assert from 'node:assert/strict'
import { it } from 'node:test'
import { groupTasks } from './select-tasks'
import type { Task } from './task'
import { placeTask } from './task-order'

const tasks: Task[] = [
  { id: 1, type: 'todo', startDay: 1, endDay: 10, text: 'Приоритет' },
  { id: 2, type: 'todo', startDay: 2, endDay: 10, text: 'Скрытая задача' },
  { id: 3, type: 'todo', startDay: 3, endDay: 10, text: 'Приоритет' },
  { id: 4, type: 'review', startDay: 4, endDay: 10, text: 'Приоритет' },
]

it('reorders relative to a visible card and preserves the other cards through filtering and reload', () => {
  const result = placeTask(tasks, 3, { type: 'todo', relativeTo: { id: 1, after: false } })
  const reloaded: Task[] = JSON.parse(JSON.stringify(result))

  assert.deepEqual(
    groupTasks(reloaded, '').todo.map(({ id }) => id),
    [3, 1, 2],
  )
  assert.deepEqual(
    groupTasks(reloaded, 'приоритет').todo.map(({ id }) => id),
    [3, 1],
  )
  assert.deepEqual(
    groupTasks(tasks, '').todo.map(({ id }) => id),
    [1, 2, 3],
  )
})

it('inserts a cross-column drop after the anchor and leaves empty-space drops chronological by default', () => {
  const ordered = placeTask(tasks, 4, { type: 'todo', relativeTo: { id: 1, after: true } })
  assert.deepEqual(
    groupTasks(ordered, '').todo.map(({ id }) => id),
    [1, 4, 2, 3],
  )
  assert.deepEqual(groupTasks(ordered, '').review, [])

  const chronological = placeTask(tasks, 1, { type: 'review' })
  assert.deepEqual(
    groupTasks(chronological, '').review.map(({ id }) => id),
    [1, 4],
  )
})
