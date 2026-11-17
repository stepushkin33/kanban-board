import type { ComponentPropsWithRef, KeyboardEvent } from 'react'
import styles from './TaskDateInput.module.scss'
import { formatDateInput, formatPastedDate } from '@/shared/lib/calendar'

type TaskDateInputProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'value' | 'onChange' | 'onKeyDown'> & {
  value: string
  onChange: (value: string) => void
}

function skipSeparator({ currentTarget, key, altKey, ctrlKey, metaKey, shiftKey }: KeyboardEvent<HTMLInputElement>) {
  if (altKey || ctrlKey || metaKey || shiftKey) return

  const { selectionStart, selectionEnd, value } = currentTarget
  if (selectionStart === null || selectionStart !== selectionEnd) return

  if (key === 'Backspace' && value[selectionStart - 1] === '.') {
    currentTarget.setSelectionRange(selectionStart - 1, selectionStart - 1)
  } else if (key === 'Delete' && value[selectionStart] === '.') {
    currentTarget.setSelectionRange(selectionStart + 1, selectionStart + 1)
  }
}

export function TaskDateInput({ value, onChange, ...props }: TaskDateInputProps) {
  return (
    <input
      {...props}
      className={styles.input}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="дд.мм.гггг"
      value={value}
      onKeyDown={skipSeparator}
      onPaste={(event) => {
        const input = event.currentTarget
        if (input.selectionStart !== 0 || input.selectionEnd !== input.value.length) return

        event.preventDefault()
        onChange(formatPastedDate(event.clipboardData.getData('text')))
      }}
      onChange={({ currentTarget }) => {
        const raw = currentTarget.value
        const formatted = formatDateInput(raw)
        if (formatted !== raw) {
          const cursor = formatDateInput(raw.slice(0, currentTarget.selectionStart ?? raw.length)).length
          currentTarget.value = formatted
          currentTarget.setSelectionRange(cursor, cursor)
        }
        onChange(formatted)
      }}
    />
  )
}
