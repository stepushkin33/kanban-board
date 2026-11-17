import type { ComponentPropsWithRef } from 'react'
import styles from './IconButton.module.scss'

export function IconButton({ className, type = 'button', ...props }: ComponentPropsWithRef<'button'>) {
  return <button {...props} type={type} className={[styles.button, className].filter(Boolean).join(' ')} />
}
