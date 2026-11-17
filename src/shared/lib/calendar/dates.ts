const shortDatePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/
const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/
const separatedDatePattern = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/

export function formatTaskDate(timestamp: number): string {
  const [year, month, day] = toDateFieldValue(timestamp).split('-')
  return `${day}.${month}.${year}`
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

export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('.')
}

export function formatPastedDate(value: string): string {
  const isoDate = isoDatePattern.exec(value.trim())
  if (isoDate) return `${isoDate[3]}.${isoDate[2]}.${isoDate[1]}`

  const separatedDate = separatedDatePattern.exec(value.trim())
  if (separatedDate) {
    const [, day = '', month = '', year] = separatedDate
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`
  }

  return formatDateInput(value)
}

export function startOfToday(now: Date): number {
  const date = new Date(0)
  date.setUTCFullYear(now.getFullYear(), now.getMonth(), now.getDate())
  return date.getTime()
}
