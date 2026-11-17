import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatTaskDate, parseDateFieldValue } from './dates'
import { groupTasks } from './select-tasks'
import type { Task } from './task'

const tasks: Task[] = [
  { id: 1, type: 'todo', startDay: Date.UTC(2026, 2, 2), endDay: Date.UTC(2026, 2, 12), text: 'Написать тесты' },
  { id: 2, type: 'todo', startDay: Date.UTC(2026, 1, 1), endDay: Date.UTC(2026, 2, 2), text: 'Согласовать макет' },
  { id: 3, type: 'done', startDay: Date.UTC(2026, 2, 4), endDay: Date.UTC(2026, 2, 6), text: 'Тесты приняты' },
  { id: 4, type: 'review', startDay: Date.UTC(2026, 2, 2), endDay: Date.UTC(2026, 2, 2), text: 'Повторная проверка' },
]

describe('groupTasks', () => {
  it('groups tasks by status, sorts by start date and preserves the input order', () => {
    assert.deepEqual(groupTasks(tasks, ''), {
      todo: [tasks[1], tasks[0]],
      in_progress: [],
      review: [tasks[3]],
      done: [tasks[2]],
    })
    assert.deepEqual(
      tasks.map((task) => task.id),
      [1, 2, 3, 4],
    )
  })

  it('finds part of a description with space and case normalization', () => {
    assert.deepEqual(groupTasks(tasks, '  ТЕСТЫ '), { todo: [tasks[0]], in_progress: [], review: [], done: [tasks[2]] })
  })

  it('matches either calendar date and returns each task once', () => {
    assert.deepEqual(groupTasks(tasks, '02.03.2026'), {
      todo: [tasks[1], tasks[0]],
      in_progress: [],
      review: [tasks[3]],
      done: [],
    })
  })

  it('does not roll invalid dates into the next month', () => {
    assert.equal(parseDateFieldValue('2026-02-29'), null)
    assert.equal(parseDateFieldValue('0000-01-01'), null)
    assert.equal(parseDateFieldValue('2028-02-29'), Date.UTC(2028, 1, 29))
    assert.deepEqual(groupTasks(tasks, '30.02.2026'), { todo: [], in_progress: [], review: [], done: [] })
  })

  it('uses the same UTC date for rendering and search', () => {
    const lateAtNight = Date.UTC(2026, 2, 2, 23, 59)
    const task: Task = { id: 5, type: 'todo', startDay: lateAtNight, endDay: lateAtNight, text: 'Задача' }
    assert.equal(formatTaskDate(lateAtNight), '02.03.2026')
    assert.deepEqual(groupTasks([task], formatTaskDate(lateAtNight)).todo, [task])
  })
})
