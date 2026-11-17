import { useEffect, useState } from 'react'

const searchDelay = 250

export function useTaskSearch() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const trimmedSearch = search.trim()
    if (!trimmedSearch) return

    const timer = window.setTimeout(() => setQuery(trimmedSearch), searchDelay)
    return () => window.clearTimeout(timer)
  }, [search])

  function updateSearch(value: string) {
    setSearch(value)
    if (!value.trim()) setQuery('')
  }

  return { search, query, updateSearch }
}
