import { useRef } from 'react'
import { Icon } from '../ui/Icon'

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
    <div className="search" role="search">
      <span className="search__icon">
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
        <button className="icon-button search__clear" aria-label="Очистить поиск" type="button" onClick={clearSearch}>
          <Icon name="close" />
        </button>
      )}
    </div>
  )
}
