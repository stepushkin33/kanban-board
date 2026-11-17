import styles from './BoardPage.module.scss'
import { groupTasks, useTasks } from '@/entities/task'
import { TaskSearch, useTaskSearch } from '@/features/task-search'
import { useToday } from '@/shared/lib/calendar'
import { TaskBoard } from '@/widgets/task-board'

export function BoardPage() {
  const { tasks, add, edit, move, remove } = useTasks()
  const today = useToday()
  const { search, query, updateSearch } = useTaskSearch()
  const groups = groupTasks(tasks, query)

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <h1 lang="en">Your tasks</h1>
        <TaskSearch value={search} onChange={updateSearch} />
      </header>
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
