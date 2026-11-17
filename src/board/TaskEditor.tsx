import { useEffect, useRef, useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { parseDateFieldValue, toDateFieldValue } from '../tasks/dates'
import { isTaskStatus, taskStatuses } from '../tasks/task'
import type { Task, TaskFields, TaskStatus } from '../tasks/task'
import { Icon } from '../ui/Icon'
import { columnTitles } from './columns'

interface TaskEditorProps {
  task: Task | null
  today: number
  onSave: (fields: TaskFields) => void
  onDismiss: () => void
}

export default function TaskEditor({ task, today, onSave, onDismiss }: TaskEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const initialStart = toDateFieldValue(task?.startDay ?? today)
  const initialEnd = toDateFieldValue(task?.endDay ?? today)
  const [text, setText] = useState(task?.text ?? '')
  const [type, setType] = useState<TaskStatus>(task?.type ?? 'todo')
  const [start, setStart] = useState(initialStart)
  const [end, setEnd] = useState(initialEnd)
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
      descriptionRef.current?.focus()
    }
  }, [])

  function closeEditor() {
    dialogRef.current?.close()
    onDismiss()
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return

    const bounds = event.currentTarget.getBoundingClientRect()
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      closeEditor()
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const startDay = parseDateFieldValue(start)
    const endDay = parseDateFieldValue(end)
    const description = text.trim()

    if (!description) {
      setError('Введите описание задачи.')
      descriptionRef.current?.focus()
      return
    }
    if (startDay === null || endDay === null || endDay < startDay) {
      setError('Укажите обе даты. Окончание не может быть раньше начала.')
      return
    }

    onSave({
      type,
      startDay: task && start === initialStart ? task.startDay : startDay,
      endDay: task && end === initialEnd ? task.endDay : endDay,
      text: description,
    })
    closeEditor()
  }

  return (
    <dialog
      ref={dialogRef}
      className="task-editor"
      aria-labelledby="editor-title"
      onClick={handleBackdropClick}
      onCancel={(event) => {
        event.preventDefault()
        closeEditor()
      }}
    >
      <form className="task-editor__form" onSubmit={submit} noValidate>
        <header className="task-editor__header">
          <h2 id="editor-title">{task ? 'Редактировать задачу' : 'Новая задача'}</h2>
          <button className="icon-button" aria-label="Закрыть" type="button" onClick={closeEditor}>
            <Icon name="close" />
          </button>
        </header>
        <label>
          Описание
          <textarea
            ref={descriptionRef}
            required
            rows={4}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <div className="task-editor__dates">
          <label>
            Начало
            <input type="date" required value={start} onChange={(event) => setStart(event.target.value)} />
          </label>
          <label>
            Окончание
            <input type="date" required min={start} value={end} onChange={(event) => setEnd(event.target.value)} />
          </label>
        </div>
        <label>
          Статус
          <select
            value={type}
            onChange={({ target }) => {
              if (isTaskStatus(target.value)) setType(target.value)
            }}
          >
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {columnTitles[status]}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p className="task-editor__error" role="alert">
            {error}
          </p>
        )}
        <footer className="task-editor__footer">
          <button className="editor-button" type="button" onClick={closeEditor}>
            Отмена
          </button>
          <button className="editor-button editor-button--primary" type="submit">
            Сохранить
          </button>
        </footer>
      </form>
    </dialog>
  )
}
