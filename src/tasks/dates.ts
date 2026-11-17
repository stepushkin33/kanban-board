const shortDatePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/
const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { timeZone: 'UTC' })

export function formatTaskDate(timestamp: number): string {
  return dateFormatter.format(timestamp)
}

export function toDateFieldValue(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

export function parseDateFieldValue(value: string): number | null {
  if (!isoDatePattern.test(value) || value.startsWith('0000')) return null

  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) && toDateFieldValue(timestamp) === value ? timestamp : null
}

export function parseDateQuery(query: string): string | null {
  const match = shortDatePattern.exec(query)
  if (!match) return null

  const [, day, month, year] = match
  const isoDate = `${year}-${month}-${day}`
  return parseDateFieldValue(isoDate) === null ? null : isoDate
}

export function startOfToday(now: Date): number {
  const date = new Date(0)
  date.setUTCFullYear(now.getFullYear(), now.getMonth(), now.getDate())
  return date.getTime()
}
