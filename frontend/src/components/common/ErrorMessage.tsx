import styles from './ErrorMessage.module.css'

interface ErrorMessageProps {
  message: string
}

function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) {
    return null
  }

  return <p className={`${styles.message} ${styles.error}`}>{message}</p>
}

export default ErrorMessage
