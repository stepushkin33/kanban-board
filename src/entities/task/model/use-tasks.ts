import { useEffect, useState } from 'react'
import seedTasks from '../../../../tasks.json'
import { taskListSchema } from './task'
import type { TaskDrop, TaskFields } from './task'
import { placeTask } from './task-order'
import { readTasks, writeTasks } from '../api/task-storage'

const initialTasks = taskListSchema.parse(seedTasks)

export function useTasks() {
  const [tasks, setTasks] = useState(() => readTasks(initialTasks))
  const [storageAvailable, setStorageAvailable] = useState(true)

  useEffect(() => {
    setStorageAvailable(writeTasks(tasks))
  }, [tasks])

  function add(fields: TaskFields) {
    setTasks((current) => {
      const ids = new Set(current.map(({ id }) => id))
      let id = 1
      while (ids.has(id)) id += 1

      return [...current, { id, ...fields }]
    })
  }

  function edit(id: number, changes: TaskFields) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...changes } : task)))
  }

  function remove(id: number) {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  function move(id: number, drop: TaskDrop) {
    setTasks((current) => placeTask(current, id, drop))
  }

  return { tasks, add, edit, remove, move, storageAvailable }
}
