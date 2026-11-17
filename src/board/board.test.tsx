import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, it } from 'node:test'
import { JSDOM } from 'jsdom'

const { window } = new JSDOM('', { url: 'https://kanban.test/' })

Object.assign(globalThis, {
  window,
  document: window.document,
  HTMLElement: window.HTMLElement,
  Element: window.Element,
  Node: window.Node,
})

Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })

Object.defineProperties(window.HTMLDialogElement.prototype, {
  showModal: {
    value(this: HTMLDialogElement) {
      this.open = true
    },
  },
  close: {
    value(this: HTMLDialogElement) {
      this.open = false
    },
  },
})

const { cleanup, fireEvent, render, screen, within } = await import('@testing-library/react')
const { App } = await import('../App')
const { readTasks, writeTasks } = await import('../tasks/task-storage')
const originalTask = 'Обновить базу знаний компании до конца года.'

beforeEach(() => window.localStorage.clear())
afterEach(cleanup)
after(() => window.close())

it('renders and searches fixture tasks by text and either date', () => {
  render(<App />)

  const todo = screen.getByRole('region', { name: 'To Do' })
  assert.equal(within(todo).getAllByRole('article')[0]?.getAttribute('aria-label'), originalTask)
  assert.equal(screen.getAllByRole('article').length, 17)

  const search = screen.getByRole('searchbox')
  fireEvent.change(search, { target: { value: 'БАЗУ ЗНАНИЙ' } })
  assert.equal(screen.getAllByRole('article').length, 1)
  assert.ok(screen.getByRole('article', { name: originalTask }))

  fireEvent.change(search, { target: { value: '02.01.2026' } })
  assert.equal(screen.getAllByRole('article').length, 2)
  fireEvent.click(screen.getByRole('button', { name: 'Очистить поиск' }))
  assert.equal(screen.getAllByRole('article').length, 17)
})

it('edits description and status, persists changes, and deletes one card', async () => {
  const view = render(<App />)
  const card = screen.getByRole('article', { name: originalTask })
  assert.equal(card.getAttribute('data-overdue'), 'true')

  fireEvent.click(within(card).getByRole('button', { name: /Редактировать/ }))
  const editor = await screen.findByRole('dialog')
  const description = within(editor).getByLabelText('Описание')
  fireEvent.change(description, { target: { value: '   ' } })
  fireEvent.click(within(editor).getByRole('button', { name: 'Сохранить' }))
  assert.match(within(editor).getByRole('alert').textContent ?? '', /Введите описание/)

  fireEvent.change(description, { target: { value: ' Обновить базу знаний ' } })
  fireEvent.change(within(editor).getByLabelText('Статус'), { target: { value: 'done' } })
  fireEvent.click(within(editor).getByRole('button', { name: 'Сохранить' }))

  const done = screen.getByRole('region', { name: 'Done' })
  const edited = within(done).getByRole('article', { name: 'Обновить базу знаний' })
  assert.equal(edited.getAttribute('data-overdue'), 'false')

  view.unmount()
  render(<App />)
  const restored = screen.getByRole('article', { name: 'Обновить базу знаний' })
  fireEvent.click(within(restored).getByRole('button', { name: /Удалить/ }))
  assert.equal(screen.queryByRole('article', { name: 'Обновить базу знаний' }), null)
  assert.equal(readTasks([]).length, 16)
})

it('preserves an intentionally empty saved board', () => {
  assert.equal(writeTasks([]), true)
  render(<App />)

  assert.equal(screen.queryAllByRole('article').length, 0)
  assert.equal(screen.getAllByText('Нет задач').length, 4)
})

it('loads the fixture when stored data is invalid', () => {
  window.localStorage.setItem('kanban-board:tasks:v1', '{"unexpected":true}')
  render(<App />)

  assert.equal(screen.getAllByRole('article').length, 17)
})
