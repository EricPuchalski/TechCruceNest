import type { Product } from '../../types/products/product'
import ProductCard from './ProductCard'
import styles from './ProductGrid.module.css'

interface ProductGridProps {
  products: Product[]
  favoriteProductIds: Set<string>
  favoritePendingId: string
  onOpenDetail: (product: Product) => void
  onToggleFavorite: (product: Product) => void
}

function ProductGrid({
  products,
  favoriteProductIds,
  favoritePendingId,
  onOpenDetail,
  onToggleFavorite,
}: ProductGridProps) {
  return (
    <section className={styles.grid} aria-live="polite">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorite={favoriteProductIds.has(product.id)}
          isPending={favoritePendingId === product.id}
          onOpenDetail={onOpenDetail}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </section>
  )
}

export default ProductGrid
