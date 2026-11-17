import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { Board } from './board/Board'
import { TaskSearch } from './board/TaskSearch'
import { startOfToday } from './tasks/dates'
import { groupTasks } from './tasks/select-tasks'
import type { Task, TaskFields } from './tasks/task'
import { useTasks } from './tasks/use-tasks'
import { useToday } from './tasks/use-today'

const TaskEditor = lazy(() => import('./board/TaskEditor'))

type EditorState = { task: Task | null } | null

export function App() {
  const { tasks, add, edit, move, remove, storageAvailable } = useTasks()
  const today = useToday()
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<EditorState>(null)
  const groups = useMemo(() => groupTasks(tasks, search), [tasks, search])
  const isSearching = search.trim().length > 0

  const openCreateEditor = useCallback(() => setEditor({ task: null }), [])
  const openEditEditor = useCallback((task: Task) => setEditor({ task }), [])

  function saveTask(fields: TaskFields) {
    if (editor?.task) edit(editor.task.id, fields)
    else add(fields)
  }

  return (
    <main className="workspace">
      <header className="workspace__header">
        <h1 lang="en">Your tasks</h1>
        <TaskSearch value={search} onChange={setSearch} />
      </header>
      {!storageAvailable && (
        <p className="workspace__storage-warning" role="status">
          Не удалось сохранить задачи в браузере. Изменения могут пропасть после перезагрузки.
        </p>
      )}
      <Board
        groups={groups}
        today={today}
        isSearching={isSearching}
        onAdd={openCreateEditor}
        onEdit={openEditEditor}
        onRemove={remove}
        onMove={move}
      />
      {editor && (
        <Suspense fallback={null}>
          <TaskEditor
            task={editor.task}
            today={startOfToday(today)}
            onSave={saveTask}
            onDismiss={() => setEditor(null)}
          />
        </Suspense>
      )}
    </main>
  )
}
