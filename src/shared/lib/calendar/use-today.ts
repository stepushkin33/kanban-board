import { useEffect, useState } from 'react'

export function useToday(): Date {
  const [today, setToday] = useState(() => new Date())

  useEffect(() => {
    let timer: number

    function update() {
      window.clearTimeout(timer)
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      setToday((previous) => (previous.toDateString() === now.toDateString() ? previous : now))
      timer = window.setTimeout(update, midnight.getTime() - now.getTime())
    }

    update()
    window.addEventListener('focus', update)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', update)
    }
  }, [])

  return today
}
