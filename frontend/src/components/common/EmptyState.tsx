import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className={styles.emptyState}>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </section>
  )
}

export default EmptyState
