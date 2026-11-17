import assert from 'node:assert/strict'
import { after, beforeEach, it } from 'node:test'
import { JSDOM } from 'jsdom'
import { readTasks, writeTasks } from './task-storage'
import type { Task } from '../model/task'

const { window } = new JSDOM('', { url: 'https://kanban.test/' })
Object.assign(globalThis, { window })

const storageKey = 'kanban-board:tasks:v1'
const task: Task = {
  id: 1,
  type: 'todo',
  startDay: Date.parse('2026-11-17'),
  endDay: Date.parse('2026-11-20'),
  text: 'Проверить сохранение задач',
}
const fallback: Task[] = [task]

beforeEach(() => window.localStorage.clear())
after(() => window.close())

it('loads existing tasks with optional manual order and preserves an empty saved board', () => {
  const tasks: Task[] = [task, { ...task, id: 2, type: 'review', position: 0 }]
  assert.equal(writeTasks(tasks), true)
  assert.deepEqual(readTasks([]), tasks)

  assert.equal(writeTasks([]), true)
  assert.deepEqual(readTasks(fallback), [])
})

it('falls back when the saved data is missing or is not valid JSON', () => {
  assert.equal(readTasks(fallback), fallback)
  window.localStorage.setItem(storageKey, '{broken')
  assert.equal(readTasks(fallback), fallback)
})

it('rejects malformed tasks without coercion or partially loading a damaged board', () => {
  const invalidTasks: [string, unknown][] = [
    ['null task', null],
    ['array instead of task', []],
    ['missing fields', { id: 2 }],
    ['unknown status', { ...task, id: 2, type: 'archived' }],
    ['string ID', { ...task, id: '2' }],
    ['fractional ID', { ...task, id: 2.5 }],
    ['unsafe ID', { ...task, id: Number.MAX_SAFE_INTEGER + 1 }],
    ['non-string text', { ...task, id: 2, text: null }],
    ['string timestamp', { ...task, id: 2, startDay: '2026-11-17' }],
    ['non-finite timestamp', { ...task, id: 2, startDay: Infinity }],
    ['year before 0001', { ...task, id: 2, startDay: Date.parse('0001-01-01') - 1 }],
    ['year after 9999', { ...task, id: 2, endDay: Date.parse('+010000-01-01') }],
    ['negative position', { ...task, id: 2, position: -1 }],
    ['fractional position', { ...task, id: 2, position: 0.5 }],
    ['unsafe position', { ...task, id: 2, position: Number.MAX_SAFE_INTEGER + 1 }],
    ['string position', { ...task, id: 2, position: '0' }],
    ['duplicate ID', { ...task, text: 'Другой текст, тот же ID' }],
  ]

  for (const [reason, invalid] of invalidTasks) {
    window.localStorage.setItem(storageKey, JSON.stringify([task, invalid]))
    assert.equal(readTasks(fallback), fallback, reason)
  }

  for (const invalid of [null, {}, 'tasks']) {
    window.localStorage.setItem(storageKey, JSON.stringify(invalid))
    assert.equal(readTasks(fallback), fallback)
  }
})

it('accepts supported date boundaries and removes unknown fields from saved tasks', () => {
  const boundedTask: Task = {
    ...task,
    startDay: Date.parse('0001-01-01'),
    endDay: Date.parse('9999-12-31T23:59:59.999Z'),
  }
  window.localStorage.setItem(storageKey, JSON.stringify([{ ...boundedTask, unexpected: true }]))

  assert.deepEqual(readTasks([]), [boundedTask])
})
