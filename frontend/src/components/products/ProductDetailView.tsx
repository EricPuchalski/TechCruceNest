import { ArrowLeft, ExternalLink, Heart, ShoppingBag, Store } from 'lucide-react'

import { formatDate, formatPrice } from '../../utils/ui'
import type { Product } from '../../types/products/product'
import cardStyles from './ProductCard.module.css'
import PriceHistoryChart from './PriceHistoryChart'
import styles from './ProductDetailView.module.css'

interface ProductDetailViewProps {
  product: Product
  isFavorite: boolean
  isPendingFavorite: boolean
  onBack: () => void
  onToggleFavorite: (product: Product) => void
}

function ProductDetailView({
  product,
  isFavorite,
  isPendingFavorite,
  onBack,
  onToggleFavorite,
}: ProductDetailViewProps) {
  return (
    <section className={styles.detail} aria-labelledby="product-detail-title">
      <div className={styles.topbar}>
        <button type="button" className="secondary-button" onClick={onBack}>
          <ArrowLeft size={16} />
          Volver al catalogo
        </button>
        <span className={styles.heading}>Historial de precio</span>
      </div>

      <div className={styles.hero}>
        <div className={styles.imagePanel}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} loading="eager" />
          ) : (
            <div className={styles.placeholder}>
              <ShoppingBag size={44} />
            </div>
          )}
        </div>

        <div className={styles.summary}>
          <div className={styles.meta}>
            <span className={styles.storeChip}>
              <Store size={16} />
              {product.store}
            </span>
            <span>Actualizado {formatDate(product.updatedAt)}</span>
          </div>

          <h1 id="product-detail-title">{product.name}</h1>

          <strong className={styles.price}>
            {formatPrice(product.price, product.currency)}
          </strong>

          <div className={styles.ctaGroup}>
            <a
              className="primary-button"
              href={product.productUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver producto en {product.store}
              <ExternalLink size={16} />
            </a>

            <button
              type="button"
              className={`${cardStyles.favoriteButton} ${cardStyles.favoriteButtonDetail} ${
                isFavorite ? cardStyles.favoriteButtonActive : ''
              }`}
              onClick={() => onToggleFavorite(product)}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              disabled={isPendingFavorite}
            >
              <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className={styles.stats}>
            <div>
              <span>Primer registro</span>
              <strong>{formatDate(product.createdAt)}</strong>
            </div>
            <div>
              <span>Registros de precio</span>
              <strong>{product.priceHistory.length}</strong>
            </div>
            <div>
              <span>Estado actual</span>
              <strong>{product.active ? 'Disponible' : 'Sin stock'}</strong>
            </div>
          </div>
        </div>
      </div>

      <PriceHistoryChart history={product.priceHistory} currency={product.currency} />
    </section>
  )
}

export default ProductDetailView
