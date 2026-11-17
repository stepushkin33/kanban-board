import styles from './TaskDetails.module.scss'
import { formatTaskDate, toDateFieldValue } from '@/shared/lib/calendar'
import type { Task } from '../model/task'

export function TaskDetails({ task, nearDeadline = false }: { task: Task; nearDeadline?: boolean }) {
  return (
    <dl className={styles.root}>
      <div>
        <dt>Начало:</dt>
        <dd>
          <time dateTime={toDateFieldValue(task.startDay)}>{formatTaskDate(task.startDay)}</time>
        </dd>
      </div>
      <div className={styles.deadline} data-near={nearDeadline}>
        <dt>Окончание:</dt>
        <dd>
          <time dateTime={toDateFieldValue(task.endDay)}>{formatTaskDate(task.endDay)}</time>
        </dd>
      </div>
      <div className={styles.description}>
        <dt>Описание:</dt>
        <dd>{task.text}</dd>
      </div>
    </dl>
  )
}
