import styles from './TaskSearch.module.scss'
import { useRef } from 'react'
import { Icon } from '@/shared/ui/icon'
import { IconButton } from '@/shared/ui/icon-button'

interface TaskSearchProps {
  value: string
  onChange: (value: string) => void
}

export function TaskSearch({ value, onChange }: TaskSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function clearSearch() {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={styles.root} role="search">
      <span className={styles.icon}>
        <Icon name="search" />
      </span>
      <input
        ref={inputRef}
        type="search"
        aria-label="Поиск по описанию или дате"
        title="Введите часть описания или дату в формате дд.мм.гггг"
        placeholder="поиск..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) clearSearch()
        }}
      />
      {value && (
        <IconButton className={styles.clear} aria-label="Очистить поиск" type="button" onClick={clearSearch}>
          <Icon name="close" />
        </IconButton>
      )}
    </div>
  )
}
