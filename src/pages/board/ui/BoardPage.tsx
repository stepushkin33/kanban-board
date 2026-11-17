import styles from './BoardPage.module.scss'
import { useEffect, useState } from 'react'
import { groupTasks, useTasks } from '@/entities/task'
import { TaskSearch, useTaskSearch } from '@/features/task-search'
import { useToday } from '@/shared/lib/calendar'
import { TaskBoard } from '@/widgets/task-board'

export function BoardPage() {
  const { tasks, add, edit, move, remove, storageAvailable } = useTasks()
  const today = useToday()
  const { search, query, updateSearch } = useTaskSearch()
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const groups = groupTasks(tasks, query)

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    return () => {
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
    }
  }, [])

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <div className={styles.title}>
          <h1 lang="en">Your tasks</h1>
          {!isOnline && (
            <span className={styles.offline} role="status">
              Офлайн
            </span>
          )}
        </div>
        <TaskSearch value={search} onChange={updateSearch} />
      </header>
      {!storageAvailable && (
        <p className={styles.warning} role="status">
          Не удалось сохранить задачи в браузере. Изменения могут пропасть после перезагрузки.
        </p>
      )}
      <TaskBoard
        groups={groups}
        today={today}
        isSearching={query.length > 0}
        onAdd={add}
        onEdit={edit}
        onRemove={remove}
        onMove={move}
      />
    </main>
  )
}
