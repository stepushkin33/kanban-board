import { useCallback, useEffect, useState } from 'react'
import seedTasks from '../../tasks.json'
import { isTaskStatus } from './task'
import type { Task, TaskFields, TaskStatus } from './task'
import { readTasks, writeTasks } from './task-storage'

const initialTasks: Task[] = seedTasks.map((task) => ({
  ...task,
  type: parseStatus(task.type),
}))

function parseStatus(value: string): TaskStatus {
  if (!isTaskStatus(value)) throw new Error(`Invalid task status: ${value}`)
  return value
}

export function useTasks() {
  const [tasks, setTasks] = useState(() => readTasks(initialTasks))
  const [storageAvailable, setStorageAvailable] = useState(true)

  useEffect(() => {
    setStorageAvailable(writeTasks(tasks))
  }, [tasks])

  const add = useCallback((fields: TaskFields) => {
    setTasks((current) => {
      const ids = new Set(current.map(({ id }) => id))
      let id = 1
      while (ids.has(id)) id += 1

      return [...current, { id, ...fields }]
    })
  }, [])

  const edit = useCallback((id: number, changes: TaskFields) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...changes } : task)))
  }, [])

  const remove = useCallback((id: number) => {
    setTasks((current) => current.filter((task) => task.id !== id))
  }, [])

  const move = useCallback((id: number, type: TaskStatus) => {
    setTasks((current) => {
      const task = current.find((candidate) => candidate.id === id)
      if (!task || task.type === type) return current

      return current.map((candidate) => (candidate === task ? { ...task, type } : candidate))
    })
  }, [])

  return { tasks, add, edit, remove, move, storageAvailable }
}
