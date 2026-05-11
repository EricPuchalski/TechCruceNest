import { ChevronRight, Heart, ShoppingBag } from 'lucide-react'

import { formatPrice } from '../../utils/ui'
import type { Product } from '../../types/products/product'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
  isFavorite: boolean
  isPending: boolean
  onOpenDetail: (product: Product) => void
  onToggleFavorite: (product: Product) => void
}

function ProductCard({
  product,
  isFavorite,
  isPending,
  onOpenDetail,
  onToggleFavorite,
}: ProductCardProps) {
  function handleOpenDetail() {
    onOpenDetail(product)
  }

  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${product.name}`}
      onClick={handleOpenDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleOpenDetail()
        }
      }}
    >
      <button
        type="button"
        className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteButtonActive : ''}`}
        onClick={(event) => {
          event.stopPropagation()
          onToggleFavorite(product)
        }}
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        disabled={isPending}
      >
        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      <button
        type="button"
        className={styles.media}
        onClick={(event) => {
          event.stopPropagation()
          handleOpenDetail()
        }}
      >
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className={styles.placeholder}>
            <ShoppingBag size={28} />
          </div>
        )}
      </button>

      <div className={styles.content}>
        <div className={styles.meta}>
          <span>{product.store}</span>
        </div>

        <button
          type="button"
          className={`${styles.title} ${styles.titleButton}`}
          onClick={(event) => {
            event.stopPropagation()
            handleOpenDetail()
          }}
        >
          {product.name}
        </button>

        <strong className={styles.price}>
          {formatPrice(product.price, product.currency)}
        </strong>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.detailButton}
            onClick={(event) => {
              event.stopPropagation()
              handleOpenDetail()
            }}
          >
            Ver detalle
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
