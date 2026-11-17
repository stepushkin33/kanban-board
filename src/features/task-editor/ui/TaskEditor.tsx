import styles from './TaskEditor.module.scss'
import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { formatTaskDate, parseDateQuery, startOfToday, toDateFieldValue } from '@/shared/lib/calendar'
import { isTaskOverdue } from '@/entities/task'
import type { Task, TaskFields } from '@/entities/task'
import { Icon } from '@/shared/ui/icon'
import { TaskDateInput } from './TaskDateInput'

interface TaskEditorProps {
  task?: Task
  today: Date
  onSave: (fields: TaskFields) => void
  onDismiss: () => void
}

export function TaskEditor({ task, today, onSave, onDismiss }: TaskEditorProps) {
  const errorId = useId()
  const startInput = useRef<HTMLInputElement>(null)
  const endInput = useRef<HTMLInputElement>(null)
  const descriptionInput = useRef<HTMLTextAreaElement>(null)
  const [start, setStart] = useState(() => formatTaskDate(task?.startDay ?? startOfToday(today)))
  const [end, setEnd] = useState(() => formatTaskDate(task?.endDay ?? startOfToday(today)))
  const [text, setText] = useState(task?.text ?? '')
  const [error, setError] = useState<{ field: 'start' | 'end' | 'text'; message: string } | null>(null)

  useEffect(() => {
    startInput.current?.focus()
    startInput.current?.select()
  }, [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const startDate = parseDateQuery(start.trim())
    const endDate = parseDateQuery(end.trim())
    const description = text.trim()

    if (!startDate) {
      setError({ field: 'start', message: 'Укажите дату начала в формате дд.мм.гггг.' })
      startInput.current?.focus()
      return
    }
    if (!endDate || endDate < startDate) {
      setError({
        field: 'end',
        message: endDate ? 'Окончание не может быть раньше начала.' : 'Укажите дату окончания в формате дд.мм.гггг.',
      })
      endInput.current?.focus()
      return
    }
    if (!description) {
      setError({ field: 'text', message: 'Введите описание задачи.' })
      descriptionInput.current?.focus()
      return
    }

    onSave({
      type: task?.type ?? 'todo',
      startDay: task && toDateFieldValue(task.startDay) === startDate ? task.startDay : Date.parse(startDate),
      endDay: task && toDateFieldValue(task.endDay) === endDate ? task.endDay : Date.parse(endDate),
      text: description,
    })
  }

  return (
    <form
      className={styles.root}
      data-overdue={task && isTaskOverdue(task, today)}
      aria-label={task ? 'Редактирование задачи' : 'Новая задача'}
      onSubmit={submit}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onDismiss()
        }
      }}
      noValidate
    >
      <div className={styles.fields}>
        <label className={styles.field}>
          <span>Начало:</span>
          <TaskDateInput
            ref={startInput}
            aria-invalid={error?.field === 'start'}
            aria-describedby={error?.field === 'start' ? errorId : undefined}
            value={start}
            onChange={(value) => {
              setStart(value)
              setError(null)
            }}
            required
          />
        </label>
        <label className={styles.field}>
          <span>Окончание:</span>
          <TaskDateInput
            ref={endInput}
            aria-invalid={error?.field === 'end'}
            aria-describedby={error?.field === 'end' ? errorId : undefined}
            value={end}
            onChange={(value) => {
              setEnd(value)
              setError(null)
            }}
            required
          />
        </label>
        <label className={styles.field}>
          <span>Описание:</span>
          <textarea
            className={styles.description}
            ref={descriptionInput}
            rows={1}
            aria-invalid={error?.field === 'text'}
            aria-describedby={error?.field === 'text' ? errorId : undefined}
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setError(null)
            }}
            required
          />
        </label>
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error.message}
        </p>
      )}
      <div className={styles.actions}>
        <button className={styles.button} aria-label="Отмена" title="Отмена" type="button" onClick={onDismiss}>
          <Icon name="close" />
        </button>
        <button className={`${styles.button} ${styles.save}`} aria-label="Сохранить" title="Сохранить" type="submit">
          <Icon name="check" />
        </button>
      </div>
    </form>
  )
}
