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

const { cleanup, fireEvent, render, screen, waitFor, within } = await import('@testing-library/react')
const { BoardPage } = await import('./BoardPage')
const { readTasks, writeTasks } = await import('@/entities/task')
const originalTask = 'Обновить базу знаний компании до конца года.'

beforeEach(() => window.localStorage.clear())
afterEach(cleanup)
after(() => window.close())

it('updates the search field immediately and debounces filtering by text and date', async () => {
  render(<BoardPage />)

  const todo = screen.getByRole('region', { name: 'To Do' })
  assert.equal(within(todo).getAllByRole('article')[0]?.getAttribute('aria-label'), originalTask)
  assert.equal(screen.getAllByRole('article').length, 17)

  const search = screen.getByRole('searchbox')
  fireEvent.change(search, { target: { value: 'УСТАРЕВШИЙ ЗАПРОС' } })
  fireEvent.change(search, { target: { value: 'БАЗУ ЗНАНИЙ' } })
  assert.equal((search as HTMLInputElement).value, 'БАЗУ ЗНАНИЙ')
  assert.equal(screen.getAllByRole('article').length, 17)
  await waitFor(() => {
    assert.equal(screen.getAllByRole('article').length, 1)
    assert.ok(screen.getByRole('article', { name: originalTask }))
  })

  fireEvent.change(search, { target: { value: '02.01.2026' } })
  assert.equal(screen.getAllByRole('article').length, 1)
  await waitFor(() => assert.equal(screen.getAllByRole('article').length, 2))
  fireEvent.click(screen.getByRole('button', { name: 'Очистить поиск' }))
  assert.equal(screen.getAllByRole('article').length, 17)
})

it('edits a To Do card in place and persists it after reload', () => {
  const view = render(<BoardPage />)
  const card = screen.getByRole('article', { name: originalTask })
  assert.equal(card.getAttribute('data-overdue'), 'true')
  assert.equal(card.getAttribute('data-near-deadline'), 'false')

  fireEvent.click(within(card).getByRole('button', { name: /Редактировать/ }))
  const todo = screen.getByRole('region', { name: 'To Do' })
  const editor = within(todo).getByRole('form', { name: 'Редактирование задачи' })
  assert.equal(screen.queryByRole('dialog'), null)
  assert.equal(editor.getAttribute('data-overdue'), 'true')
  const description = within(editor).getByLabelText('Описание:')
  fireEvent.change(description, { target: { value: '   ' } })
  fireEvent.click(within(editor).getByRole('button', { name: 'Сохранить' }))
  assert.match(within(editor).getByRole('alert').textContent ?? '', /Введите описание/)
  assert.equal(description.getAttribute('aria-describedby'), within(editor).getByRole('alert').id)
  assert.equal(description.getAttribute('aria-invalid'), 'true')

  fireEvent.change(description, { target: { value: ' Обновить базу знаний ' } })
  assert.equal(description.getAttribute('aria-describedby'), null)
  assert.equal(description.getAttribute('aria-invalid'), 'false')
  fireEvent.click(within(editor).getByRole('button', { name: 'Сохранить' }))

  const edited = within(todo).getByRole('article', { name: 'Обновить базу знаний' })
  assert.equal(edited.getAttribute('data-overdue'), 'true')

  view.unmount()
  render(<BoardPage />)
  assert.ok(screen.getByRole('article', { name: 'Обновить базу знаний' }))
})

it('creates a card inline in To Do and discards an unsaved draft on cancel', () => {
  render(<BoardPage />)

  const todo = screen.getByRole('region', { name: 'To Do' })
  const add = within(todo).getByRole('button', { name: '+ Добавить' })
  const newTask = () => within(todo).getByRole('form', { name: 'Новая задача' })
  fireEvent.click(add)
  fireEvent.change(within(newTask()).getByLabelText('Описание:'), { target: { value: 'Отменённый черновик' } })
  fireEvent.click(within(newTask()).getByRole('button', { name: 'Отмена' }))
  assert.equal(screen.getAllByRole('article').length, 17)

  fireEvent.click(add)
  const start = within(newTask()).getByLabelText<HTMLInputElement>('Начало:')
  fireEvent.change(start, { target: { value: '20112026' } })
  assert.equal(start.value, '20.11.2026')
  fireEvent.change(within(newTask()).getByLabelText('Окончание:'), { target: { value: '19.11.2026' } })
  fireEvent.change(within(newTask()).getByLabelText('Описание:'), { target: { value: 'Новая задача из формы' } })
  fireEvent.click(within(newTask()).getByRole('button', { name: 'Сохранить' }))
  assert.match(within(newTask()).getByRole('alert').textContent ?? '', /раньше начала/)
  assert.equal(
    within(newTask()).getByLabelText('Окончание:').getAttribute('aria-describedby'),
    within(newTask()).getByRole('alert').id,
  )
  assert.equal(start.getAttribute('aria-describedby'), null)

  fireEvent.change(within(newTask()).getByLabelText('Окончание:'), { target: { value: '21.11.2026' } })
  fireEvent.click(within(newTask()).getByRole('button', { name: 'Сохранить' }))
  assert.ok(within(todo).getByRole('article', { name: 'Новая задача из формы' }))
  assert.equal(readTasks([]).length, 18)
})

it('associates a date validation error with only the invalid field when several editors are open', () => {
  render(<BoardPage />)

  const forms = ['To Do', 'Review'].map((name) => {
    const column = screen.getByRole('region', { name })
    const editButton = within(column).getAllByRole('button', { name: /Редактировать/ })[0]
    assert.ok(editButton)
    fireEvent.click(editButton)
    const form = within(column).getByRole('form', { name: 'Редактирование задачи' })
    fireEvent.change(within(form).getByLabelText('Начало:'), { target: { value: '29022025' } })
    fireEvent.click(within(form).getByRole('button', { name: 'Сохранить' }))
    assert.equal(document.activeElement, within(form).getByLabelText('Начало:'))
    return form
  })

  const ids = forms.map((form) => {
    const start = within(form).getByLabelText<HTMLInputElement>('Начало:')
    const error = within(form).getByRole('alert')
    assert.equal(start.value, '29.02.2025')
    assert.equal(start.getAttribute('aria-describedby'), error.id)
    assert.equal(start.getAttribute('aria-invalid'), 'true')
    assert.equal(within(form).getByLabelText('Окончание:').getAttribute('aria-describedby'), null)
    return error.id
  })
  assert.notEqual(ids[0], ids[1])
  assert.equal(readTasks([]).length, 17)
})

it('edits cards in each column and keeps their status', () => {
  render(<BoardPage />)
  for (const name of ['In Progress', 'Review', 'Done']) {
    const column = screen.getByRole('region', { name })
    const card = within(column).getAllByRole('article')[0]
    assert.ok(card)
    fireEvent.click(within(card).getByRole('button', { name: /Редактировать/ }))
    const form = within(column).getByRole('form', { name: 'Редактирование задачи' })
    const start = within(form).getByLabelText<HTMLInputElement>('Начало:')
    start.select()
    fireEvent.paste(start, { clipboardData: { getData: () => '2023-01-02' } })
    assert.equal(start.value, '02.01.2023')
    fireEvent.change(within(form).getByLabelText('Описание:'), { target: { value: `Изменено в ${name}` } })
    fireEvent.click(within(form).getByRole('button', { name: 'Сохранить' }))
    assert.ok(within(column).getByRole('article', { name: `Изменено в ${name}` }))
  }
})

it('requires confirmation to remove a card', () => {
  render(<BoardPage />)
  const card = screen.getByRole('article', { name: originalTask })
  const confirmation = () => within(card).getByRole('group', { name: 'Удалить задачу?' })
  fireEvent.click(within(card).getByRole('button', { name: /Удалить задачу:/ }))
  assert.equal(readTasks([]).length, 17)
  fireEvent.click(within(confirmation()).getByRole('button', { name: 'Отмена' }))
  assert.ok(screen.getByRole('article', { name: originalTask }))

  fireEvent.click(within(card).getByRole('button', { name: /Удалить задачу:/ }))
  fireEvent.click(within(confirmation()).getByRole('button', { name: 'Удалить' }))
  assert.equal(screen.queryByRole('article', { name: originalTask }), null)
  assert.equal(readTasks([]).length, 16)
})

it('preserves an intentionally empty saved board', () => {
  assert.equal(writeTasks([]), true)
  render(<BoardPage />)

  assert.equal(screen.queryAllByRole('article').length, 0)
  assert.equal(screen.getAllByText('Нет задач').length, 4)
})

it('loads the fixture when stored data is invalid', () => {
  window.localStorage.setItem('kanban-board:tasks:v1', '{"unexpected":true}')
  render(<BoardPage />)

  assert.equal(screen.getAllByRole('article').length, 17)
})
