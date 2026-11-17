import assert from 'node:assert/strict'
import { it } from 'node:test'
import { isDeadlineNear } from './is-deadline-near'

it('highlights only upcoming open deadlines up to three calendar days away', () => {
  const now = new Date(2026, 10, 17, 18, 0)

  assert.equal(isDeadlineNear({ type: 'todo', endDay: Date.UTC(2026, 10, 16, 23, 59) }, now), false)
  assert.equal(isDeadlineNear({ type: 'todo', endDay: Date.UTC(2026, 10, 17) }, now), true)
  assert.equal(isDeadlineNear({ type: 'review', endDay: Date.UTC(2026, 10, 20, 23, 59) }, now), true)
  assert.equal(isDeadlineNear({ type: 'review', endDay: Date.UTC(2026, 10, 21) }, now), false)
  assert.equal(isDeadlineNear({ type: 'done', endDay: Date.UTC(2026, 10, 18) }, now), false)
})
