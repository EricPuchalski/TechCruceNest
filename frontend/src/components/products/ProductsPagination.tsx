import { ArrowRight } from 'lucide-react'
import styles from './ProductsPagination.module.css'

interface ProductsPaginationProps {
  pageNumber: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
}

function ProductsPagination({
  pageNumber,
  totalPages,
  onPrevious,
  onNext,
}: ProductsPaginationProps) {
  return (
    <div className={styles.pagination}>
      <button
        type="button"
        className="secondary-button"
        onClick={onPrevious}
        disabled={pageNumber === 0}
      >
        Anterior
      </button>

      <span>
        Pagina {pageNumber + 1}
        {totalPages > 0 ? ` de ${totalPages}` : ''}
      </span>

      <button
        type="button"
        className="secondary-button"
        onClick={onNext}
        disabled={pageNumber + 1 >= totalPages}
      >
        Siguiente
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

export default ProductsPagination
