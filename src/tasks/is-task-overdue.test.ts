import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isTaskOverdue } from './is-task-overdue'
import type { TaskStatus } from './task'

const now = new Date(2026, 10, 17, 18, 0)
const today = Date.UTC(2026, 10, 17)

describe('isTaskOverdue', () => {
  for (const type of ['todo', 'in_progress', 'review'] satisfies TaskStatus[]) {
    it(`marks a ${type} task with yesterday’s deadline as overdue`, () => {
      assert.equal(isTaskOverdue({ type, endDay: today - 1 }, now), true)
    })
  }

  it('exempts completed tasks even when the deadline has passed', () => {
    assert.equal(isTaskOverdue({ type: 'done', endDay: today - 1 }, now), false)
  })

  it('keeps a deadline today current until the calendar day ends', () => {
    assert.equal(isTaskOverdue({ type: 'todo', endDay: today }, now), false)
    assert.equal(isTaskOverdue({ type: 'todo', endDay: today + 12 * 60 * 60 * 1000 }, now), false)
    assert.equal(isTaskOverdue({ type: 'todo', endDay: today }, new Date(2026, 10, 18)), true)
  })

  it('keeps a future deadline current', () => {
    assert.equal(isTaskOverdue({ type: 'review', endDay: Date.UTC(2026, 10, 18) }, now), false)
  })
})
