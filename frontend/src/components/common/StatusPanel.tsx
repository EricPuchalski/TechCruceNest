import styles from './StatusPanel.module.css'

interface StatusPanelProps {
  message: string
}

function StatusPanel({ message }: StatusPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.spinner} />
      <p>{message}</p>
    </section>
  )
}

export default StatusPanel
