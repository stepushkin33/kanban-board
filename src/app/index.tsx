import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BoardPage } from '@/pages/board'
import './styles/base.scss'

const root = document.getElementById('root')
if (!root) throw new Error('Root element missing')

createRoot(root).render(
  <StrictMode>
    <BoardPage />
  </StrictMode>,
)

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .register(new URL('service-worker.js', document.baseURI), { updateViaCache: 'none' })
    .catch((error: unknown) => console.warn('Не удалось подготовить офлайн-режим.', error))
}
