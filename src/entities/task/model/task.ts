import { z } from 'zod'

export const taskStatuses = ['todo', 'in_progress', 'review', 'done'] as const

export const taskStatusSchema = z.enum(taskStatuses)

const taskTimestampSchema = z.number().min(Date.parse('0001-01-01')).max(Date.parse('9999-12-31T23:59:59.999Z'))

export const taskSchema = z.object({
  id: z.int(),
  type: taskStatusSchema,
  startDay: taskTimestampSchema,
  endDay: taskTimestampSchema,
  text: z.string(),
  position: z.int().nonnegative().optional(),
})

export const taskListSchema = z
  .array(taskSchema)
  .refine((tasks) => new Set(tasks.map(({ id }) => id)).size === tasks.length, 'Task IDs must be unique')

export type TaskStatus = z.infer<typeof taskStatusSchema>
export type Task = z.infer<typeof taskSchema>

export type TaskFields = Omit<Task, 'id' | 'position'>

export interface TaskDrop {
  type: TaskStatus
  relativeTo?: { id: number; after: boolean }
}
